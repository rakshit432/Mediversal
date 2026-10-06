import React from "react";

const SourceCitation = ({ sources = [] }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Source Citations ({sources.length})
        </span>
        <span className="text-[10px] text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full font-bold">
          Grounded Citations
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {sources.map((src, idx) => (
          <div
            key={idx}
            className="bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs transition space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 truncate">
                <span className="text-teal-600 font-extrabold text-[11px] bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded">
                  #{idx + 1}
                </span>
                <span className="truncate" title={src.fileName}>
                  {src.fileName}
                </span>
              </div>

              {src.pageNumber && (
                <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded shrink-0">
                  Page {src.pageNumber}
                </span>
              )}
            </div>

            {src.snippet && (
              <p className="text-[11px] text-slate-600 font-mono bg-white/70 p-2 rounded-lg border border-slate-150 line-clamp-3 leading-relaxed">
                "{src.snippet}"
              </p>
            )}

            {src.fileUrl && (
              <div className="flex justify-end pt-0.5">
                <a
                  href={src.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-teal-600 hover:text-teal-700 transition flex items-center gap-1"
                >
                  <span>Open Document</span>
                  <span>↗</span>
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SourceCitation;
