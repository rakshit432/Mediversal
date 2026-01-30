import validator from 'validator';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import doctorModel from '../models/doctorModel.js';
import appointmentModel from '../models/appointmentModel.js';
import razorpay from 'razorpay';
import 'dotenv/config';

/* ======================================================
   REGISTER USER
====================================================== */
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "All fields are required" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Invalid email" });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Password must be at least 8 characters" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      name,
      email,
      password: hashedPassword
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ success: true, token });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error in user registration" });
  }
};

/* ======================================================
   LOGIN USER
====================================================== */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ success: true, token });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error in user login" });
  }
};

/* ======================================================
   GET USER PROFILE
====================================================== */
const getProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const userData = await userModel
      .findById(userId)
      .select('-password');

    res.json({ success: true, userData });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

/* ======================================================
   UPDATE USER PROFILE
====================================================== */
const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, phone, gender, dob, address } = req.body;
    const imageFile = req.file;

    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (gender !== undefined) updateData.gender = gender;
    if (dob !== undefined) updateData.dob = dob;

    if (address !== undefined) {
      try {
        updateData.address =
          typeof address === 'string' ? JSON.parse(address) : address;
      } catch {
        updateData.address = {};
      }
    }

    if (imageFile) {
      const uploadRes = await cloudinary.uploader.upload(
        imageFile.path,
        { resource_type: 'image' }
      );
      updateData.image = uploadRes.secure_url;
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: "Profile updated successfully",
      userData: updatedUser
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error in updating profile" });
  }
};

/* ======================================================
   BOOK APPOINTMENT
====================================================== */
const bookAppointment = async (req, res) => {
  try {
    const userId = req.userId;
    const { docId, slotDate, slotTime } = req.body;

    const docData = await doctorModel.findById(docId).select('-password');
    if (!docData || !docData.available) {
      return res.json({ success: false, message: "Doctor not available" });
    }

    let slots_booked = docData.slots_booked || {};

    if (slots_booked[slotDate]?.includes(slotTime)) {
      return res.json({ success: false, message: "Slot already booked" });
    }

    slots_booked[slotDate] = slots_booked[slotDate] || [];
    slots_booked[slotDate].push(slotTime);

    const userData = await userModel.findById(userId).select('-password');
    delete docData.slots_booked;

    const [day, month, year] = slotDate.split('_');
    const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    const appointment = await appointmentModel.create({
      userId,
      docId,
      slotDate: new Date(formattedDate),
      slotTime,
      userData,
      docData,
      amount: docData.fees,
      date: Date.now()
    });

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({
      success: true,
      message: "Appointment booked successfully",
      appointmentId: appointment._id
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error booking appointment" });
  }
};

/* ======================================================
   LIST APPOINTMENTS
====================================================== */
const listAppointment = async (req, res) => {
  try {
    const userId = req.userId;

    const appointments = await appointmentModel
      .find({ userId })
      .sort({ date: -1 });

    res.json({ success: true, appointments });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

/* ======================================================
   CANCEL APPOINTMENT
====================================================== */
const cancelAppointment = async (req, res) => {
  try {
    const userId = req.userId;
    const { appointmentId } = req.body;

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment || appointment.userId.toString() !== userId) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    const doc = await doctorModel.findById(appointment.docId);
    let slots_booked = doc.slots_booked || {};

    const d = new Date(appointment.slotDate);
    const slotKey = `${d.getDate()}_${d.getMonth() + 1}_${d.getFullYear()}`;

    slots_booked[slotKey] =
      slots_booked[slotKey]?.filter(t => t !== appointment.slotTime) || [];

    if (!slots_booked[slotKey].length) delete slots_booked[slotKey];

    await doctorModel.findByIdAndUpdate(doc._id, { slots_booked });
    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

    res.json({ success: true, message: "Appointment cancelled" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error cancelling appointment" });
  }
};

/* ======================================================
   RAZORPAY
====================================================== */
/* ======================================================
   RAZORPAY
====================================================== */
const getRazorpayInstance = () =>
  new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });

const paymentrazorpay = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment || appointment.cancelled) {
      return res.json({ success: false, message: "Appointment cancelled or not found" });
    }

    const razorpayInstance = getRazorpayInstance();
    const order = await razorpayInstance.orders.create({
      amount: appointment.amount * 100,
      currency: "INR",
      receipt: appointmentId
    });

    res.json({ success: true, order });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      const razorpayInstance = getRazorpayInstance();
      const order = await razorpayInstance.orders.fetch(razorpay_order_id);

      if (order.receipt) {
        await appointmentModel.findByIdAndUpdate(order.receipt, { payment: true, paymentMethod: "Online" });
        return res.json({ success: true, message: "Payment successful" });
      } else {
        return res.json({ success: false, message: "Appointment mapping failed" });
      }

    } else {
      return res.json({ success: false, message: "Payment verification failed" });
    }

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

/* ======================================================
   EXPORTS
====================================================== */
export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentrazorpay,
  verifyRazorpay
};
