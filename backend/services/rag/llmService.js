import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import { config } from "./config.js";

let _ai;
const client = () => (_ai ??= new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
}));
export function _setClient(fake) {
  _ai = fake;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Global 403 / permanent-failure short-circuit: once Google denies, stop retrying for N minutes to avoid spam
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
export function getFuseStatus() {
  return {
    isBlown: isFuseBlown(),
    blownUntil: _fuse.blownUntil,
    lastMsg: _fuse.lastMsg,
  };
}
function blowFuse(msg) {
  if (!_fuse.blownUntil) {
    console.warn(`🔥 [LLM FUSE BLOWN for 5 minutes] ${msg} — no further LLM/embedding calls will be attempted until cooldown expires.`);
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
  _ai = null;
}

export async function generateText(prompt, { system, json = false, maxOutputTokens, thinkingLevel = config.thinkingLevel, silent = false } = {}) {
  if (isFuseBlown()) {
    throw new Error(`LLM short-circuited (5min cooldown): ${_fuse.lastMsg}`);
  }
  const cfg = {};
  if (system) cfg.systemInstruction = system;
  if (json) cfg.responseMimeType = "application/json";
  if (maxOutputTokens) cfg.maxOutputTokens = maxOutputTokens;
  if (thinkingLevel) cfg.thinkingConfig = { thinkingLevel };
  if (config.temperature !== undefined) cfg.temperature = config.temperature;

  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await client().models.generateContent({ model: config.llmModel, contents: prompt, config: cfg });
      const raw = typeof response.text === "function" ? response.text() : response.text;
      return (raw || "").trim();
    } catch (err) {
      lastErr = err;
      const msg = String(err?.message || "");
      if (isPermanentFailure(msg)) {
        blowFuse(msg.split("\n")[0].slice(0, 200));
        break;
      }
      const transient = /429|500|503|504|rate|quota|unavailable|deadline|timeout|fetch failed|ECONNRESET|ENOTFOUND/i.test(msg);
      if (!transient || attempt === 2) break;
      await sleep(800 * 2 ** attempt);
    }
  }
  throw new Error(`LLM generation failed: ${lastErr?.message || lastErr}`);
}

export async function generateJson(prompt, { system, retries = 1, maxOutputTokens, thinkingLevel = "low" } = {}) {
  if (isFuseBlown()) {
    throw new Error(`LLM short-circuited (5min cooldown): ${_fuse.lastMsg}`);
  }
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      const raw = await generateText(prompt, { system, json: true, maxOutputTokens, thinkingLevel });
      return JSON.parse(raw.replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, "").trim());
    } catch (err) {
      lastErr = err;
      if (isPermanentFailure(String(err?.message || ""))) break;
    }
  }
  throw new Error(`LLM JSON generation failed: ${lastErr?.message || lastErr}`);
}

export default { generateText, generateJson };
