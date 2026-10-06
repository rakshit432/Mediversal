import express from "express";
import upload from "../middlewares/multer.js";
import authUser from "../middlewares/authUser.js";
import {
  uploadReport,
  getPatientReports,
  deleteReport,
} from "../controllers/reportController.js";

const reportRouter = express.Router();

// Upload report
reportRouter.post("/upload", authUser, upload.single("file"), uploadReport);

// Get patient's reports
reportRouter.get("/", authUser, getPatientReports);

// Delete report
reportRouter.delete("/:reportId", authUser, deleteReport);

export default reportRouter;
