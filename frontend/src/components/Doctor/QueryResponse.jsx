import React, { useState } from "react";
import SourceCitation from "./SourceCitation";

const QueryResponse = ({ queryResult, currentQuery }) => {
  const [copied, setCopied] = useState(false);

  if (!queryResult && !currentQuery) return null;

  const handleCopy = () => {
    if (!queryResult?.answer) return;
    navigator.clipboard.writeText(queryResult.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format text with paragraph breaks and bullet highlighting
  const renderFormattedAnswer = (text) => {
    if (!text) return null;

    const lines = text.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} className="h-2"></div>;
      }

      if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
        return (
          <li key={idx} className="ml-4 list-disc text-slate-700 leading-relaxed">
            {trimmed.replace(/^[-•*]\s*/, "")}
          </li>
        );
      }

      if (/^\d+\.\s/.test(trimmed)) {
        return (
          <li key={idx} className="ml-4 list-decimal text-slate-700 leading-relaxed">
            {trimmed.replace(/^\d+\.\s*/, "")}
          </li>
        );
      }

      return (
        <p key={idx} className="text-slate-700 leading-relaxed">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-teal-200/80 p-6 shadow-sm space-y-4">
      {/* QUESTION HEADER */}
      {currentQuery && (
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
              Q
            </span>
            <p className="text-xs font-bold text-slate-800">
              "{currentQuery}"
            </p>
          </div>

          <button
            onClick={handleCopy}
            disabled={!queryResult?.answer}
            className="text-xs font-bold text-slate-400 hover:text-teal-600 transition flex items-center gap-1 cursor-pointer"
          >
            <span>{copied ? "✓ Copied" : "📋 Copy"}</span>
          </button>
        </div>
      )}

      {/* AI ANSWER */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
            <span>✨</span>
            <span>Gemini 2.5 Flash Grounded Response</span>
          </span>
        </div>

        <div className="text-xs font-medium space-y-1.5 bg-slate-50/60 p-4 rounded-xl border border-slate-100">
          {renderFormattedAnswer(queryResult.answer)}
        </div>
      </div>

      {/* SOURCES */}
      {queryResult.sources && queryResult.sources.length > 0 && (
        <SourceCitation sources={queryResult.sources} />
      )}

      {/* DISCLAIMER */}
      <p className="text-[10px] text-slate-400 font-medium italic pt-2 border-t border-slate-100">
        ℹ️ Clinical AI queries are generated strictly from uploaded patient records to assist medical review. Verify all clinical decisions with primary lab results.
      </p>
    </div>
  );
};

export default QueryResponse;
