import fs from "fs";
import mongoose from "mongoose";
// Import the library file directly: the package index has a debug block that reads a sample PDF from ./test/data when loaded via ESM.
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import Tesseract from "tesseract.js";
import medicalReportModel from "../../models/medicalReportModel.js";
import reportChunkModel from "../../models/reportChunkModel.js";
import reportSectionModel from "../../models/reportsectionModel.js";
import labResultModel from "../../models/labResultModel.js";
import { embedDocuments, isValidVector } from "./embeddingService.js";
import { config, embeddingTag } from "./config.js";
import { generateJson } from "./llmService.js";
import {
  parseSections, looksLikeHeaderBlock, buildEmbedText, redactForLLM, squash, toISODate,
  testKeyFor, parseNumeric, parseRefRange, computeFlag, verifyAgainstSource,
} from "./ragUtils.js";

/**
 * Standard LangChain Document representation
 */
export class Document {
  constructor({ pageContent, metadata = {} }) {
    this.pageContent = pageContent || "";
    this.metadata = metadata;
  }
}

/**
 * Recursive splitter (paragraph -> line -> sentence -> word -> char), sizes in characters.
 */
export class RecursiveCharacterTextSplitter {
  constructor({
    chunkSize = config.chunkSize,
    chunkOverlap = config.chunkOverlap,
    separators = ["\n\n", "\n", ". ", " ", ""],
  } = {}) {
    if (chunkOverlap >= chunkSize) throw new Error("chunkOverlap must be < chunkSize");
    this.chunkSize = chunkSize;
    this.chunkOverlap = chunkOverlap;
    this.separators = separators;
  }

  splitText(text, separators = this.separators) {
    text = (text || "").trim();
    if (!text) return [];
    if (text.length <= this.chunkSize) return [text];

    let sep = "";
    let rest = [];
    for (let i = 0; i < separators.length; i++) {
      if (separators[i] === "" || text.includes(separators[i])) {
        sep = separators[i];
        rest = separators.slice(i + 1);
        break;
      }
    }

    const pieces = (sep === "" ? Array.from(text) : text.split(sep)).filter((p) =>
      sep === "" ? p !== "" : p.trim() !== ""
    );

    const out = [];
    let good = [];
    for (const p of pieces) {
      if (p.length <= this.chunkSize) {
        good.push(p);
      } else {
        if (good.length) {
          out.push(...this.#merge(good, sep));
          good = [];
        }
        out.push(...(rest.length ? this.splitText(p, rest) : [p]));
      }
    }
    if (good.length) out.push(...this.#merge(good, sep));
    return out;
  }

  splitDocuments(documents) {
    const splitDocs = [];
    for (const doc of documents) {
      const texts = this.splitText(doc.pageContent);
      for (let i = 0; i < texts.length; i++) {
        splitDocs.push(
          new Document({
            pageContent: texts[i],
            metadata: { ...doc.metadata, chunkIndex: i, wordCount: texts[i].split(/\s+/).length },
          })
        );
      }
    }
    return splitDocs;
  }

  #merge(pieces, sep) {
    const chunks = [];
    let cur = [];
    let total = 0;
    for (const p of pieces) {
      let add = p.length + (cur.length ? sep.length : 0);
      if (cur.length && total + add > this.chunkSize) {
        chunks.push(cur.join(sep).trim());
        while (
          cur.length &&
          (total > this.chunkOverlap || total + p.length + sep.length > this.chunkSize)
        ) {
          total -= cur[0].length + (cur.length > 1 ? sep.length : 0);
          cur.shift();
        }
        add = p.length + (cur.length ? sep.length : 0);
      }
      cur.push(p);
      total += add;
    }
    if (cur.length) chunks.push(cur.join(sep).trim());
    return chunks.filter(Boolean);
  }
}

/**
 * Per-page PDF text with line structure preserved (one string per page, empty pages included).
 */
async function extractPdfPages(buffer, pdfParse) {
  const pages = [];
  await pdfParse(buffer, {
    pagerender: async (pageData) => {
      const tc = await pageData.getTextContent({ normalizeWhitespace: false });
      let lastY;
      let text = "";
      for (const item of tc.items) {
        const y = item.transform[5];
        if (lastY === undefined || Math.abs(lastY - y) < 2) {
          text += (text && !text.endsWith("\n") && !text.endsWith(" ") ? " " : "") + item.str;
        } else {
          text += "\n" + item.str;
        }
        lastY = y;
      }
      const cleaned = text.replace(/[ \t]+/g, " ").trim();
      pages.push(cleaned);
      return cleaned;
    },
  });
  return pages;
}

/**
 * Analysis: structured lab extraction, sections, summaries and chunk plan (LLM injectable for tests).
 */
const MAX_BATCH_CHARS = 9000;
const LAB_CHUNK_ROWS = 12;
const ABNORMAL = new Set(["LOW", "HIGH", "CRITICAL"]);

const LAB_PROMPT = `TASK: LAB_EXTRACTION
Extract data from the medical report text below. Return JSON only:
{
  "docType": "lab_report" | "radiology" | "discharge_summary" | "prescription" | "other",
  "reportDate": "YYYY-MM-DD" or null,
  "labResults": [
    {
      "testName": "as printed",
      "canonicalName": "standard English name, e.g. Hemoglobin, LDL Cholesterol, HbA1c, Total Leukocyte Count",
      "panel": "the panel/section this row belongs to, or \\"\\"",
      "value": "exactly as printed, e.g. 13.2 or <0.5 or Positive",
      "unit": "as printed or \\"\\"",
      "refRange": "as printed or \\"\\"",
      "flag": "flag printed next to the value (H, L, HIGH, LOW, ...) or \\"\\"",
      "sourceText": "the complete original row copied verbatim",
      "page": <number from the [[PAGE n]] marker>
    }
  ]
}
Rules:
- One entry per result row. Copy numbers exactly as printed. Never round, convert, calculate or guess.
- reportDate = sample collection or report date. Use null unless the date is unambiguous.
- Skip narrative text, patient details and rows without a result value.
- If a field is not printed, use "".
- Placeholders like [REDACTED] are intentional; ignore them.`;

const SUMMARY_PROMPT = `TASK: SUMMARIES
You write short plain-language summaries of a medical report for the patient who owns it.
Use ONLY the input. Do not diagnose and do not recommend treatment.
Return JSON only:
{
  "reportSummary": "max 120 words: what kind of report it is, notable out-of-range results, key findings or impression",
  "sectionSummaries": [ { "index": <section index from the input>, "summary": "max 40 words" } ]
}`;

function batchPages(pages, maxChars = MAX_BATCH_CHARS) {
  const batches = [];
  let cur = [];
  let size = 0;
  for (const p of pages) {
    if (cur.length && size + p.text.length > maxChars) {
      batches.push(cur);
      cur = [];
      size = 0;
    }
    cur.push(p);
    size += p.text.length;
  }
  if (cur.length) batches.push(cur);
  return batches;
}

async function extractLabs(pages, llm, warnings) {
  const meta = { docType: null, reportDate: null };
  const rows = [];
  for (const batch of batchPages(pages)) {
    const body = batch.map((p) => `[[PAGE ${p.pageNumber}]]\n${redactForLLM(p.text)}`).join("\n\n");
    try {
      const out = await llm(`${LAB_PROMPT}\n\nREPORT TEXT:\n${body}`);
      meta.docType ??= out?.docType || null;
      meta.reportDate ??= out?.reportDate || null;
      if (Array.isArray(out?.labResults)) rows.push(...out.labResults);
    } catch (e) {
      warnings.push(`lab extraction failed for pages ${batch[0].pageNumber}-${batch.at(-1).pageNumber}: ${e.message}`);
    }
  }
  return { meta, rows };
}

function normalizeLabRows(rows, squashedFull) {
  const seen = new Set();
  const out = [];
  for (const r of rows) {
    const testName = String(r?.testName ?? "").trim();
    const rawValue = r?.value == null ? "" : String(r.value).trim();
    if (!testName || !rawValue) continue;

    const value = parseNumeric(rawValue);
    const { low, high } = parseRefRange(r.refRange);
    const rec = {
      testName,
      canonicalName: String(r.canonicalName || testName).trim(),
      testKey: testKeyFor(r.canonicalName, testName),
      panel: String(r.panel ?? "").trim(),
      value,
      valueText: rawValue,
      unit: String(r.unit ?? "").trim(),
      refText: String(r.refRange ?? "").trim(),
      refLow: low,
      refHigh: high,
      flag: computeFlag({ value, low, high, reported: r.flag }),
      pageNumber: Number(r.page) || null,
      sourceText: String(r.sourceText ?? "").trim(),
      verified: verifyAgainstSource({ sourceText: r.sourceText, rawValue }, squashedFull),
    };
    const dedupeKey = `${rec.testKey}|${rec.valueText}|${rec.pageNumber}|${rec.panel}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    out.push(rec);
  }
  return out;
}

// Priority: date the user entered > date found in the document > upload date.
function resolveDate(report, docDate) {
  const parse = (v) => {
    const d = v ? new Date(v) : null;
    return d && !isNaN(d) ? d : null;
  };
  const user = parse(report?.reportDate);
  if (user) return { date: user, source: "user" };
  const doc = parse(docDate);
  if (doc && doc.getTime() <= Date.now() + 86_400_000) return { date: doc, source: "document" };
  return { date: parse(report?.createdAt) || new Date(), source: "upload" };
}

// A section is a "lab" section when most of its lines START with a test name we extracted.
function classifySections(sections, labs) {
  const names = [...new Set(labs.map((l) => l.testName.toLowerCase()))];
  return sections.map((s) => {
    const lines = s.text.split("\n").filter(Boolean);
    const labLines = lines.filter((l) => {
      const norm = l.toLowerCase().replace(/^[^a-z0-9]+/, "");
      return /\d/.test(norm) && names.some((n) => norm.startsWith(n));
    }).length;
    const ratio = lines.length ? labLines / lines.length : 0;

    let sectionType = ratio >= 0.5 ? "lab" : "narrative";
    if (s.order === 0 && sections.length > 1 && looksLikeHeaderBlock(s.text)) sectionType = "header";
    return { ...s, sectionType, summary: "" };
  });
}

function labSummaryText(panel, rows, dateStr) {
  const head = `${panel || "Lab results"}${dateStr ? ` (${dateStr})` : ""}`;
  const lines = rows.map(
    (r) =>
      `- ${r.canonicalName}: ${r.valueText}${r.unit ? " " + r.unit : ""} (${r.flag}${r.refText ? `; reference ${r.refText}` : ""})${r.verified ? "" : " [unverified]"}`
  );
  return `${head}\n${lines.join("\n")}`;
}

async function summarize({ sections, labs, meta, llm, warnings }) {
  const narrative = sections.filter((s) => s.sectionType === "narrative").slice(0, 25);
  if (!narrative.length && !labs.length) return { reportSummary: "", bySection: new Map() };

  const abnormalAll = labs.filter((l) => ABNORMAL.has(l.flag));
  const payload = {
    docType: meta.docType,
    labCounts: { total: labs.length, abnormal: abnormalAll.length },
    abnormalResults: abnormalAll
      .slice(0, 40)
      .map((l) => `${l.canonicalName}: ${l.valueText} ${l.unit} (${l.flag}; reference ${l.refText || "n/a"})`),
    sections: narrative.map((s) => ({ index: s.order, title: s.title, text: redactForLLM(s.text).slice(0, 1500) })),
  };
  try {
    const out = await llm(`${SUMMARY_PROMPT}\n\nINPUT:\n${JSON.stringify(payload)}`);
    const bySection = new Map();
    for (const s of out?.sectionSummaries ?? []) {
      if (Number.isInteger(s?.index) && typeof s?.summary === "string" && s.summary.trim()) {
        bySection.set(s.index, s.summary.trim());
      }
    }
    return { reportSummary: String(out?.reportSummary ?? "").trim(), bySection };
  } catch (e) {
    warnings.push(`summary generation failed: ${e.message}`);
    return { reportSummary: "", bySection: new Map() };
  }
}

function isPermanentApiFailure(msg) {
  const s = String(msg || "");
  return /403|PERMISSION_DENIED|denied access|API_KEY_INVALID|API_KEY_NOT_FOUND|INVALID_ARGUMENT|UNAUTHENTICATED|ACCESS_TOKEN_TYPE_UNSUPPORTED|short-circuited/i.test(s);
}

/**
 * @param pages   [{ pageNumber, text }]
 * @param report  { fileName, reportType, reportDate?, createdAt? }
 * @param llm     (prompt) => Promise<object>   (defaults to Gemini JSON mode)
 */
export async function analyzeReport({ pages, report, llm = generateJson }) {
  const warnings = [];
  const squashedFull = squash(pages.map((p) => p.text).join("\n"));

  const labResult = await extractLabs(pages, llm, warnings);
  let { meta, rows } = labResult;

  // PERMANENT API FAILURE DEGRADATION: LLM returned 403 — skip all downstream LLM,
  // fall back to pure-regex narrative chunking so at least BM25 works on raw text.
  const labsFailedPermanently = warnings.some((w) => isPermanentApiFailure(w));
  let labs = normalizeLabRows(rows, squashedFull);

  const { date, source: dateSource } = resolveDate(report, meta.reportDate);
  const dateStr = toISODate(date);
  for (const l of labs) {
    l.collectedAt = date;
    l.dateSource = dateSource;
  }

  const sections = classifySections(parseSections(pages), labs);

  // Skip LLM summary if we know API is broken (403). Use auto summary from top abnormal labs.
  let reportSummary = "";
  let bySection = new Map();
  if (labsFailedPermanently) {
    warnings.push("LLM API denied access (PERMISSION_DENIED) — skipping structured lab/summary step, using degraded chunking-only mode. Report is readable via keyword search but AI synthesis will be unavailable until the API key is fixed.");
    const abnormal = labs.filter((l) => ABNORMAL.has(l.flag)).slice(0, 15);
    if (abnormal.length) {
      reportSummary = `Degraded ingestion — ${labs.length} lab rows detected (${abnormal.length} abnormal). Top abnormal: ` +
        abnormal.map((l) => `${l.canonicalName} ${l.valueText}${l.unit ? " " + l.unit : ""} [${l.flag}]`).join("; ") + ".";
    } else if (labs.length) {
      reportSummary = `Degraded ingestion — ${labs.length} lab rows detected (all within reference range).`;
    } else {
      const totalChars = pages.reduce((a, p) => a + p.text.length, 0);
      reportSummary = `Degraded ingestion — ${pages.length} pages (${totalChars.toLocaleString()} chars). Narrative text available via keyword search.`;
    }
  } else {
    const sum = await summarize({ sections, labs, meta, llm, warnings });
    reportSummary = sum.reportSummary;
    bySection = sum.bySection;
  }
  for (const s of sections) s.summary = bySection.get(s.order) || "";

  // ---- chunk plan ---------------------------------------------------------
  const splitter = new RecursiveCharacterTextSplitter();
  const chunkPlans = [];
  const push = (p) =>
    chunkPlans.push({
      ...p,
      embedText: buildEmbedText({
        fileName: report?.fileName,
        reportType: report?.reportType,
        reportDate: dateStr,
        pageNumber: p.pageNumber,
        section: p.section,
        text: p.chunkText,
      }),
    });

  for (const s of sections) {
    if (s.sectionType !== "narrative") continue; // lab rows -> structured records; header -> not embedded
    for (const t of splitter.splitText(s.text)) {
      push({ chunkType: "narrative", chunkText: t, sectionOrder: s.order, section: s.title, pageNumber: s.pageStart });
    }
    if (s.summary) {
      push({ chunkType: "section_summary", chunkText: `${s.title}: ${s.summary}`, sectionOrder: s.order, section: s.title, pageNumber: s.pageStart });
    }
  }

  const byPanel = new Map();
  for (const l of labs) {
    const key = l.panel || "Lab results";
    if (!byPanel.has(key)) byPanel.set(key, []);
    byPanel.get(key).push(l);
  }
  const labSectionFor = (page) =>
    sections.find((s) => s.sectionType === "lab" && page != null && s.pageStart <= page && page <= s.pageEnd)?.order ?? null;

  for (const [panel, panelRows] of byPanel) {
    for (let i = 0; i < panelRows.length; i += LAB_CHUNK_ROWS) {
      const slice = panelRows.slice(i, i + LAB_CHUNK_ROWS);
      push({
        chunkType: "lab_summary",
        chunkText: labSummaryText(panel, slice, dateStr),
        sectionOrder: labSectionFor(slice[0].pageNumber),
        section: panel,
        pageNumber: slice[0].pageNumber || 1,
      });
    }
  }

  if (reportSummary) {
    push({ chunkType: "report_summary", chunkText: reportSummary, sectionOrder: null, section: "Report summary", pageNumber: 1 });
  }

  // If degraded mode produced 0 chunks (no LLM = no labs extracted), at least add per-page narrative chunks so something is searchable.
  if (!chunkPlans.length) {
    for (const p of pages) {
      for (const t of splitter.splitText(p.text)) {
        push({ chunkType: "narrative", chunkText: t, sectionOrder: null, section: "Full text", pageNumber: p.pageNumber });
      }
    }
  }

  return { meta, date, dateStr, dateSource, labs, sections, reportSummary, chunkPlans, warnings, degraded: labsFailedPermanently };
}

/** Extracts text and returns an array of Document objects, one per page (empty pages removed, page numbers preserved). */
async function extractDocumentsFromFile(filePath, fileType, originalName, metadataBase = {}) {
  const toDocs = (pages) =>
    pages.map((p) => new Document({ pageContent: p.text, metadata: { ...metadataBase, pageNumber: p.pageNumber } }));

  const mime = (fileType || "").toLowerCase();
  const name = (originalName || "").toLowerCase();

  if (mime.includes("pdf") || name.endsWith(".pdf")) {
    // Copy into a standalone buffer: small files come from Node's shared buffer pool (non-zero byteOffset), which pdf.js can't parse ("bad XRef entry").
    const buf = Buffer.from(Uint8Array.from(fs.readFileSync(filePath)));
    let texts = [];
    try {
      texts = await extractPdfPages(buf, pdfParse);
    } catch (e) {
      console.warn("[Ingestion] per-page PDF extraction failed, falling back:", e.message);
    }
    if (!texts.some((t) => t.trim())) {
      const parsed = await pdfParse(buf);
      texts = [(parsed.text || "").trim()];
    }
    const pages = texts.map((text, i) => ({ pageNumber: i + 1, text })).filter((p) => p.text.trim());
    if (!pages.length) {
      throw new Error("No readable text found in PDF (it may be a scanned image; OCR for scanned PDFs is not implemented)");
    }
    return toDocs(pages);
  }

  if (mime.includes("image") || /\.(jpe?g|png|webp)$/.test(name)) {
    const result = await Tesseract.recognize(filePath, "eng", { logger: () => { } });
    const text = (result?.data?.text || "").trim();
    if (!text) throw new Error("Tesseract OCR could not extract any legible text from image");
    return toDocs([{ pageNumber: 1, text }]);
  }

  try {
    const text = fs.readFileSync(filePath, "utf-8").trim();
    if (!text) throw new Error("empty");
    return toDocs([{ pageNumber: 1, text }]);
  } catch {
    throw new Error(`Unsupported file type for medical report ingestion: ${fileType}`);
  }
}

function cleanupLocalFile(filePath) {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.warn(`[Ingestion] Failed to remove temp file ${filePath}:`, err.message);
  }
}

async function dropRun(reportId, runId) {
  await Promise.allSettled(
    [reportChunkModel, reportSectionModel, labResultModel].map((M) => M.deleteMany({ reportId, ingestRunId: runId }))
  );
}

/**
 * Pipeline:
 *  1. PROCESSING
 *  2. Extract per-page text (PDF / OCR / text)
 *  3. Analyze: lab extraction -> sections -> summaries -> chunk plan (LLM, no DB)
 *  4. Embed the chunk plan
 *  5. Insert the NEW data tagged with a run id, then delete the previous run
 *     (a failure never leaves the report with zero data)
 *  6. READY
 */
export async function processMedicalReport(reportId, localFilePath, originalName = "") {
  let report;
  let runId;
  try {
    report = await medicalReportModel.findById(reportId);
    if (!report) {
      console.error(`[Ingestion] Medical report ${reportId} not found in database`);
      return;
    }
    report.processingStatus = "PROCESSING";
    report.errorMessage = "";
    await report.save();

    // Fail fast if an old model file is still in use: without ingestRunId on the schema, the
    // "delete previous run" step could not tell old chunks from new ones and would delete both.
    for (const [M, label] of [
      [reportChunkModel, "reportChunkModel"],
      [reportSectionModel, "reportSectionModel"],
      [labResultModel, "labResultModel"],
    ]) {
      if (!M.schema?.path?.("ingestRunId")) {
        throw new Error(`${label} schema has no "ingestRunId" field - replace it with the new model file`);
      }
    }

    console.log(`[Ingestion] Extracting text for "${report.fileName}" (${report.fileType})...`);
    const metadataBase = {
      patientId: report.patientId.toString(),
      reportId: report._id.toString(),
      fileName: report.fileName,
      reportType: report.reportType,
      fileUrl: report.fileUrl,
    };
    const initialDocs = await extractDocumentsFromFile(
      localFilePath,
      report.fileType,
      originalName || report.fileName,
      metadataBase
    );
    const pages = initialDocs.map((d) => ({ pageNumber: d.metadata.pageNumber, text: d.pageContent }));

    console.log(`[Ingestion] Analyzing ${pages.length} page(s)...`);
    const analysis = await analyzeReport({ pages, report });
    if (!analysis.chunkPlans.length) throw new Error("Report produced 0 chunks during processing");

    console.log(
      `[Ingestion] ${analysis.labs.length} lab results, ${analysis.sections.length} sections, ` +
      `embedding ${analysis.chunkPlans.length} chunks...`
    );

    let embeddings = null;
    let embeddingStatus = "COMPLETED";
    let embeddingError = "";

    try {
      embeddings = await embedDocuments(
        analysis.chunkPlans.map((p) => ({ title: p.section || report.fileName, text: p.embedText }))
      );
    } catch (embErr) {
      console.warn("[Ingestion] Embedding generation failed:", embErr.message);
      embeddingStatus = "FAILED";
      embeddingError = embErr.message || "Embedding generation failed";
      analysis.warnings.push(`Vector embedding failed (${embeddingError}); stored in degraded keyword-search mode`);
    }

    runId = new mongoose.Types.ObjectId().toString();
    const base = { reportId: report._id, patientId: report.patientId, ingestRunId: runId };
    const fileMeta = {
      fileName: report.fileName,
      reportType: report.reportType,
      fileUrl: report.fileUrl,
      docType: analysis.meta.docType || "",
    };

    const sectionDocs = await reportSectionModel.insertMany(
      analysis.sections.map((s) => ({
        ...base,
        order: s.order,
        title: s.title,
        sectionType: s.sectionType,
        text: s.text,
        summary: s.summary,
        pageStart: s.pageStart,
        pageEnd: s.pageEnd,
      }))
    );
    const sectionIdByOrder = new Map(sectionDocs.map((d) => [d.order, d._id]));

    if (analysis.labs.length) {
      await labResultModel.insertMany(analysis.labs.map((l) => ({ ...base, ...l })));
    }

    const chunkDocs = analysis.chunkPlans.map((p, i) => {
      const vec = embeddings && Array.isArray(embeddings) ? embeddings[i] : null;
      const valid = isValidVector(vec);
      return {
        ...base,
        sectionId: p.sectionOrder != null ? sectionIdByOrder.get(p.sectionOrder) ?? null : null,
        chunkType: p.chunkType,
        chunkText: p.chunkText,
        embedding: valid ? vec : null,
        embeddingModel: valid ? embeddingTag() : null,
        embeddingStatus: valid ? "VALID" : (embeddingStatus === "FAILED" ? "FAILED" : "SKIPPED"),
        embeddingError: valid ? "" : embeddingError,
        section: p.section,
        pageNumber: p.pageNumber || 1,
        chunkIndex: i,
        reportDate: analysis.date,
        metadata: fileMeta,
      };
    });

    await reportChunkModel.insertMany(chunkDocs);

    // swap: remove everything from previous runs (legacy docs without a run id included)
    await Promise.all(
      [reportChunkModel, reportSectionModel, labResultModel].map((M) =>
        M.deleteMany({ reportId: report._id, ingestRunId: { $ne: runId } })
      )
    );

    const isDegraded = Boolean(analysis.degraded || embeddingStatus === "FAILED");
    report.processingStatus = "READY";
    report.embeddingStatus = embeddingStatus;
    report.isDegraded = isDegraded;
    report.chunkCount = analysis.chunkPlans.length;
    report.labResultCount = analysis.labs.length;
    report.docType = analysis.meta.docType || report.docType;
    report.summary = analysis.reportSummary;
    if (!report.reportDate) report.reportDate = analysis.date;
    report.processingNotes = analysis.warnings.join("; ");
    report.errorMessage = isDegraded
      ? (analysis.degraded
          ? "Processed in degraded mode (LLM permission denied) — keyword search works but AI synthesis unavailable."
          : `Vector embedding skipped/failed (${embeddingError}) — keyword search available.`)
      : "";
    await report.save();

    const doneMsg = isDegraded ? "🟡 ready in degraded mode" : "✅ ready";
    console.log(`[Ingestion] ${doneMsg} "${report.fileName}" (${analysis.chunkPlans.length} chunks, ${analysis.labs.length} labs).`);
  } catch (error) {
    const permFail = isPermanentApiFailure(error?.message);
    console.error(`[Ingestion] ${permFail ? "🟡 degraded" : "❌ failed"} to ingest report ${reportId}:`, error?.message || error);
    if (report && runId) await dropRun(report._id, runId);
    if (report) {
      try {
        if (permFail) {
          // On permanent 403, mark READY in degraded mode so the PDF/image is downloadable and keyword-searchable
          report.processingStatus = "READY";
          report.embeddingStatus = "DEGRADED";
          report.isDegraded = true;
          report.errorMessage = "Degraded upload accepted (LLM permission denied). The PDF/image is downloadable but AI indexing was skipped. Fix GEMINI_API_KEY and re-upload to enable full AI search.";
          report.processingNotes = (report.processingNotes ? report.processingNotes + "; " : "") + String(error?.message || error).slice(0, 500);
        } else {
          report.processingStatus = "FAILED";
          report.embeddingStatus = "FAILED";
          report.isDegraded = true;
          report.errorMessage = error.message || "Failed to process and index medical report";
        }
        await report.save();
      } catch (saveErr) {
        console.error("[Ingestion] Error saving failure state:", saveErr);
      }
    }
  } finally {
    cleanupLocalFile(localFilePath);
  }
}

export default { processMedicalReport, analyzeReport, Document, RecursiveCharacterTextSplitter };