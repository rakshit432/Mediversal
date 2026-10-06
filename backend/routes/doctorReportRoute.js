import express from "express";
import authDoctor from "../middlewares/authDoctor.js";
import {
  getPatientDetails,
  getPatientReportsForDoctor,
  queryPatientReports,
} from "../controllers/doctorReportController.js";

const doctorReportRouter = express.Router();

// Get patient basic profile & clinical metadata
doctorReportRouter.get("/:patientId", authDoctor, getPatientDetails);

// Get patient's uploaded medical reports
doctorReportRouter.get("/:patientId/reports", authDoctor, getPatientReportsForDoctor);

// Query patient reports with RAG
doctorReportRouter.post("/:patientId/query", authDoctor, queryPatientReports);

export default doctorReportRouter;
