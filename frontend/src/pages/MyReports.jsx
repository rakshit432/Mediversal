import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import ReportUpload from '../components/ReportUpload';

const MyReports = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchReports = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/reports`, { headers: { token } });
      if (data.success) setReports(data.reports || []);
    } catch (error) {
      console.error('Fetch reports error:', error);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, token]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  useEffect(() => {
    const hasPending = reports.some(
      (r) => r.processingStatus === 'UPLOADED' || r.processingStatus === 'PROCESSING'
    );
    if (!hasPending) return;
    const interval = setInterval(fetchReports, 4000);
    return () => clearInterval(interval);
  }, [reports, fetchReports]);

  const handleDelete = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this medical report? This will remove all AI indices as well.')) return;
    try {
      setDeletingId(reportId);
      const { data } = await axios.delete(`${backendUrl}/api/reports/${reportId}`, { headers: { token } });
      if (data.success) {
        toast.success('Medical report deleted successfully');
        setReports((prev) => prev.filter((r) => r._id !== reportId));
      } else toast.error(data.message || 'Failed to delete report');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting report');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      READY:      { dot: 'bg-emerald-500', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: '✓ Ready for AI' },
      PROCESSING: { dot: 'bg-cyan-500 animate-ping',    cls: 'bg-cyan-50 text-cyan-700 border-cyan-200 animate-pulse',  label: '⚡ Extracting & Indexing...' },
      UPLOADED:   { dot: 'bg-blue-400',   cls: 'bg-blue-50 text-blue-700 border-blue-200',   label: '📤 Uploaded' },
      FAILED:     { dot: 'bg-rose-500',   cls: 'bg-rose-50 text-rose-700 border-rose-200',   label: '✗ Failed' },
    };
    const c = configs[status];
    if (!c) return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">{status}</span>;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${c.cls}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
        {c.label}
      </span>
    );
  };

  const readyCount = reports.filter((r) => r.processingStatus === 'READY').length;
  const processingCount = reports.filter((r) => r.processingStatus === 'PROCESSING' || r.processingStatus === 'UPLOADED').length;

  if (!token) return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="wellness-card p-10 text-center max-w-sm">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-black text-slate-800 mb-2">Authentication Required</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">Please log in to manage your medical reports.</p>
        <a href="/login" className="btn-primary text-xs">GO TO LOGIN</a>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8 page-enter">

      {/* Background blobs */}
      <div className="fixed hero-blob w-96 h-96 bg-teal-200/10 top-0 right-0 pointer-events-none" />

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div>
          <div className="section-label mb-3">
            🤖 RAG Clinical Intelligence
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            My Medical Reports
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1.5 max-w-lg">
            Securely store health reports. Authorized doctors can query them with AI during consultations.
          </p>
        </div>

        {/* Metrics */}
        <div className="flex items-center gap-3">
          <div className="wellness-card px-5 py-3.5 text-center min-w-24">
            <p className="text-2xl font-black text-slate-800">{reports.length}</p>
            <p className="text-[9px] uppercase font-black tracking-widest text-slate-400 mt-0.5">Total</p>
          </div>
          <div className="wellness-card px-5 py-3.5 text-center min-w-24 border-emerald-100 bg-emerald-50/40">
            <p className="text-2xl font-black text-emerald-700">{readyCount}</p>
            <p className="text-[9px] uppercase font-black tracking-widest text-emerald-500 mt-0.5">Indexed</p>
          </div>
          {processingCount > 0 && (
            <div className="wellness-card px-5 py-3.5 text-center min-w-24 border-cyan-100 bg-cyan-50/40 animate-pulse">
              <p className="text-2xl font-black text-cyan-700">{processingCount}</p>
              <p className="text-[9px] uppercase font-black tracking-widest text-cyan-500 mt-0.5">Processing</p>
            </div>
          )}
        </div>
      </div>

      {/* UPLOAD */}
      <ReportUpload onUploadSuccess={fetchReports} />

      {/* REPORTS LIST */}
      <div className="wellness-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-teal-50/30
                        flex items-center justify-between">
          <h2 className="text-base font-black text-slate-800">
            Uploaded Documents ({reports.length})
          </h2>
          <button
            onClick={fetchReports}
            className="text-xs font-bold text-teal-600 hover:text-teal-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <span className="text-base">🔄</span> Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-16 text-center">
            <div className="wellness-loader mx-auto mb-4" />
            <p className="text-slate-400 font-semibold text-sm">Loading medical records...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-50 border border-slate-100
                            flex items-center justify-center text-3xl">
              📂
            </div>
            <p className="text-sm font-black text-slate-700">No medical reports uploaded yet</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
              Use the upload panel above to add blood tests, prescriptions, or imaging reports.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100/80">
            {reports.map((report, idx) => (
              <div
                key={report._id}
                className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4
                           hover:bg-gradient-to-r hover:from-teal-50/30 hover:to-transparent transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  {/* File icon */}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50
                                  border border-teal-100 flex items-center justify-center text-2xl shrink-0">
                    {report.fileType?.includes('pdf') ? '📑' : '🖼️'}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-black text-slate-800 break-all">{report.fileName}</p>
                      <span className="specialty-chip">{report.reportType}</span>
                      {getStatusBadge(report.processingStatus)}
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                      Uploaded{' '}
                      {new Date(report.uploadedAt || report.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                      {report.chunkCount > 0 && ` · ${report.chunkCount} vector segments`}
                    </p>
                    {report.processingStatus === 'FAILED' && report.errorMessage && (
                      <p className="text-xs text-rose-600 font-semibold">⚠️ {report.errorMessage}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {report.fileUrl && (
                    <a
                      href={report.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 text-xs font-bold text-slate-600 bg-slate-50
                                 hover:bg-slate-100 border border-slate-200 rounded-xl transition
                                 flex items-center gap-1.5"
                    >
                      👁️ View
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(report._id)}
                    disabled={deletingId === report._id}
                    className="px-3.5 py-2 text-xs font-bold text-rose-600 bg-rose-50
                               hover:bg-rose-100 border border-rose-100 rounded-xl transition
                               flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {deletingId === report._id ? (
                      <span className="w-3.5 h-3.5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                    ) : '🗑️'}
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReports;
