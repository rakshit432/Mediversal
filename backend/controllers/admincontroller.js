//API for adding a doctor by admin
import 'dotenv/config';
import bcrypt from 'bcrypt';
import {v2 as cloudinary} from 'cloudinary';
import validator from 'validator';
import doctorModel from '../models/doctorModel.js';
import jwt from 'jsonwebtoken';
import appointmentModel from '../models/appointmentModel.js';
import userModel from '../models/userModel.js';

const addDoctor = async (req,res) => {

    try{
        const{name,email,password,speciality,experience,degree,about,fees,address} = req.body;
        const imageFile = req.file ;
        
        if(!imageFile||!name||!email||!password||!speciality||!experience||!degree||!about||!fees||!address)
        {
            return res.json({success:false,message:"All fields are required"});
        }
        
        //validating email
        if(!validator.isEmail(email))
        {
            return res.json({success:false,message:"Invalid Email"});
        }

        //validating strong password
        if(password.length<8)
        {
            return res.json({success:false,message:"Password must be at least 8 characters"});
        }

        //hashing strong password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        //upload image to cloudinary
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        const imageUpload = await cloudinary.uploader.upload(imageFile.path,{
            resource_type:'image'
        })

        const imageUrl = imageUpload.secure_url;
        const doctorData = {
            name,
            email,
            password:hashedPassword,
            image:imageUrl,
            speciality,
            experience,
            degree,
            about,
            fees,
            address : JSON.parse(address),
            date : Date.now(),
            available: true,
            
        }

        const newDoctor = new doctorModel(doctorData);
        await newDoctor.save();
        res.json({success:true,message:"Doctor added successfully"});
    }

    catch(error){
        console.log(error);
        res.json({success:false,message: error.message || "Error in adding doctor"});
    }
}

//API for admin login

const allDoctors = async (req,res) => {
    try{
        const doctors = await doctorModel.find({}).select('-password');
        res.json({success:true,doctors});
    }
    
    catch(error) {
        console.log(error);
        res.json({success:false,message:"Error fetching doctors"});
    }
}

const loginAdmin = async (req,res) => {
    try{
        const{email,password} = req.body;
        
        // Trim whitespace from inputs
        const trimmedEmail = email?.trim();
        const trimmedPassword = password?.trim();

        if(!trimmedEmail||!trimmedPassword)
        {
            return res.json({success:false,message:"All fields are required"});
        }
        
        // Get environment variables and trim them too
        const adminEmail = process.env.ADMIN_EMAIL?.trim();
        const adminPassword = process.env.ADMIN_PASSWORD?.trim();
        
        if(!adminEmail || !adminPassword){
            console.error("ADMIN_EMAIL or ADMIN_PASSWORD not set in environment variables");
            return res.json({success:false,message:"Server configuration error"});
        }
        
        if(trimmedEmail === adminEmail && trimmedPassword === adminPassword)
        {   
            const token = jwt.sign({ admin: adminEmail + adminPassword }, process.env.JWT_SECRET);
            return res.json({success:true,message:"Admin logged in successfully", token});
        }
        else{
            return res.json({success:false,message:"Invalid credentials"});
        }
    }

    catch(error){
        console.log("Admin login error:", error);
        res.json({success:false,message:error.message });
    }
}

const appointmentsAdmin = async (req,res) => {
    try {
        const appointments = await appointmentModel.find({});
        res.json({success:true,appointments});
    }
    catch (error) {
        console.log(error);
        res.json({success:false,message:error.message});
    }
}

const appointmentCancel = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId);
        if (!appointmentData) {
            return res.json({ success: false, message: "Appointment not found" });
        }
        
        const docData = await doctorModel.findById(appointmentData.docId);
        if (!docData) {
            return res.json({ success: false, message: "Doctor not found" });
        }
        let slots_booked = docData.slots_booked || {};
        
        // Convert Date object back to "day_month_year" format for slots_booked
        const slotDateObj = appointmentData.slotDate instanceof Date 
            ? appointmentData.slotDate 
            : new Date(appointmentData.slotDate);
        const day = slotDateObj.getDate();
        const month = slotDateObj.getMonth() + 1;
        const year = slotDateObj.getFullYear();
        const slotDate = `${day}_${month}_${year}`;
        const slotTime = appointmentData.slotTime;
        
        if (slots_booked[slotDate]) {
            slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);
            if (slots_booked[slotDate].length === 0) {
                delete slots_booked[slotDate];
            }
        }
        
        await doctorModel.findByIdAndUpdate(appointmentData.docId, { slots_booked });
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });
        
        res.json({ success: true, message: "Appointment cancelled successfully" });
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error in cancelling appointment" });
    }
}

const adminDashboard = async (req, res) => {
    try{
        const doctors = await doctorModel.countDocuments({});
        const users = await userModel.countDocuments({});
        const appointments = await appointmentModel.countDocuments({});
        const latestAppointments = await appointmentModel.find({}).sort({_id: -1}).limit(5);
        
        const dashData= {
            doctors,
            users,
            appointments,
            latestAppointments,
        }
        res.json({success:true,dashData});
    }

    catch(error){
        console.log(error);
        res.json({success:false,message:"Error fetching dashboard data"});
    }   
}

export {addDoctor, allDoctors, loginAdmin, appointmentsAdmin,appointmentCancel,adminDashboard}; 
