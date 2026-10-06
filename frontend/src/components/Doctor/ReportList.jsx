import React, { useState } from "react";
import ReportCard from "./ReportCard";

const ReportList = ({ reports = [], onRefresh, loading = false }) => {
  const [filterType, setFilterType] = useState("All");

  const categories = ["All", ...new Set(reports.map((r) => r.reportType).filter(Boolean))];

  const filteredReports =
    filterType === "All"
      ? reports
      : reports.filter((r) => r.reportType === filterType);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
      {/* HEADER & FILTER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span>📑</span>
            <span>Patient Medical Reports ({reports.length})</span>
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Reports indexed and available for clinical search
          </p>
        </div>

        <div className="flex items-center gap-2">
          {categories.length > 2 && (
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Types" : cat}
                </option>
              ))}
            </select>
          )}

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-1.5 text-slate-400 hover:text-teal-600 transition rounded-lg hover:bg-slate-50 cursor-pointer"
              title="Refresh reports"
            >
              <span className={loading ? "inline-block animate-spin" : ""}>🔄</span>
            </button>
          )}
        </div>
      </div>

      {/* LIST */}
      {loading && reports.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs font-medium">
          Loading patient reports...
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="py-8 text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl bg-slate-50 flex items-center justify-center text-2xl text-slate-400">
            📂
          </div>
          <p className="text-xs font-bold text-slate-700">No medical reports available</p>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
            The patient has not uploaded any reports yet or no reports match the selected category.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {filteredReports.map((report) => (
            <ReportCard key={report._id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportList;
