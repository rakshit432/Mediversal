import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import { config } from "./config.js";

/**
 * Text / JSON generation with Gemini via @google/genai.
 * Gemini 3.x ignores temperature; set GEMINI_THINKING_LEVEL (LOW | MEDIUM | HIGH) to trade
 * speed for reasoning. For 2.x models you may set GEMINI_TEMPERATURE.
 */

let _ai;
const client = () => (_ai ??= new GoogleGenAI({
  googleApiKey: process.env.GEMINI_API_KEY,
  apiVersion: 'v1',
}));
/** Test hook: inject a fake client. */
export function _setClient(fake) {
  _ai = fake;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function generateText(prompt, { system, json = false, maxOutputTokens, thinkingLevel = config.thinkingLevel } = {}) {
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
      // @google/genai: response.text is a getter (string); tolerate a function for older builds
      const raw = typeof response.text === "function" ? response.text() : response.text;
      return (raw || "").trim();
    } catch (err) {
      lastErr = err;
      const transient = /429|500|503|504|rate|quota|unavailable|deadline|timeout|fetch failed|ECONNRESET/i.test(String(err?.message));
      if (!transient || attempt === 2) break;
      await sleep(800 * 2 ** attempt);
    }
  }
  throw new Error(`LLM generation failed: ${lastErr?.message || lastErr}`);
}

export async function generateJson(prompt, { system, retries = 1 } = {}) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      const raw = await generateText(prompt, { system, json: true });
      return JSON.parse(raw.replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, "").trim());
    } catch (err) {
      lastErr = err;
    }
  }
  throw new Error(`LLM JSON generation failed: ${lastErr?.message || lastErr}`);
}

export default { generateText, generateJson };