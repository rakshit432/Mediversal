import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  docId: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true },
  slotDate: { type: Date, required: true },
  slotTime: { type: String, required: true },
  userData: { type: Object, required: true },
  docData: { type: Object, required: true },
  amount: { type: Number, required: true },
  date: { type: Number, required: true },
  cancelled: { type: Boolean, default: false },
  payment: { type: Boolean, default: false },
  paymentMethod: { type: String, default: 'Cash' },
  isCompleted: { type: Boolean, default: false }
})

const appointmentModel = mongoose.model('appointments', appointmentSchema);

export default appointmentModel;