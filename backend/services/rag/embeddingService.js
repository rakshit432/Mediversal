import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import { config, embeddingTag } from "./config.js";

/**
 * Embeddings with gemini-embedding-2 (replacement for the shut-down text-embedding-004).
 *
 * Facts this file relies on (Gemini API docs, "Embeddings"):
 *  - task_type is NOT supported for gemini-embedding-2. The task goes in the text itself:
 *      query:    "task: search result | query: {text}"
 *      document: "title: {title} | text: {text}"      (title: none when there is no title)
 *  - A plain array of strings would be AGGREGATED into ONE embedding. To get one embedding per
 *    text, every text must be wrapped in its own Content object ({ parts: [{ text }] }).
 *  - outputDimensionality (128-3072) truncates the vector; gemini-embedding-2 re-normalizes it.
 *  - Vectors from other models (text-embedding-004, gemini-embedding-001) are NOT comparable.
 */

let _ai;
const client = () => (_ai ??= new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
}));
/** Test hook: inject a fake client. */
export function _setClient(fake) {
  _ai = fake;
}

export { embeddingTag };
const MAX_INPUT_CHARS = 24000; // ~6k tokens, safely under the 8,192-token input limit

export const formatQuery = (text) => `task: search result | query: ${String(text).trim()}`;
export const formatDocument = (text, title) => `title: ${title?.toString().trim() || "none"} | text: ${String(text).trim()}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Fuse pattern: match llmService.js 5-minute short-circuit on permanent failures (403, key error)
const _fuse = {
  blownUntil: 0,
  lastMsg: null,
  TTL_MS: 5 * 60 * 1000,
};
export function isFuseBlown() {
  if (_fuse.blownUntil && Date.now() < _fuse.blownUntil) return true;
  if (_fuse.blownUntil && Date.now() >= _fuse.blownUntil) {
    _fuse.blownUntil = 0;
    _fuse.lastMsg = null;
  }
  return false;
}
function blowFuse(msg) {
  if (!_fuse.blownUntil) {
    console.warn(`🔥 [EMBEDDING FUSE BLOWN for 5 minutes] ${msg} — no further embedding calls will be attempted until cooldown expires.`);
  }
  _fuse.blownUntil = Date.now() + _fuse.TTL_MS;
  _fuse.lastMsg = msg;
}
function isPermanentFailure(errMsg = "") {
  const s = String(errMsg || "");
  return /403|PERMISSION_DENIED|denied access|API_KEY_INVALID|API_KEY_NOT_FOUND|INVALID_ARGUMENT|UNAUTHENTICATED|ACCESS_TOKEN_TYPE_UNSUPPORTED/i.test(s);
}
export function _resetFuse() {
  _fuse.blownUntil = 0;
  _fuse.lastMsg = null;
}

export function isValidVector(v) {
  return Array.isArray(v) && v.length === config.embeddingDim && v.some((x) => typeof x === "number" && !Number.isNaN(x) && x !== 0);
}

async function withRetry(fn, label) {
  if (isFuseBlown()) {
    throw new Error(`Embedding short-circuited (5min cooldown): ${_fuse.lastMsg}`);
  }
  let lastErr;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const msg = String(err?.message || err);
      if (isPermanentFailure(msg)) {
        blowFuse(msg.split("\n")[0].slice(0, 200));
        break;
      }
      const transient = /429|500|503|504|rate|quota|unavailable|deadline|timeout|fetch failed|ECONNRESET|ENOTFOUND/i.test(msg);
      if (!transient || attempt === 3) break;
      await sleep(500 * 2 ** attempt);
    }
  }
  throw new Error(`${label}: ${lastErr?.message || lastErr}`);
}

async function embedContents(strings) {
  const response = await client().models.embedContent({
    model: config.embeddingModel,
    // one Content object per text => one embedding per text (see aggregation note above)
    contents: strings.map((s) => ({ parts: [{ text: s.slice(0, MAX_INPUT_CHARS) }] })),
    config: { outputDimensionality: config.embeddingDim },
  });
  return (response.embeddings || []).map((e) => e.values);
}

/**
 * Embeds one already-formatted string.
 */
async function embedOne(formatted) {
  const [v] = await withRetry(() => embedContents([formatted]), "Failed to generate embedding");
  if (!isValidVector(v)) throw new Error("Invalid embedding response structure from Gemini API");
  return v;
}

/**
 * Generates an embedding for a search query.
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export async function embedQuery(text) {
  if (!text || !String(text).trim()) {
    throw new Error("Text must be a non-empty string to generate embedding");
  }
  if (isFuseBlown()) {
    throw new Error(`Embedding generation unavailable (cooldown active): ${_fuse.lastMsg}`);
  }
  return embedOne(formatQuery(text));
}

/**
 * Generates embeddings for many queries (used for query expansion).
 */
export async function embedQueries(texts) {
  if (!Array.isArray(texts) || texts.length === 0) return [];
  if (isFuseBlown()) {
    throw new Error(`Query embedding unavailable (cooldown active): ${_fuse.lastMsg}`);
  }
  return embedFormatted(texts.map(formatQuery));
}

/**
 * Generates one embedding per document chunk, in batches.
 * @param {(string | { text: string, title?: string })[]} items
 * @returns {Promise<number[][]>} vectors in the same order as `items`
 */
export async function embedDocuments(items) {
  if (!Array.isArray(items) || items.length === 0) return [];
  if (isFuseBlown()) {
    throw new Error(`Document embedding unavailable (cooldown active): ${_fuse.lastMsg}`);
  }
  const formatted = items.map((it) => {
    const text = typeof it === "string" ? it : it?.text;
    const title = typeof it === "string" ? undefined : it?.title;
    return (text || "").trim() ? formatDocument(text, title) : null;
  });
  return embedFormatted(formatted);
}

async function embedFormatted(formatted) {
  const out = new Array(formatted.length);
  const size = Math.max(1, config.embeddingBatchSize);

  for (let start = 0; start < formatted.length; start += size) {
    const idxs = [];
    for (let i = start; i < Math.min(start + size, formatted.length); i++) {
      if (formatted[i] == null) {
        out[i] = null;
      } else {
        idxs.push(i);
      }
    }
    if (idxs.length) {
      let vectors = [];
      try {
        vectors = await withRetry(() => embedContents(idxs.map((i) => formatted[i])), "Failed to embed batch");
      } catch (err) {
        if (isPermanentFailure(String(err?.message || ""))) {
          throw err;
        }
        console.warn("[Embedding] batch call failed, retrying one by one:", err.message);
      }
      if (vectors.length === idxs.length && vectors.every(isValidVector)) {
        idxs.forEach((i, k) => (out[i] = vectors[k]));
      } else {
        // Batch returned the wrong number of vectors (or failed): fall back to single calls
        for (const i of idxs) {
          out[i] = await embedOne(formatted[i]);
        }
      }
    }
    if (start + size < formatted.length) await sleep(80); // light throttle between batches
  }
  return out;
}

/**
 * Cosine similarity between two numeric vectors, in [-1, 1].
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || !Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length !== vecB.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export default { embedQuery, embedQueries, embedDocuments, cosineSimilarity, isValidVector, isFuseBlown, embeddingTag, formatQuery, formatDocument };