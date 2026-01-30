import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv";

/* ======================================================
   DOCTOR LOGIN
====================================================== */

const loginDoctor = async (req, res) => {
  try {
    console.log("Doctor login payload:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({ success: false, message: "Email/password missing" });
    }

    const doctor = await doctorModel.findOne({ email });
    console.log("Doctor found:", doctor ? doctor._id : "None");

    if (!doctor) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    if (!doctor.password) {
      return res.json({ success: false, message: "Password missing in DB" });
    }

    console.log("Comparing passwords...");
    const isMatch = await bcrypt.compare(password, doctor.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing");
    }

    const token = jwt.sign(
      { id: doctor._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ success: true, token });

  } catch (error) {
    console.error("LOGIN CRASH:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   CHANGE AVAILABILITY (AUTH REQUIRED)
====================================================== */
const changeAvailability = async (req, res) => {
  try {
    const { docId } = req.body;

    const doctor = await doctorModel.findById(docId);
    if (!doctor) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    doctor.available = !doctor.available;
    await doctor.save();

    res.json({
      success: true,
      message: `Doctor is now ${doctor.available ? "Available" : "Unavailable"}`
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error updating availability" });
  }
};

/* ======================================================
   GET ALL DOCTORS (PUBLIC)
====================================================== */
const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password");
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

/* ======================================================
   DOCTOR APPOINTMENTS
====================================================== */
const appointmentDoctor = async (req, res) => {
  try {
    const docId = req.docId;

    const appointments = await appointmentModel
      .find({ docId })
      .sort({ date: -1 });

    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching appointments" });
  }
};

/* ======================================================
   COMPLETE APPOINTMENT
====================================================== */
const appointmentComplete = async (req, res) => {
  try {
    const docId = req.docId;
    const { appointmentId } = req.body;

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment || appointment.docId.toString() !== docId) {
      return res.json({ success: false, message: "Unauthorized action" });
    }

    const updateData = { completed: true };
    if (!appointment.payment && appointment.paymentMethod === 'Cash') {
      updateData.payment = true;
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, updateData);

    res.json({ success: true, message: "Appointment completed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error completing appointment" });
  }
};

/* ======================================================
   CANCEL APPOINTMENT
====================================================== */
const appointmentCancel = async (req, res) => {
  try {
    const docId = req.docId;
    const { appointmentId } = req.body;

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment || appointment.docId.toString() !== docId) {
      return res.json({ success: false, message: "Unauthorized action" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true
    });

    res.json({ success: true, message: "Appointment cancelled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error cancelling appointment" });
  }
};

/* ======================================================
   DOCTOR DASHBOARD
====================================================== */
const doctorDashboard = async (req, res) => {
  try {
    const docId = req.docId; // ✅ comes from authDoctor middleware

    if (!docId) {
      return res.json({
        success: false,
        message: "Doctor not authorized",
      });
    }

    const appointments = await appointmentModel
      .find({ docId })
      .populate("userId", "name image dob")
      .sort({ createdAt: -1 });

    let earnings = 0;
    const patientSet = new Set();

    appointments.forEach((item) => {
      if (item.payment && item.completed) {
        earnings += item.amount;
      }
      if (item.userId) {
        const patientId = item.userId._id ? item.userId._id.toString() : item.userId.toString();
        patientSet.add(patientId);
      }
    });

    res.json({
      success: true,
      dashData: {
        earning: earnings,
        appointments: appointments.length,
        patients: patientSet.size,
        latestAppointments: appointments.slice(0, 5).map((item) => ({
          ...item._doc,
          userData: item.userId,
        })),
      },
    });
  } catch (error) {
    console.error("Doctor dashboard error:", error);
    res.json({
      success: false,
      message: "Error fetching dashboard data",
    });
  }
};




/* ======================================================
   DOCTOR PROFILE
====================================================== */
const doctorProfile = async (req, res) => {
  try {
    const docId = req.docId;

    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    res.json({ success: true, docData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching doctor profile" });
  }
};

/* ======================================================
   UPDATE DOCTOR PROFILE
====================================================== */
const updateDoctorProfile = async (req, res) => {
  try {
    const docId = req.docId;
    const { name, speciality, experience, fees, phone, address } = req.body;

    await doctorModel.findByIdAndUpdate(docId, {
      name,
      speciality,
      experience,
      fees,
      phone,
      address,
    });

    res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error updating doctor profile" });
  }
};

export {
  loginDoctor,
  changeAvailability,
  doctorList,
  appointmentDoctor,
  appointmentComplete,
  appointmentCancel,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
};
