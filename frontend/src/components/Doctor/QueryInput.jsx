import React, { useState } from "react";

const SUGGESTED_QUERIES = [
  "What was the patient's hemoglobin level in the latest report?",
  "Summarize abnormal blood panel / CBC values",
  "Check fasting blood glucose and HbA1c results",
  "What medications or prescriptions are listed?",
  "Are there any liver or kidney function anomalies?",
];

const QueryInput = ({ onSubmit, loading = false, disabled = false }) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim() || loading || disabled) return;
    onSubmit(query.trim());
  };

  const handleChipClick = (presetQuery) => {
    if (loading || disabled) return;
    setQuery(presetQuery);
    onSubmit(presetQuery);
  };

  return (
    <div className="space-y-3">
      {/* QUICK PROMPT CHIPS */}
      <div>
        <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
          Suggested Clinical Queries:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_QUERIES.map((sq, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleChipClick(sq)}
              disabled={loading || disabled}
              className="text-left text-[11px] font-semibold text-teal-800 bg-teal-50/70 hover:bg-teal-100/80 border border-teal-200/70 px-3 py-1 rounded-full transition cursor-pointer disabled:opacity-50"
            >
              ⚡ {sq}
            </button>
          ))}
        </div>
      </div>

      {/* INPUT FORM */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Ask a natural language question about patient's medical reports..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading || disabled}
            className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition disabled:opacity-60"
          />
          {query && !loading && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={!query.trim() || loading || disabled}
          className={`px-5 py-3 rounded-2xl text-xs font-bold tracking-wider text-white transition-all duration-200 flex items-center gap-2 shrink-0 ${
            !query.trim() || loading || disabled
              ? "bg-slate-300 cursor-not-allowed"
              : "bg-teal-600 hover:bg-teal-700 shadow-sm hover:shadow-md active:scale-95 cursor-pointer"
          }`}
        >
          {loading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Searching...</span>
            </>
          ) : (
            <>
              <span>Ask AI</span>
              <span>✨</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default QueryInput;
