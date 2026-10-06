import medicalReportModel from "../models/medicalReportModel.js";
import reportChunkModel from "../models/reportChunkModel.js";
import reportSectionModel from "../models/reportsectionModel.js";
import labResultModel from "../models/labResultModel.js";
import { processMedicalReport } from "../services/rag/ingestionService.js";
import { uploadToStorage, deleteFromStorage } from "../config/cloudinary.js";

/**
 * Upload a medical report (PDF, Image)
 * Endpoint: POST /api/reports/upload
 * Auth: authUser (req.userId)
 */
export const uploadReport = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const patientId = req.userId;
    if (!patientId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const reportType = req.body.reportType || "Other";
    const fileName = req.body.fileName?.trim() || file.originalname || "Medical Report";

    // 1. Upload to Cloudinary (or LOCAL FALLBACK if offline/DNS fails)
    const storageResult = await uploadToStorage(file.path, {
      resource_type: "auto",
      folder: "mediversal_patient_reports",
    });

    if (storageResult.fallback) {
      console.warn(`[reportUpload] Using local fallback for "${fileName}" (reason: ${storageResult.local_fallback_reason || 'offline'})`);
    }

    // 2. Create DB entry in 'UPLOADED' state
    const newReport = new medicalReportModel({
      patientId,
      fileName,
      fileUrl: storageResult.secure_url,
      fileType: file.mimetype || "application/octet-stream",
      reportType,
      uploadedAt: new Date(),
      processingStatus: "UPLOADED",
      chunkCount: 0,
      errorMessage: storageResult.fallback
        ? `Storage: local fallback (${storageResult.local_fallback_reason || 'offline'})`
        : "",
      metadata: {
        cloudinaryPublicId: storageResult.public_id,
        sizeBytes: file.size,
        storageMode: storageResult.fallback ? 'local' : 'cloudinary',
      },
    });

    await newReport.save();

    // 3. Return immediate response (non-blocking)
    res.status(201).json({
      success: true,
      message: storageResult.fallback
        ? `Medical report uploaded successfully (local mode: ${storageResult.local_fallback_reason || 'offline'}). Processing started.`
        : "Medical report uploaded successfully. Processing and vector indexing started.",
      report: newReport,
    });

    // 4. Asynchronously launch extraction -> LangChain chunking -> text-embedding-004 vector indexing
    processMedicalReport(newReport._id, file.path, file.originalname).catch((err) => {
      console.error(`Async ingestion failure for report ${newReport._id}:`, err);
    });
  } catch (error) {
    console.error("Upload report error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to upload medical report",
    });
  }
};

/**
 * Get all reports for the logged-in patient
 * Endpoint: GET /api/reports
 * Auth: authUser (req.userId)
 */
export const getPatientReports = async (req, res) => {
  try {
    const patientId = req.userId;
    if (!patientId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const reports = await medicalReportModel
      .find({ patientId })
      .sort({ uploadedAt: -1, createdAt: -1 });

    res.json({
      success: true,
      reports: reports || [],
    });
  } catch (error) {
    console.error("Get patient reports error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch medical reports",
    });
  }
};

/**
 * Delete a report belonging to the logged-in patient
 * Endpoint: DELETE /api/reports/:reportId
 * Auth: authUser (req.userId)
 */
export const deleteReport = async (req, res) => {
  try {
    const patientId = req.userId;
    const { reportId } = req.params;

    if (!patientId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const report = await medicalReportModel.findById(reportId);
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    // Verify ownership
    if (report.patientId.toString() !== patientId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not own this report",
      });
    }

    // Delete the Cloudinary / local file
    try {
      await deleteFromStorage(report.metadata?.cloudinaryPublicId, {
        resource_type: 'auto',
      });
    } catch (delErr) {
      console.warn(`[deleteReport] Non-fatal storage cleanup error: ${delErr?.message || delErr}`);
    }

    // Delete associated vector chunks, report sections, and lab results
    await Promise.all([
      reportChunkModel.deleteMany({ reportId }),
      reportSectionModel.deleteMany({ reportId }),
      labResultModel.deleteMany({ reportId }),
    ]);

    // Delete the report record
    await medicalReportModel.findByIdAndDelete(reportId);

    res.json({
      success: true,
      message: "Medical report and its vector indices deleted successfully",
    });
  } catch (error) {
    console.error("Delete report error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete medical report",
    });
  }
};

export default {
  uploadReport,
  getPatientReports,
  deleteReport,
};
