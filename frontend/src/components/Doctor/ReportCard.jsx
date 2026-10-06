import React from "react";

const ReportCard = ({ report }) => {
  if (!report) return null;

  const isPdf = report.fileType?.includes("pdf") || report.fileName?.endsWith(".pdf");

  const getStatusBadge = (status) => {
    switch (status) {
      case "READY":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Indexed for AI
          </span>
        );
      case "PROCESSING":
      case "UPLOADED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping"></span>
            Indexing...
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-4 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-teal-600 flex items-center justify-center text-lg font-bold shrink-0 shadow-2xs">
          {isPdf ? "📑" : "🖼️"}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-bold text-slate-800 break-all">{report.fileName}</h4>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
              {report.reportType}
            </span>
            {getStatusBadge(report.processingStatus)}
          </div>

          <p className="text-xs text-slate-400 font-medium mt-1">
            Uploaded:{" "}
            {new Date(report.uploadedAt || report.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            {report.chunkCount > 0 && ` • ${report.chunkCount} vector chunks`}
          </p>
        </div>
      </div>

      {report.fileUrl && (
        <a
          href={report.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="self-end sm:self-center px-3.5 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition flex items-center gap-1.5 shrink-0"
        >
          <span>👁️</span>
          <span>View Report</span>
        </a>
      )}
    </div>
  );
};

export default ReportCard;
