import express from "express";
import {
  doctorList,
  loginDoctor,
  appointmentDoctor,
  appointmentComplete,
  appointmentCancel,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
  changeAvailability, 
} from "../controllers/doctorcontroller.js";

import authDoctor from "../middlewares/authDoctor.js";

const doctorRouter = express.Router();

/* ================= PUBLIC ================= */
doctorRouter.get("/list", doctorList);
doctorRouter.post("/login", loginDoctor);

/* ================= DOCTOR AUTH ================= */
doctorRouter.get("/appointments", authDoctor, appointmentDoctor);
doctorRouter.post("/appointments/complete", authDoctor, appointmentComplete);
doctorRouter.post("/appointments/cancel", authDoctor, appointmentCancel);

doctorRouter.get("/dashboard", authDoctor, doctorDashboard);
doctorRouter.get("/profile", authDoctor, doctorProfile);
doctorRouter.put("/profile", authDoctor, updateDoctorProfile);

doctorRouter.post("/availability", authDoctor, changeAvailability);

export default doctorRouter;
