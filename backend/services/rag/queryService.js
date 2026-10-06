import "dotenv/config";
import { retrieveContext, formatContextForPrompt } from "./retrievalService.js";
import { generateText } from "./llmService.js";
import { config } from "./config.js";

const SYSTEM = `You are a clinical documentation assistant for Mediversal. A doctor is asking about ONE patient. Answer using ONLY the patient records supplied in the user message.

Strict rules:
1. Use only facts present in the records. Never infer, estimate or invent values, diagnoses, medications, procedures or dates.
2. Quote lab values exactly as written, with units and reference ranges. Do not recalculate; use the TREND lines as provided.
3. Attach the date and the source label to every finding, e.g. "LDL 155 mg/dL (HIGH; reference <100), 2026-09-12 [L1]". Labels: L = lab result, T = trend, S = report summary, P = report excerpt.
4. When findings come from several dates, say which is the most recent. "Latest" or "current" means the most recent date present in the records.
5. If records disagree, show both versions with dates and sources; do not pick one silently.
6. A lab row marked UNVERIFIED must be reported as needing confirmation against the original report.
7. If the records do not contain the answer, say exactly: "The provided medical reports do not contain information regarding [topic]." Do not guess. If only part of the question is answered, answer that part and state what is missing.
8. Write for a physician: lead with the direct answer, then the supporting details. Be concise. Do not add diagnoses or treatment recommendations that are not in the reports.`;

const NO_REPORTS = "No medical reports have been uploaded for this patient yet.";
const PROCESSING = "The patient's medical reports are currently being processed. Please try again in a few moments once ingestion is complete.";
const NOT_FOUND = "No relevant information could be found in the patient's reports for your query.";

/**
 * Executes a grounded clinical query over a patient's medical reports.
 *
 * @param {Object} params
 * @param {string} params.patientId - Target patient ObjectId
 * @param {string} params.query - Doctor's natural language question
 * @param {number} [params.topK=6] - Report excerpts placed in the answer context
 * @param {{role: "user"|"assistant", text: string}[]} [params.history] - Earlier turns, used to resolve follow-ups
 * @returns {Promise<{ success: boolean, answer: string, sources: Array, isProcessing?: boolean, hasReports?: boolean }>}
 */
export async function queryPatientReports({ patientId, query, topK = config.defaultTopK, history = [] }) {
  if (!patientId) throw new Error("patientId is required to query reports");
  if (!query || !query.trim()) throw new Error("query text cannot be empty");

  let ctx;
  try {
    ctx = await retrieveContext({ patientId, query: query.trim(), topK, history });
  } catch (err) {
    console.error("Retrieval pipeline error:", err);
    return {
      success: true,
      answer: `⚠️ The clinical retrieval engine encountered an error (${err.message || "internal error"}). Please try again in a moment, or check the patient's reports directly.`,
      sources: [],
      totalRetrieved: 0,
      route: null,
      warnings: [`Retrieval failed: ${err.message || "unknown error"}`],
      degraded: true,
      hasReports: true,
      isProcessing: false,
    };
  }

  const hasEvidence = ctx.labs.length || ctx.passages.length || ctx.summaries.length;
  if (!hasEvidence) {
    if (ctx.isProcessing) {
      return { success: true, answer: PROCESSING, sources: [], hasReports: true, isProcessing: true };
    }
    if (!ctx.hasReports) {
      return { success: true, answer: NO_REPORTS, sources: [], hasReports: false, isProcessing: false };
    }
    return { success: true, answer: NOT_FOUND, sources: [], hasReports: true, isProcessing: false };
  }

  const { text: contextText, sources, fallbackText } = formatContextForPrompt(ctx);
  const prompt = `PATIENT RECORDS
${contextText}

DOCTOR'S QUESTION
"${query.trim()}"

Provide your answer:`;

  try {
    const answer = (await generateText(prompt, { system: SYSTEM, maxOutputTokens: 1000 })) || "Unable to generate an answer from the clinical context.";
    return {
      success: true,
      answer,
      sources,
      totalRetrieved: sources.length,
      route: ctx.route?.intent,
      warnings: ctx.warnings,
      hasReports: true,
      isProcessing: ctx.isProcessing,
    };
  } catch (error) {
    const msg = String(error?.message || "LLM service error");
    const isShortCircuit = /short-circuited/i.test(msg);
    if (!isShortCircuit) console.warn("[RAG] AI synthesis unavailable:", msg.split("\n")[0].slice(0, 200));
    const fallbackMsg = `⚠️ AI synthesis unavailable (${msg}). Showing raw retrieved findings from the patient reports below:\n\n${fallbackText || contextText}`;
    return {
      success: true,
      answer: fallbackMsg,
      sources,
      totalRetrieved: sources.length,
      route: ctx.route?.intent,
      warnings: [
        ...(ctx.warnings || []),
        `AI synthesis degraded: ${msg}. Raw findings shown instead.`,
      ],
      degraded: true,
      hasReports: true,
      isProcessing: ctx.isProcessing,
    };
  }
}

export default { queryPatientReports };