import mongoose from "mongoose";
import medicalReportModel from "../../models/medicalReportModel.js";
import reportChunkModel from "../../models/reportChunkModel.js";
import reportSectionModel from "../../models/reportsectionModel.js";
import labResultModel from "../../models/labResultModel.js";
import { embedQueries } from "./embeddingService.js";
import { generateJson } from "./llmService.js";
import { config, embeddingTag } from "./config.js";
import {
  rrfFuse, cosine, bm25Rank, tokenize, summarizeTrend, testKeyFor, escapeRegex,
  windowAround, toISODate, truncate, extractMentionedTests,
} from "./ragUtils.js";

/**
 * Retrieval pipeline (patient-isolated):
 *
 *   0. report status            -> hasReports / isProcessing
 *   1. route + rewrite (LLM)    -> intent, standalone question, search queries, test names, dates
 *   2a. LAB branch              -> exact structured values + computed trends
 *   2b. TEXT branch             -> vector (per query) + BM25 (per query) -> RRF -> rerank (LLM)
 *                                  -> parent-section expansion
 *   2c. SUMMARY branch          -> latest report summaries
 *   3. context object           -> consumed by queryService (or by retrieveRelevantChunks for legacy callers)
 */

const oid = (id) => new mongoose.Types.ObjectId(String(id));
const INTENTS = ["lab_lookup", "lab_trend", "abnormal_overview", "narrative", "summary", "mixed"];
const LAB_INTENTS = new Set(["lab_lookup", "lab_trend", "abnormal_overview"]);

// ---------------------------------------------------------------------------
// 1. Routing + query rewriting
// ---------------------------------------------------------------------------
const ROUTE_PROMPT = () => `TASK: ROUTE_QUERY
A doctor is asking a question about ONE patient's medical reports. Return JSON only:
{
  "intent": "lab_lookup" | "lab_trend" | "abnormal_overview" | "narrative" | "summary" | "mixed",
  "standaloneQuery": "the question rewritten so it is understandable without the chat history",
  "searchQueries": ["up to 3 short keyword-style queries for searching the reports"],
  "testNames": ["standard English lab test or panel names mentioned, e.g. LDL Cholesterol, HbA1c, Lipid Profile"],
  "dateFrom": "YYYY-MM-DD" or null,
  "dateTo": "YYYY-MM-DD" or null,
  "wantsLatest": true | false
}
Intents: lab_lookup = a specific lab value; lab_trend = change over time or comparison of values; abnormal_overview = which results are out of range;
narrative = findings, impression, diagnosis, medications, advice, history; summary = overview of a report, visit or admission; mixed = needs both numbers and notes.
Rules:
- Expand clinical shorthand in searchQueries: keep the abbreviation AND the full term (e.g. "HTN hypertension blood pressure", "Hb hemoglobin").
- wantsLatest = true when the doctor asks for the latest / current / most recent status.
- Use dates only when the question states or clearly implies them. Today is ${new Date().toISOString().slice(0, 10)}; resolve relative dates ("last 6 months").
- Never answer the question here.`;

export function heuristicRoute(question) {
  const q = String(question || "").toLowerCase();
  const testNames = extractMentionedTests(question);
  let intent = testNames.length ? "lab_lookup" : "mixed";
  if (/\b(trend|improv|worse|worsen|chang(e|ed|es)|compar(e|ed|ison)|over time|history of|progress)\b/.test(q)) {
    intent = "lab_trend";
  } else if (/\b(abnormal|out of range|elevated|raised|concerning)\b/.test(q)) {
    intent = "abnormal_overview";
  } else if (/\b(summar(y|ize|ise)|overview|check-?up|admission|discharge)\b/.test(q)) {
    intent = "summary";
  } else if (/\b(impression|finding|scan|x-?ray|mri|ct|ultrasound|diagnos|medicat|prescri|advice|history)\w*/.test(q)) {
    intent = testNames.length ? "mixed" : "narrative";
  }
  return {
    intent,
    standaloneQuery: question,
    searchQueries: [question],
    testNames,
    dateFrom: null,
    dateTo: null,
    wantsLatest: /\b(latest|current|currently|most recent|recent|last)\b/.test(q),
  };
}

export function sanitizeRoute(r, question) {
  const parseStartOfDay = (v) => {
    if (!v) return null;
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0);
    return d;
  };
  const parseEndOfDay = (v) => {
    if (!v) return null;
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return null;
    d.setHours(23, 59, 59, 999);
    return d;
  };
  const strings = (a, n) =>
    Array.isArray(a) ? a.filter((t) => typeof t === "string" && t.trim()).map((t) => t.trim()).slice(0, n) : [];
  return {
    intent: INTENTS.includes(r?.intent) ? r.intent : "mixed",
    standaloneQuery: typeof r?.standaloneQuery === "string" && r.standaloneQuery.trim() ? r.standaloneQuery.trim() : question,
    searchQueries: strings(r?.searchQueries, 3),
    testNames: strings(r?.testNames, 8),
    dateFrom: parseStartOfDay(r?.dateFrom),
    dateTo: parseEndOfDay(r?.dateTo),
    wantsLatest: Boolean(r?.wantsLatest),
  };
}

export async function routeQuery(question, history = [], llm = generateJson) {
  if (!config.enableRouter) return sanitizeRoute(heuristicRoute(question), question);
  const turns = history
    .slice(-4)
    .map((h) => `${h.role === "assistant" ? "ASSISTANT" : "DOCTOR"}: ${truncate(h.text ?? h.content ?? "", 400)}`)
    .join("\n");
  try {
    const out = await llm(`${ROUTE_PROMPT()}\n\n${turns ? `CHAT HISTORY:\n${turns}\n\n` : ""}QUESTION: ${question}`, { maxOutputTokens: 250, thinkingLevel: "low" });
    return sanitizeRoute(out, question);
  } catch (err) {
    console.warn("[Retrieval] router failed, using heuristics:", err.message);
    return sanitizeRoute(heuristicRoute(question), question);
  }
}

// ---------------------------------------------------------------------------
// 2a. Structured lab queries
// ---------------------------------------------------------------------------
export async function queryLabs({ patientId, testNames = [], dateFrom, dateTo, abnormalOnly = false, limit = 200 }) {
  const q = { patientId: oid(patientId) };
  const or = [];
  const keys = testNames.map((n) => testKeyFor(n, n)).filter(Boolean);
  if (keys.length) or.push({ testKey: { $in: keys } });
  for (const n of testNames) {
    const rx = { $regex: escapeRegex(n), $options: "i" };
    or.push({ testName: rx }, { canonicalName: rx }, { panel: rx });
  }
  if (or.length) q.$or = or;
  if (dateFrom || dateTo) {
    q.collectedAt = {};
    if (dateFrom) q.collectedAt.$gte = dateFrom;
    if (dateTo) q.collectedAt.$lte = dateTo;
  }
  if (abnormalOnly) q.flag = { $in: ["LOW", "HIGH", "CRITICAL"] };
  return labResultModel.find(q).sort({ collectedAt: -1 }).limit(limit).lean();
}

export function computeTrends(labs) {
  const groups = new Map();
  for (const l of labs) {
    if (!groups.has(l.testKey)) groups.set(l.testKey, []);
    groups.get(l.testKey).push(l);
  }
  const trends = [];
  for (const [testKey, rows] of groups) {
    const t = summarizeTrend(rows.map((r) => ({ date: r.collectedAt, value: r.value, unit: r.unit })));
    if (t) trends.push({ testKey, name: rows[0].canonicalName || rows[0].testName, ...t });
  }
  return trends;
}

// ---------------------------------------------------------------------------
// 2b. Text branch: hybrid ranking (pure, exported for tests) + rerank + parent expansion
// ---------------------------------------------------------------------------
/**
 * Vector lists (one per query embedding) + BM25 lists (one per query text), merged with
 * reciprocal rank fusion. Only vectors tagged with the CURRENT embedding model are compared;
 * chunks embedded by an older model still take part through BM25.
 */
export function rankCandidates({ chunks, queryEmbeddings = [], queryTexts = [], tag = embeddingTag(), limit = config.candidatePool }) {
  const lists = [];
  const simById = new Map();

  const vecChunks = chunks.filter((c) =>
    c.embeddingModel === tag &&
    Array.isArray(c.embedding) &&
    c.embedding.length === config.embeddingDim &&
    c.embedding.some((x) => typeof x === "number" && !Number.isNaN(x) && x !== 0)
  );

  for (const qe of queryEmbeddings) {
    if (!qe || !Array.isArray(qe) || qe.length !== config.embeddingDim || !qe.some((x) => typeof x === "number" && !Number.isNaN(x) && x !== 0)) {
      continue;
    }
    const ranked = vecChunks
      .map((c) => ({ id: String(c._id), sim: cosine(qe, c.embedding) }))
      .filter((r) => !Number.isNaN(r.sim) && r.sim > 0)
      .sort((a, b) => b.sim - a.sim)
      .slice(0, limit * 2);
    ranked.forEach((r) => simById.set(r.id, Math.max(simById.get(r.id) ?? -1, r.sim)));
    if (ranked.length) lists.push(ranked.map((r) => r.id));
  }

  const docs = chunks.map((c) => ({ id: String(c._id), text: `${c.section || ""} ${c.chunkText}` }));
  for (const qt of queryTexts) {
    const ranked = bm25Rank(tokenize(qt), docs).slice(0, limit * 2);
    if (ranked.length) lists.push(ranked.map((r) => r.id));
  }

  const byId = new Map(chunks.map((c) => [String(c._id), c]));
  return rrfFuse(lists, { limit }).map(({ id, score }) => ({ chunk: byId.get(id), rrf: score, sim: simById.get(id) ?? null }));
}

const RERANK_PROMPT = `TASK: RERANK
A doctor asked a question about one patient. Score how useful each candidate passage is for answering it:
3 = directly contains the answer, 2 = relevant supporting information, 1 = tangential, 0 = irrelevant.
Judge only from the passage text. Return JSON only: {"ranking":[{"id": <candidate id>, "score": 0-3}]} covering every candidate.`;

export async function rerank(question, candidates, keep, llm = generateJson) {
  const plain = () => candidates.slice(0, keep).map((c) => ({ ...c, rerank: null }));
  if (!config.enableRerank || candidates.length <= 2) return plain();
  const pool = candidates.slice(0, Math.min(candidates.length, 8));
  const items = pool.map((c, i) => ({
    id: i,
    section: c.chunk.section,
    date: toISODate(c.chunk.reportDate),
    text: truncate(c.chunk.chunkText, 350),
  }));
  try {
    const out = await llm(`${RERANK_PROMPT}\n\nQUESTION: ${question}\n\nCANDIDATES:\n${JSON.stringify(items)}`, { maxOutputTokens: 200, thinkingLevel: "low" });
    const scores = new Map();
    for (const r of out?.ranking ?? []) {
      const s = Number(r?.score);
      if (Number.isInteger(r?.id) && r.id >= 0 && r.id < pool.length && Number.isFinite(s)) {
        scores.set(r.id, Math.max(0, Math.min(3, s)));
      }
    }
    if (!scores.size) throw new Error("empty ranking");
    const scored = pool
      .map((c, i) => ({ ...c, rerank: scores.get(i) ?? 0, order: i }))
      .sort((a, b) => b.rerank - a.rerank || a.order - b.order);
    const relevant = scored.filter((c) => c.rerank >= 1);
    const result = (relevant.length ? relevant : scored).slice(0, relevant.length ? keep : 2);
    // If pool didn't have enough and there were more candidates, append the rest from RRF
    if (result.length < keep && candidates.length > pool.length) {
      const addedIds = new Set(result.map((r) => String(r.chunk._id)));
      for (const rem of candidates.slice(pool.length)) {
        if (result.length >= keep) break;
        if (!addedIds.has(String(rem.chunk._id))) {
          result.push({ ...rem, rerank: null });
        }
      }
    }
    return result;
  } catch (err) {
    console.warn("[Retrieval] rerank failed, using fused order:", err.message);
    return plain();
  }
}

async function loadPatientChunks(patientId, { dateFrom, dateTo, chunkTypes } = {}) {
  const q = { patientId: oid(patientId) };
  if (dateFrom || dateTo) {
    q.reportDate = {};
    if (dateFrom) q.reportDate.$gte = dateFrom;
    if (dateTo) q.reportDate.$lte = dateTo;
  }
  if (chunkTypes?.length) q.chunkType = { $in: chunkTypes };
  return reportChunkModel.find(q).lean();
}

// Small chunks are what got matched; the doctor gets the whole parent section (windowed).
async function expandToPassages(ranked, maxPassages, patientId) {
  const secIds = [...new Set(ranked.map((r) => r.chunk.sectionId && String(r.chunk.sectionId)).filter(Boolean))];
  const secQuery = { _id: { $in: secIds } };
  if (patientId) secQuery.patientId = oid(patientId);
  const secs = secIds.length ? await reportSectionModel.find(secQuery).lean() : [];
  const secMap = new Map(secs.map((s) => [String(s._id), s]));
  const maxRrf = Math.max(...ranked.map((r) => r.rrf), 1e-9);

  const seen = new Set();
  const passages = [];
  for (const r of ranked) {
    const c = r.chunk;
    const sec = c.sectionId ? secMap.get(String(c.sectionId)) : null;
    const useParent = sec && (c.chunkType === "narrative" || c.chunkType === "section_summary");
    const key = useParent ? `s:${sec._id}` : `c:${c._id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    passages.push({
      reportId: c.reportId,
      chunkType: c.chunkType,
      section: c.section || "",
      pageNumber: c.pageNumber || 1,
      reportDate: c.reportDate || null,
      text: useParent ? windowAround(sec.text, c.chunkText, config.maxParentChars) : c.chunkText,
      matchedText: c.chunkText,
      score: r.rerank != null ? r.rerank / 3 : r.rrf / maxRrf,
    });
    if (passages.length >= maxPassages) break;
  }
  return passages;
}

async function retrieveText({ patientId, route, question, k }) {
  const range = { dateFrom: route.dateFrom, dateTo: route.dateTo };
  const warnings = [];
  let chunks = await loadPatientChunks(patientId, range);
  if (!chunks.length && (range.dateFrom || range.dateTo)) {
    const allChunks = await loadPatientChunks(patientId);
    if (allChunks.length) {
      warnings.push(`No report records found in the specified date range (${route.dateFrom ? toISODate(route.dateFrom) : "any"} to ${route.dateTo ? toISODate(route.dateTo) : "any"}). Broadening search to all available dates.`);
      chunks = allChunks;
    }
  }
  if (!chunks.length) return { passages: [], warnings };

  const tag = embeddingTag();
  const stale = chunks.filter((c) => c.embeddingModel !== tag).length;
  if (stale) warnings.push(`${stale} chunk(s) use an older embedding model and are only searched by keyword until re-embedded`);

  const queries = [...new Set([route.standaloneQuery, ...route.searchQueries].filter(Boolean))].slice(0, 2);
  let queryEmbeddings = [];
  try {
    queryEmbeddings = await embedQueries(queries);
  } catch (err) {
    warnings.push(`query embedding failed, keyword search only: ${err.message}`);
  }

  const candidates = rankCandidates({ chunks, queryEmbeddings, queryTexts: queries });
  if (!candidates.length) return { passages: [], warnings };
  const reranked = await rerank(route.standaloneQuery, candidates, k);
  const passages = await expandToPassages(reranked, k, patientId);
  if (route.wantsLatest) passages.sort((a, b) => new Date(b.reportDate || 0) - new Date(a.reportDate || 0));
  return { passages, warnings };
}

// ---------------------------------------------------------------------------
// 2c. Summaries + report status
// ---------------------------------------------------------------------------
async function latestSummaries(patientId, { dateFrom, dateTo }) {
  const q = { patientId: oid(patientId), processingStatus: "READY", summary: { $exists: true, $ne: "" } };
  if (dateFrom || dateTo) {
    q.reportDate = {};
    if (dateFrom) q.reportDate.$gte = dateFrom;
    if (dateTo) q.reportDate.$lte = dateTo;
  }
  return medicalReportModel.find(q).sort({ reportDate: -1, createdAt: -1 }).limit(3).lean();
}

async function getReportStatus(patientId) {
  const q = { patientId: oid(patientId) };
  const reports = await medicalReportModel.find(q).select("processingStatus").lean();
  const total = reports.length;
  const processing = reports.filter((r) => r.processingStatus === "PENDING" || r.processingStatus === "PROCESSING").length;
  const ready = reports.filter((r) => r.processingStatus === "READY").length;
  return { hasReports: total > 0, isProcessing: processing > 0, readyCount: ready, totalReports: total };
}

// ---------------------------------------------------------------------------
// 3. Public API
// ---------------------------------------------------------------------------
/**
 * @returns {Promise<{ hasReports, isProcessing, route, labs, trends, passages, summaries, reportMap, warnings }>}
 */
export async function retrieveContext({ patientId, query, topK = config.defaultTopK, history = [] }) {
  const empty = { route: null, labs: [], trends: [], passages: [], summaries: [], reportMap: new Map(), warnings: [] };
  if (!patientId) throw new Error("patientId is required");
  const status = await getReportStatus(patientId);
  if (!status.hasReports || status.readyCount === 0) return { ...empty, ...status };

  const route = await routeQuery(query, history);
  const range = { dateFrom: route.dateFrom, dateTo: route.dateTo };
  const labIntent = LAB_INTENTS.has(route.intent) || route.testNames.length > 0;
  const textK = LAB_INTENTS.has(route.intent) ? Math.min(3, topK) : topK;

  const [labs, text, summaries] = await Promise.all([
    labIntent
      ? queryLabs({ patientId, testNames: route.testNames, ...range, abnormalOnly: route.intent === "abnormal_overview" })
      : [],
    retrieveText({ patientId, route, question: query, k: textK }),
    route.intent === "summary" ? latestSummaries(patientId, range) : [],
  ]);

  const ids = new Set([...labs.map((l) => String(l.reportId)), ...text.passages.map((p) => String(p.reportId))]);
  const reports = ids.size
    ? await medicalReportModel.find({ _id: { $in: [...ids] } }).select("fileName fileUrl reportType reportDate createdAt").lean()
    : [];

  return {
    ...status,
    route,
    labs,
    trends: labIntent ? computeTrends(labs) : [],
    passages: text.passages,
    summaries,
    reportMap: new Map(reports.map((r) => [String(r._id), r])),
    warnings: text.warnings,
  };
}

/**
 * Backwards-compatible entry point (same input/output shape queryService used before).
 */
export async function retrieveRelevantChunks({ patientId, query, topK = 4 }) {
  const ctx = await retrieveContext({ patientId, query, topK });
  const chunks = ctx.passages.map((p) => {
    const r = ctx.reportMap.get(String(p.reportId));
    return {
      reportId: p.reportId,
      fileName: r?.fileName,
      reportType: r?.reportType,
      fileUrl: r?.fileUrl,
      pageNumber: p.pageNumber,
      chunkText: p.text,
      score: p.score,
      reportDate: p.reportDate,
      section: p.section,
      chunkType: p.chunkType,
    };
  });
  return { chunks, hasReports: ctx.hasReports, isProcessing: ctx.isProcessing, context: ctx };
}

/**
 * Turns a retrieval context into prompt text with citation labels (L=lab, T=trend, S=summary, P=passage)
 * plus a matching `sources` array for the UI. Every item carries its report date.
 */
export function formatContextForPrompt(ctx) {
  const sources = [];
  const parts = [];
  const rep = (id) => ctx.reportMap.get(String(id));
  const nameOf = (id) => rep(id)?.fileName || "report";
  const add = (label, kind, id, extra) =>
    sources.push({
      label,
      kind,
      reportId: id,
      fileName: rep(id)?.fileName,
      reportType: rep(id)?.reportType,
      fileUrl: rep(id)?.fileUrl,
      ...extra,
    });

  const dates = [
    ...ctx.labs.map((l) => l.collectedAt),
    ...ctx.passages.map((p) => p.reportDate),
    ...ctx.summaries.map((s) => s.reportDate),
  ]
    .filter(Boolean)
    .map((d) => new Date(d))
    .sort((a, b) => b - a);
  if (dates.length) parts.push(`Most recent record date among the excerpts below: ${toISODate(dates[0])}\n`);

  if (ctx.labs.length) {
    parts.push("LAB RESULTS (structured, most recent first):");
    ctx.labs.slice(0, config.maxLabsInContext).forEach((l, i) => {
      const label = `L${i + 1}`;
      add(label, "lab", l.reportId, {
        pageNumber: l.pageNumber,
        reportDate: l.collectedAt,
        snippet: truncate(l.sourceText || `${l.canonicalName} ${l.valueText} ${l.unit}`, 200),
        verified: l.verified,
        score: null,
      });
      parts.push(
        `[${label}] ${l.canonicalName || l.testName} | ${toISODate(l.collectedAt)} | ${l.valueText}${l.unit ? " " + l.unit : ""} | ${l.flag}` +
        `${l.refText ? ` | reference ${l.refText}` : ""}${l.verified ? "" : " | UNVERIFIED extraction"} | ${nameOf(l.reportId)} p.${l.pageNumber ?? "?"}`
      );
    });
    if (ctx.labs.length > config.maxLabsInContext) parts.push(`(${ctx.labs.length - config.maxLabsInContext} older results not shown)`);
  }

  if (ctx.trends.length) {
    parts.push("\nTRENDS (computed from the stored results):");
    ctx.trends.forEach((t, i) => {
      const label = `T${i + 1}`;
      if (!t.comparable) {
        parts.push(`[${label}] ${t.name}: units differ between reports, so the values are not directly comparable`);
      } else {
        const unit = t.first.unit ? " " + t.first.unit : "";
        parts.push(
          `[${label}] ${t.name}: ${t.first.value} -> ${t.last.value}${unit} (${t.delta >= 0 ? "+" : ""}${+t.delta.toFixed(2)}` +
          `${t.pct != null ? `, ${t.pct >= 0 ? "+" : ""}${t.pct.toFixed(1)}%` : ""}; ${t.direction}) from ${toISODate(t.first.date)} to ${toISODate(t.last.date)}, ${t.count} results`
        );
      }
    });
  }

  if (ctx.summaries.length) {
    parts.push("\nREPORT SUMMARIES:");
    ctx.summaries.forEach((s, i) => {
      const label = `S${i + 1}`;
      ctx.reportMap.set(String(s._id), s);
      add(label, "summary", s._id, { pageNumber: null, reportDate: s.reportDate, snippet: truncate(s.summary, 200), score: null });
      parts.push(`[${label}] ${s.fileName} | ${toISODate(s.reportDate)}: ${s.summary}`);
    });
  }

  if (ctx.passages.length) {
    parts.push("\nEXCERPTS FROM REPORTS:");
    ctx.passages.forEach((p, i) => {
      const label = `P${i + 1}`;
      add(label, "passage", p.reportId, {
        pageNumber: p.pageNumber,
        reportDate: p.reportDate,
        snippet: truncate(p.matchedText || p.text, 200),
        score: Math.round(p.score * 100) / 100,
      });
      parts.push(
        `[${label}] ${nameOf(p.reportId)} | ${rep(p.reportId)?.reportType || "report"} | ${toISODate(p.reportDate)} | page ${p.pageNumber}` +
        `${p.section ? ` | ${p.section}` : ""}\n${p.text}`
      );
    });
  }

  const fallbackParts = [];
  if (ctx.labs.length) {
    fallbackParts.push("• **Lab Results (most recent first):**");
    ctx.labs.slice(0, 12).forEach((l) => {
      fallbackParts.push(
        `  - ${l.canonicalName || l.testName} ${l.valueText}${l.unit ? " " + l.unit : ""}  [${l.flag || "NORMAL"}]  (${toISODate(l.collectedAt)}, ${nameOf(l.reportId)} p.${l.pageNumber ?? "?"})`
      );
    });
  }
  if (ctx.trends.length) {
    fallbackParts.push("\n• **Trends:**");
    ctx.trends.forEach((t) => {
      if (!t.comparable) fallbackParts.push(`  - ${t.name}: (units differ between reports)`);
      else {
        const u = t.first.unit ? " " + t.first.unit : "";
        fallbackParts.push(
          `  - ${t.name}: ${t.first.value} → ${t.last.value}${u} (${t.delta >= 0 ? "+" : ""}${+t.delta.toFixed(2)}; ${t.direction})  [${t.count} readings from ${toISODate(t.first.date)} to ${toISODate(t.last.date)}]`
        );
      }
    });
  }
  if (ctx.summaries.length) {
    fallbackParts.push("\n• **Report Summaries:**");
    ctx.summaries.forEach((s) => {
      fallbackParts.push(`  - ${s.fileName} (${toISODate(s.reportDate)}): ${truncate(s.summary, 280)}`);
    });
  }
  if (ctx.passages.length) {
    fallbackParts.push("\n• **Matched Report Excerpts:**");
    ctx.passages.slice(0, 8).forEach((p) => {
      fallbackParts.push(
        `  - ${nameOf(p.reportId)} p.${p.pageNumber}${p.section ? ` [${p.section}]` : ""} (${toISODate(p.reportDate)}): ${truncate(p.matchedText || p.text, 300)}`
      );
    });
  }
  const fallbackText = fallbackParts.length
    ? fallbackParts.join("\n")
    : "No specific evidence was retrieved for this query. Try different keywords, or open the source reports directly.";

  return { text: parts.join("\n"), sources, fallbackText };
}

export default { retrieveContext, retrieveRelevantChunks, routeQuery, queryLabs, computeTrends, rankCandidates, rerank, formatContextForPrompt };