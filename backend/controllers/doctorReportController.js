import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";
import medicalReportModel from "../models/medicalReportModel.js";
import { queryPatientReports as executeRagQuery } from "../services/rag/queryService.js";

/**
 * Helper to verify doctor authorization for a specific patient
 */
async function verifyDoctorAuthorization(docId, patientId) {
  if (!docId || !patientId) return false;

  const appointment = await appointmentModel.findOne({
    docId,
    userId: patientId,
  });

  return Boolean(appointment);
}

/**
 * Get Patient Information for Doctor Clinical Workspace
 * Endpoint: GET /api/doctor/patients/:patientId
 * Auth: authDoctor (req.docId)
 */
export const getPatientDetails = async (req, res) => {
  try {
    const docId = req.docId;
    const { patientId } = req.params;

    if (!docId) {
      return res.status(401).json({ success: false, message: "Doctor authentication required" });
    }

    // 🔒 Enforce doctor-patient appointment relationship
    const isAuthorized = await verifyDoctorAuthorization(docId, patientId);
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to access this patient's clinical workspace. An appointment relationship is required.",
      });
    }

    const patient = await userModel.findById(patientId).select("-password");
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    // Get latest appointment with this doctor
    const appointments = await appointmentModel
      .find({ docId, userId: patientId })
      .sort({ slotDate: -1, date: -1 })
      .limit(5);

    res.json({
      success: true,
      patient,
      appointments: appointments || [],
    });
  } catch (error) {
    console.error("Get patient details error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve patient profile",
    });
  }
};

/**
 * Get Patient Medical Reports for Doctor
 * Endpoint: GET /api/doctor/patients/:patientId/reports
 * Auth: authDoctor (req.docId)
 */
export const getPatientReportsForDoctor = async (req, res) => {
  try {
    const docId = req.docId;
    const { patientId } = req.params;

    if (!docId) {
      return res.status(401).json({ success: false, message: "Doctor authentication required" });
    }

    // 🔒 Enforce doctor-patient appointment relationship
    const isAuthorized = await verifyDoctorAuthorization(docId, patientId);
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to access this patient's reports.",
      });
    }

    const reports = await medicalReportModel
      .find({ patientId })
      .sort({ uploadedAt: -1, createdAt: -1 });

    res.json({
      success: true,
      reports: reports || [],
    });
  } catch (error) {
    console.error("Get patient reports for doctor error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch patient reports",
    });
  }
};

/**
 * RAG Query Patient Reports
 * Endpoint: POST /api/doctor/patients/:patientId/query
 * Auth: authDoctor (req.docId)
 * Body: { query: string, topK?: number }
 */
export const queryPatientReports = async (req, res) => {
  try {
    const docId = req.docId;
    const { patientId } = req.params;
    const { query, topK } = req.body;

    if (!docId) {
      return res.status(401).json({ success: false, message: "Doctor authentication required" });
    }

    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: "A non-empty query string is required",
      });
    }

    // 🔒 Enforce doctor-patient appointment relationship
    const isAuthorized = await verifyDoctorAuthorization(docId, patientId);
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to query this patient's medical records.",
      });
    }

    const result = await executeRagQuery({
      patientId,
      query: query.trim(),
      topK: topK ? Number(topK) : 4,
    });

    res.json(result);
  } catch (error) {
    console.error("Doctor RAG Query error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process clinical query",
    });
  }
};

export default {
  getPatientDetails,
  getPatientReportsForDoctor,
  queryPatientReports,
};
