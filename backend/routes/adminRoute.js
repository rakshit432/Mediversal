import express from 'express';
import { addDoctor, loginAdmin, allDoctors, appointmentsAdmin, appointmentCancel } from '../controllers/admincontroller.js';
import { changeAvailability } from '../controllers/doctorController.js';
import upload from '../middlewares/multer.js';
import authAdmin from '../middlewares/authAdmin.js';
import { adminDashboard } from '../controllers/admincontroller.js';

const adminRouter = express.Router();

adminRouter.post('/add-doctor', upload.single('image'), addDoctor);
adminRouter.get('/all-doctors', authAdmin, allDoctors);
adminRouter.post('/login', loginAdmin);
adminRouter.post('/change-availability', authAdmin, changeAvailability);
adminRouter.get('/appointments', authAdmin, appointmentsAdmin);
adminRouter.post('/cancel-appointment', authAdmin, appointmentCancel);
adminRouter.get('/dashboard', authAdmin, adminDashboard);
export default adminRouter;