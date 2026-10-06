export const squash = (text) => String(text || "").replace(/\s+/g, " ").trim();

export const toISODate = (d) => {
  if (!d) return "";
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const truncate = (text, n) => {
  const s = String(text || "");
  return s.length <= n ? s : s.slice(0, Math.max(0, n - 1)) + "\u2026";
};

export const escapeRegex = (s) => String(s || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const cosine = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const tokenize = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2);

const PHONE_RE = /(\+?\d[\d\s.-]{7,}\d)/g;
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const AADHAAR_RE = /\b\d{4}\s?\d{4}\s?\d{4}\b/g;
const PAN_RE = /\b[A-Z]{5}\d{4}[A-Z]\b/g;

export const redactForLLM = (text) =>
  String(text || "")
    .replace(PHONE_RE, "[REDACTED_PHONE]")
    .replace(EMAIL_RE, "[REDACTED_EMAIL]")
    .replace(AADHAAR_RE, "[REDACTED_AADHAAR]")
    .replace(PAN_RE, "[REDACTED_PAN]");

const HEADER_KEYWORDS = /patient|name|age|sex|gender|dob|date of birth|report|collected|received|lab|hospital|clinic|doctor|ref/i;
const LINE_KEYWORDS = /\b(haemoglobin|hemoglobin|hba1c|ldl|hdl|cholesterol|triglyceride|urea|creatinine|bilirubin|alt|ast|sgpt|sgot|alkaline|wbc|rbc|platelet|count|tsh|t3|t4|glucose|sugar|potassium|sodium|calcium|protein|albumin)\b/i;

export const looksLikeHeaderBlock = (text) => {
  const lines = String(text || "").split("\n").filter(Boolean);
  if (!lines.length) return false;
  const shortLines = lines.filter((l) => l.length < 120).length;
  const hasHeaderWords = lines.some((l) => HEADER_KEYWORDS.test(l));
  const hasFewRows = lines.filter((l) => /\d/.test(l)).length <= 2;
  return hasHeaderWords && (shortLines / lines.length > 0.6) && hasFewRows;
};

export function parseSections(pages) {
  const sections = [];
  let current = null;
  const push = (line, pageNumber) => {
    if (!current) {
      current = { order: sections.length, title: "", text: "", pageStart: pageNumber, pageEnd: pageNumber };
      sections.push(current);
    }
    if (current.text) current.text += "\n";
    current.text += line;
    current.pageEnd = pageNumber;
  };
  for (const page of pages || []) {
    const lines = String(page.text || "").split("\n");
    for (const raw of lines) {
      const line = raw.trimEnd();
      if (!line.trim()) {
        if (current && current.text.trim()) current = null;
        continue;
      }
      if (
        /^[-A-Z\s&/():]{2,80}$/.test(line.trim()) &&
        !LINE_KEYWORDS.test(line) &&
        !/\d/.test(line)
      ) {
        current = {
          order: sections.length,
          title: line.trim(),
          text: "",
          pageStart: page.pageNumber,
          pageEnd: page.pageNumber,
        };
        sections.push(current);
        continue;
      }
      if (
        /^[-A-Za-z\s&/():]{2,80}:?\s*$/.test(line.trim()) &&
        !LINE_KEYWORDS.test(line) &&
        (line.trim().length < 60)
      ) {
        const title = line.trim().replace(/[:\s]+$/, "");
        if (title.length < 50) {
          current = {
            order: sections.length,
            title,
            text: "",
            pageStart: page.pageNumber,
            pageEnd: page.pageNumber,
          };
          sections.push(current);
          continue;
        }
      }
      push(line, page.pageNumber);
    }
    current = null;
  }
  for (let i = 0; i < sections.length; i++) {
    if (!sections[i].title && sections[i].text) {
      const first = sections[i].text.split("\n")[0].trim();
      if (first.length < 80 && /^[A-Z]/.test(first) && !LINE_KEYWORDS.test(first)) {
        sections[i].title = first;
      }
    }
    sections[i].text = sections[i].text.trim();
  }
  return sections.filter((s) => s.text);
}

export const buildEmbedText = ({ fileName, reportType, reportDate, pageNumber, section, text }) => {
  const parts = [];
  if (reportType) parts.push(`Report type: ${reportType}`);
  if (fileName) parts.push(`File: ${fileName}`);
  if (reportDate) parts.push(`Date: ${reportDate}`);
  if (section) parts.push(`Section: ${section}`);
  if (pageNumber) parts.push(`Page: ${pageNumber}`);
  parts.push(String(text || ""));
  return parts.join("\n");
};

const TEST_ALIASES = new Map([
  ["hba1c", "glycated hemoglobin"],
  ["hb a1c", "glycated hemoglobin"],
  ["hemoglobin a1c", "glycated hemoglobin"],
  ["haemoglobin a1c", "glycated hemoglobin"],
  ["hb", "hemoglobin"],
  ["haemoglobin", "hemoglobin"],
  ["t lc", "total leukocyte count"],
  ["tlc", "total leukocyte count"],
  ["wbc", "total leukocyte count"],
  ["white blood cells", "total leukocyte count"],
  ["white blood cell count", "total leukocyte count"],
  ["leukocytes", "total leukocyte count"],
  ["rbc", "red blood cell count"],
  ["red blood cells", "red blood cell count"],
  ["erythrocytes", "red blood cell count"],
  ["pcv", "packed cell volume"],
  ["hematocrit", "packed cell volume"],
  ["haematocrit", "packed cell volume"],
  ["mcv", "mean corpuscular volume"],
  ["mch", "mean corpuscular hemoglobin"],
  ["mchc", "mean corpuscular hemoglobin concentration"],
  ["rdw", "red cell distribution width"],
  ["platelet count", "platelets"],
  ["platelets", "platelets"],
  ["thrombocytes", "platelets"],
  ["mpv", "mean platelet volume"],
  ["glucose", "fasting blood glucose"],
  ["fbs", "fasting blood glucose"],
  ["fasting sugar", "fasting blood glucose"],
  ["fasting glucose", "fasting blood glucose"],
  ["ppbs", "postprandial blood glucose"],
  ["pp blood sugar", "postprandial blood glucose"],
  ["random blood sugar", "random blood glucose"],
  ["rbs", "random blood glucose"],
  ["urea", "blood urea"],
  ["bun", "blood urea nitrogen"],
  ["creatinine", "serum creatinine"],
  ["s cr", "serum creatinine"],
  ["uric acid", "uric acid"],
  ["na", "sodium"],
  ["sodium", "sodium"],
  ["k", "potassium"],
  ["potassium", "potassium"],
  ["cl", "chloride"],
  ["chloride", "chloride"],
  ["total calcium", "calcium"],
  ["calcium", "calcium"],
  ["phosphorus", "phosphorus"],
  ["phosphate", "phosphorus"],
  ["magnesium", "magnesium"],
  ["total protein", "total protein"],
  ["albumin", "albumin"],
  ["globulin", "globulin"],
  ["ag ratio", "albumin globulin ratio"],
  ["a/g ratio", "albumin globulin ratio"],
  ["total bilirubin", "total bilirubin"],
  ["bilirubin total", "total bilirubin"],
  ["direct bilirubin", "direct bilirubin"],
  ["bilirubin direct", "direct bilirubin"],
  ["conjugated bilirubin", "direct bilirubin"],
  ["indirect bilirubin", "indirect bilirubin"],
  ["unconjugated bilirubin", "indirect bilirubin"],
  ["sgpt", "alanine aminotransferase"],
  ["alt", "alanine aminotransferase"],
  ["alanine transaminase", "alanine aminotransferase"],
  ["sgot", "aspartate aminotransferase"],
  ["ast", "aspartate aminotransferase"],
  ["aspartate transaminase", "aspartate aminotransferase"],
  ["alkaline phosphatase", "alkaline phosphatase"],
  ["alp", "alkaline phosphatase"],
  ["ggt", "gamma glutamyl transferase"],
  ["gamma gt", "gamma glutamyl transferase"],
  ["ggtp", "gamma glutamyl transferase"],
  ["ldh", "lactate dehydrogenase"],
  ["lactate dehydrogenase", "lactate dehydrogenase"],
  ["amylase", "amylase"],
  ["lipase", "lipase"],
  ["total cholesterol", "total cholesterol"],
  ["cholesterol total", "total cholesterol"],
  ["serum cholesterol", "total cholesterol"],
  ["hdl", "hdl cholesterol"],
  ["hdl cholesterol", "hdl cholesterol"],
  ["hdl-c", "hdl cholesterol"],
  ["ldl", "ldl cholesterol"],
  ["ldl cholesterol", "ldl cholesterol"],
  ["ldl-c", "ldl cholesterol"],
  ["vldl", "vldl cholesterol"],
  ["vldl cholesterol", "vldl cholesterol"],
  ["non hdl cholesterol", "non hdl cholesterol"],
  ["triglycerides", "triglycerides"],
  ["tg", "triglycerides"],
  ["cholesterol/hdl ratio", "total cholesterol hdl ratio"],
  ["ldl/hdl ratio", "ldl hdl ratio"],
  ["tsh", "thyroid stimulating hormone"],
  ["thyroid stimulating hormone", "thyroid stimulating hormone"],
  ["ft3", "free t3"],
  ["free triiodothyronine", "free t3"],
  ["ft4", "free t4"],
  ["free thyroxine", "free t4"],
  ["total t3", "total t3"],
  ["triiodothyronine", "total t3"],
  ["total t4", "total t4"],
  ["thyroxine", "total t4"],
  ["esr", "erythrocyte sedimentation rate"],
  ["crp", "c reactive protein"],
  ["c reactive protein", "c reactive protein"],
  ["d dimer", "d dimer"],
  ["ferritin", "ferritin"],
  ["iron", "serum iron"],
  ["serum iron", "serum iron"],
  ["tibc", "total iron binding capacity"],
  ["transferrin saturation", "transferrin saturation"],
  ["ui bc", "unsaturated iron binding capacity"],
  ["uibc", "unsaturated iron binding capacity"],
  ["vitamin d", "vitamin d 25 oh"],
  ["vit d", "vitamin d 25 oh"],
  ["25 oh vitamin d", "vitamin d 25 oh"],
  ["25-hydroxyvitamin d", "vitamin d 25 oh"],
  ["vitamin b12", "vitamin b12"],
  ["vit b12", "vitamin b12"],
  ["folate", "folate"],
  ["folic acid", "folate"],
  ["rbc folate", "red cell folate"],
  ["homocysteine", "homocysteine"],
  ["lipase", "lipase"],
  ["prolactin", "prolactin"],
  ["hbv dna", "hepatitis b viral load"],
  ["hcv rna", "hepatitis c viral load"],
  ["hiv 1 2", "hiv antibodies"],
  ["anti hiv", "hiv antibodies"],
  ["hbsag", "hepatitis b surface antigen"],
  ["anti hbs", "hepatitis b surface antibody"],
  ["anti hcv", "hepatitis c antibody"],
  ["antigen", "antigen"],
  ["igg", "immunoglobulin g"],
  ["igm", "immunoglobulin m"],
]);

const normKey = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");

export const extractMentionedTests = (text) => {
  const t = String(text || "").toLowerCase();
  const matched = new Set();
  for (const [alias, canonical] of TEST_ALIASES.entries()) {
    const rx = new RegExp(`(?:^|[^a-z0-9])${escapeRegex(alias)}(?:$|[^a-z0-9])`, "i");
    if (rx.test(t)) {
      matched.add(canonical);
    }
  }
  return [...matched];
};

export const testKeyFor = (canonicalName, testName) => {
  const candidates = [canonicalName, testName].map(normKey).filter(Boolean);
  for (const c of candidates) {
    if (TEST_ALIASES.has(c)) return TEST_ALIASES.get(c);
  }
  for (const c of candidates) {
    for (const [alias, canonical] of TEST_ALIASES.entries()) {
      if (c.includes(alias) || alias.includes(c)) {
        if (Math.abs(c.length - alias.length) < 30 || c.includes(alias)) return canonical;
      }
    }
  }
  return candidates[0] || normKey(testName) || "unknown";
};

export const parseNumeric = (rawValue) => {
  if (rawValue == null) return null;
  const s = String(rawValue).trim();
  if (!s) return null;
  const stripped = s.replace(/[,\s]/g, "").replace(/<|>|=|mg|dl|ml|ul|ng|pg|g|l|iu|u|meq|mmol|mcmol|nmol|pmol|%|ratio|:.*$/gi, "");
  const m = /(-?\d+(?:\.\d+)?)/.exec(stripped);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
};

export const parseRefRange = (refText) => {
  const out = { low: null, high: null };
  if (!refText) return out;
  const s = String(refText).replace(/[,\s]/g, "");
  let m = /([<=>]+)\s*(-?\d+(?:\.\d+)?)/.exec(s);
  if (m) {
    const n = Number(m[2]);
    if (m[1].includes(">")) out.low = n;
    else if (m[1].includes("<")) out.high = n;
  }
  m = /(-?\d+(?:\.\d+)?)\s*[-–_toTO:]+\s*(-?\d+(?:\.\d+)?)/.exec(s);
  if (m) {
    out.low = Number(m[1]);
    out.high = Number(m[2]);
  }
  return out;
};

export const computeFlag = ({ value, low, high, reported }) => {
  const r = String(reported || "").toUpperCase();
  if (/\b(CRIT|CRITICAL|PANIC)\b/.test(r)) return "CRITICAL";
  if (/\b(H|HIGH|ELEV|RAIS|INC)\w*/.test(r)) return "HIGH";
  if (/\b(L|LOW|RED|DEC)\w*/.test(r)) return "LOW";
  if (/\b(N|NORMAL)\b/.test(r)) return "NORMAL";
  if (value == null) return "UNKNOWN";
  if (high != null && value > high) return "HIGH";
  if (low != null && value < low) return "LOW";
  if (low != null || high != null) return "NORMAL";
  return "UNKNOWN";
};

export const verifyAgainstSource = ({ sourceText, rawValue }, squashedFull = "") => {
  const src = squash(sourceText);
  const doc = squash(squashedFull);
  const v = String(rawValue || "").trim();
  if (!v) return false;

  if (doc) {
    if (src && doc.toLowerCase().includes(src.toLowerCase())) return true;
    const tokens = v.split(/[\s,]+/).filter((t) => t.length >= 1 && /[A-Za-z0-9]/.test(t));
    if (tokens.length && tokens.some((t) => doc.toLowerCase().includes(t.toLowerCase()))) return true;
  }

  if (!src) return false;
  const tokens = v.split(/[\s,]+/).filter((t) => t.length >= 1 && /[A-Za-z0-9]/.test(t));
  if (!tokens.length) return false;
  const srcL = src.toLowerCase();
  return tokens.some((t) => srcL.includes(t.toLowerCase()));
};

export function rrfFuse(lists, { limit = 20, k = 60 } = {}) {
  const scores = new Map();
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    list.forEach((id, rank) => {
      const key = String(id);
      scores.set(key, (scores.get(key) || 0) + 1 / (k + rank + 1));
    });
  }
  const arr = [...scores.entries()].map(([id, score]) => ({ id, score }));
  arr.sort((a, b) => b.score - a.score);
  return typeof limit === "number" ? arr.slice(0, limit) : arr;
}

export function bm25Rank(queryTokens, docs, { k1 = 1.5, b = 0.75 } = {}) {
  if (!Array.isArray(docs) || !docs.length) return [];
  const tokens = (t) => Array.isArray(t) ? t : tokenize(t);
  const docTokens = docs.map((d) => tokens(d.text));
  const avgLen = docTokens.reduce((s, t) => s + t.length, 0) / docTokens.length || 1;
  const df = new Map();
  for (const ts of docTokens) {
    const seen = new Set(ts);
    for (const t of seen) df.set(t, (df.get(t) || 0) + 1);
  }
  const N = docTokens.length;
  const qt = tokens(queryTokens).filter((t) => df.has(t));
  const scores = docTokens.map((ts, i) => {
    const freq = new Map();
    for (const t of ts) freq.set(t, (freq.get(t) || 0) + 1);
    let score = 0;
    const dl = ts.length;
    for (const t of qt) {
      const f = freq.get(t) || 0;
      if (!f) continue;
      const idf = Math.log(1 + (N - (df.get(t) || 0) + 0.5) / ((df.get(t) || 0) + 0.5));
      const denom = f + k1 * (1 - b + b * (dl / avgLen));
      score += idf * (f * (k1 + 1)) / denom;
    }
    return { id: String(docs[i].id ?? i), score };
  });
  scores.sort((a, b) => b.score - a.score);
  return scores;
}

export const windowAround = (parentText, matchedText, maxChars) => {
  const parent = String(parentText || "");
  const match = squash(String(matchedText || ""));
  if (!parent) return "";
  if (!match || parent.length <= maxChars) return parent.trim();
  let idx = -1;
  const needle = match.slice(0, 40).toLowerCase();
  if (needle.length >= 8) idx = parent.toLowerCase().indexOf(needle);
  if (idx < 0) {
    const firstWord = match.split(/\s+/).find((w) => w.length >= 4);
    if (firstWord) idx = parent.toLowerCase().indexOf(firstWord.toLowerCase());
  }
  const center = idx < 0 ? Math.floor(parent.length / 2) : idx + Math.floor(needle.length / 2);
  const start = Math.max(0, center - Math.floor(maxChars / 2));
  const end = Math.min(parent.length, start + maxChars);
  const slice = parent.slice(start, end);
  const prefix = start > 0 ? "\u2026" : "";
  const suffix = end < parent.length ? "\u2026" : "";
  return (prefix + slice + suffix).trim();
};

export function summarizeTrend(points) {
  const valid = (points || []).filter(
    (p) => p && p.value != null && Number.isFinite(Number(p.value)) && p.date
  );
  if (valid.length < 1) return null;
  valid.sort((a, b) => new Date(a.date) - new Date(b.date));
  const units = new Set(valid.map((p) => String(p.unit || "")).filter(Boolean));
  const comparable = units.size <= 1;
  const first = { value: Number(valid[0].value), date: new Date(valid[0].date), unit: valid[0].unit || "" };
  const last = { value: Number(valid[valid.length - 1].value), date: new Date(valid[valid.length - 1].date), unit: valid[valid.length - 1].unit || "" };
  const delta = last.value - first.value;
  let direction = "stable";
  if (comparable && valid.length >= 2) {
    const pct = first.value === 0 ? null : (delta / Math.abs(first.value)) * 100;
    const absPct = pct == null ? null : Math.abs(pct);
    if (absPct != null && absPct >= 5) direction = delta > 0 ? "increasing" : "decreasing";
    else if (Math.abs(delta) > 1e-9) direction = delta > 0 ? "slight increase" : "slight decrease";
    return { first, last, delta, pct, direction, count: valid.length, comparable };
  }
  return { first, last, delta: null, pct: null, direction: "insufficient data", count: valid.length, comparable };
}

export default {
  squash,
  toISODate,
  truncate,
  escapeRegex,
  cosine,
  tokenize,
  redactForLLM,
  looksLikeHeaderBlock,
  parseSections,
  buildEmbedText,
  testKeyFor,
  parseNumeric,
  parseRefRange,
  computeFlag,
  verifyAgainstSource,
  rrfFuse,
  bm25Rank,
  windowAround,
  summarizeTrend,
  extractMentionedTests,
};
