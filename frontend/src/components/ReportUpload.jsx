import React, { useState, useContext, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';

export const REPORT_TYPES = [
  'Blood Test', 'CBC', 'Diabetes', 'Liver Function', 'Kidney Function',
  'Prescription', 'X-Ray', 'MRI', 'CT Scan', 'Other',
];

const ReportUpload = ({ onUploadSuccess }) => {
  const { backendUrl, token } = useContext(AppContext);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [reportType, setReportType] = useState('Blood Test');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Invalid file format. Please upload a PDF or image (JPG, PNG).');
      return;
    }
    if (selectedFile.size > 15 * 1024 * 1024) { toast.error('File is too large. Maximum size is 15MB.'); return; }
    setFile(selectedFile);
    if (!fileName) setFileName(selectedFile.name.replace(/\.[^/.]+$/, ''));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Please select a file to upload.'); return; }
    if (!token) { toast.error('You must be logged in to upload reports.'); return; }
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', fileName.trim() || file.name);
      formData.append('reportType', reportType);
      const { data } = await axios.post(`${backendUrl}/api/reports/upload`, formData, {
        headers: { token, 'Content-Type': 'multipart/form-data' },
      });
      if (data.success) {
        toast.success(data.message || 'Medical report uploaded and indexing started! 🤖');
        setFile(null); setFileName(''); setReportType('Blood Test');
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (onUploadSuccess) onUploadSuccess(data.report);
      } else toast.error(data.message || 'Failed to upload report');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Error uploading report');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="wellness-card p-6 sm:p-7">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="feature-icon">📄</div>
        <div>
          <h2 className="text-lg font-black text-slate-800">Upload Medical Report</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Upload lab reports, prescriptions, or scans for AI-powered clinical indexing
          </p>
        </div>
      </div>

      <form onSubmit={handleUpload} className="space-y-5">

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? 'border-teal-500 bg-teal-50/60 scale-[1.01]'
              : file
              ? 'border-emerald-300 bg-emerald-50/40'
              : 'border-slate-200 hover:border-teal-400 bg-slate-50/40 hover:bg-teal-50/20'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0])}
          />

          {file ? (
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200
                              text-emerald-700 flex items-center justify-center text-2xl font-bold">
                {file.name.endsWith('.pdf') ? '📑' : '🖼️'}
              </div>
              <div className="text-left">
                <p className="text-sm font-black text-slate-800 truncate max-w-xs sm:max-w-sm">{file.name}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB · Click or drag to replace
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                ✓
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50
                              border border-teal-100 flex items-center justify-center text-3xl">
                ☁️
              </div>
              <div>
                <p className="text-sm font-black text-slate-700">
                  Drag & drop or click to browse
                </p>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Supports PDF, JPG, PNG, WebP · Max 15MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
              Report Title
            </label>
            <input
              type="text"
              placeholder="e.g. CBC — October 2026"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="input-wellness text-sm"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
              Report Category
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="input-wellness text-sm cursor-pointer"
            >
              {REPORT_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={!file || uploading}
            className={`btn-primary text-[11px] ${!file || uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {uploading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading & Starting Ingestion...
              </>
            ) : (
              <>UPLOAD & INDEX REPORT →</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportUpload;
