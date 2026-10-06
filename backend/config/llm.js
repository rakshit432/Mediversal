// config.js — every tunable in one place. All values can be overridden with env vars.
import "dotenv/config";

const num = (v, d) => (v === undefined || v === "" || Number.isNaN(Number(v)) ? d : Number(v));
const flag = (v, d) => (v === undefined || v === "" ? d : !/^(0|false|off|no)$/i.test(String(v)));

const normalizeEmbeddingModel = (raw) => {
  if (!raw) return "gemini-embedding-2";
  const m = String(raw).trim().toLowerCase();
  if (!m || m === "text-embedding-004") return "gemini-embedding-2";
  return raw;
};

const normalizeLlmModel = (raw) => {
  if (!raw) return "gemini-3.8-flash";
  const m = String(raw).trim();
  if (!m || m === "gemini-2.5-flash" || m === "gemini-2.0-flash") return "gemini-3.8-flash";
  return m;
};

const _rawEmbedding = process.env.EMBEDDING_MODEL || process.env.GEMINI_EMBEDDING_MODEL;
const _rawLlm = process.env.GEMINI_MODEL || process.env.LLM_MODEL;

export const config = {
  // ---- embeddings (Gemini API) -------------------------------------------
  // gemini-embedding-2: no task_type parameter; the task is expressed as a text prefix (see embeddingService).
  embeddingModel: normalizeEmbeddingModel(_rawEmbedding),
  embeddingDim: num(process.env.EMBEDDING_DIM, 768), // supported: 128-3072, recommended 768 / 1536 / 3072
  embeddingBatchSize: num(process.env.EMBEDDING_BATCH_SIZE, 16),

  // ---- generation ---------------------------------------------------------
  // Gemini 3.x ignores temperature/top_p/top_k; use GEMINI_THINKING_LEVEL (LOW | MEDIUM | HIGH) instead.
  llmModel: normalizeLlmModel(_rawLlm),
  thinkingLevel: process.env.GEMINI_THINKING_LEVEL || "",
  temperature: process.env.GEMINI_TEMPERATURE === undefined ? undefined : num(process.env.GEMINI_TEMPERATURE, undefined), // only for 2.x models

  // ---- chunking -----------------------------------------------------------
  chunkSize: num(process.env.CHUNK_SIZE, 800), // characters
  chunkOverlap: num(process.env.CHUNK_OVERLAP, 100),

  // ---- retrieval ----------------------------------------------------------
  enableRouter: flag(process.env.RAG_ENABLE_ROUTER, true), // LLM query rewrite + routing (1 small call)
  enableRerank: flag(process.env.RAG_ENABLE_RERANK, true), // LLM reranker (1 small call)
  candidatePool: num(process.env.RAG_CANDIDATE_POOL, 24), // fused candidates handed to the reranker
  defaultTopK: num(process.env.RAG_TOP_K, 6), // passages placed in the answer context
  maxParentChars: num(process.env.RAG_MAX_PARENT_CHARS, 3500),
  maxLabsInContext: num(process.env.RAG_MAX_LABS, 60),
};

// Tag stored with every vector so vectors from different models/dimensions are never compared.
export const embeddingTag = () => `${config.embeddingModel}:${config.embeddingDim}`;