import React, { useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Doctor from './pages/Doctor';
import Myappointment from './pages/Myappointment';
import Appointment from './pages/Appointment';
import Myprofile from './pages/Myprofile';
import NotFound from './pages/NotFound';

// Patient components
import Navbar from './components/Navbar';
import { Footer } from './components/Footer';
import TriageBot from './components/Triagebot';

// Admin / Doctor context
import { AdminContext } from './context/AdminContext';

// Admin / Doctor components
import AdminNavbar from './components/AdminNavbar';
import AdminSidebar from './components/AdminSidebar';

// Admin / Doctor pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/Admin/Dashboard';
import AddDoctor from './pages/Admin/AddDoctor';
import DoctorsList from './pages/Admin/DoctorsList';
import AllAppointment from './pages/Admin/AllAppointment';

import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorAppointments from './pages/Doctor/DoctorAppointments';
import DoctorProfile from './pages/Doctor/DoctorProfile';

import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const { atoken, dToken } = useContext(AdminContext);
  const location = useLocation();

  // Check if current path belongs to admin or doctor panel
  const isAdminRoute = location.pathname.startsWith('/admin-dashboard') || 
                       location.pathname.startsWith('/add-doctor') || 
                       location.pathname.startsWith('/doctor-list') || 
                       location.pathname.startsWith('/all-appointments');

  const isDoctorRoute = location.pathname.startsWith('/doctor-dashboard') || 
                        location.pathname.startsWith('/doctor-appointments') || 
                        location.pathname.startsWith('/doctor-profile');

  const isAdminLoginRoute = location.pathname === '/admin-login';

  const isPanelRoute = isAdminRoute || isDoctorRoute;

  // Protected Route Wrapper for Admin
  const AdminRoute = ({ children }) => {
    return atoken ? children : <Navigate to="/admin-login" replace />;
  };

  // Protected Route Wrapper for Doctor
  const DoctorRoute = ({ children }) => {
    return dToken ? children : <Navigate to="/admin-login" replace />;
  };

  return (
    <>
      <ToastContainer />
      
      {/* RENDER ADMIN / DOCTOR PANEL LAYOUT */}
      {isPanelRoute ? (
        <div className="bg-slate-50 min-h-screen flex flex-col">
          <AdminNavbar />
          <div className="flex flex-1 items-stretch">
            <AdminSidebar />
            <div className="flex-1 p-6 overflow-y-auto">
              <Routes>
                {/* Admin Routes */}
                <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/add-doctor" element={<AdminRoute><AddDoctor /></AdminRoute>} />
                <Route path="/doctor-list" element={<AdminRoute><DoctorsList /></AdminRoute>} />
                <Route path="/all-appointments" element={<AdminRoute><AllAppointment /></AdminRoute>} />

                {/* Doctor Routes */}
                <Route path="/doctor-dashboard" element={<DoctorRoute><DoctorDashboard /></DoctorRoute>} />
                <Route path="/doctor-appointments" element={<DoctorRoute><DoctorAppointments /></DoctorRoute>} />
                <Route path="/doctor-profile" element={<DoctorRoute><DoctorProfile /></DoctorRoute>} />
              </Routes>
            </div>
          </div>
        </div>
      ) : (
        /* RENDER PATIENT FRONTEND LAYOUT */
        <div className="flex flex-col min-h-screen">
          {!isAdminLoginRoute && <Navbar />}
          {!isAdminLoginRoute && <TriageBot />}
          
          <div className="flex-1">
            <Routes>
              {/* Patient routes */}
              <Route path="/" element={<Home />} />
              <Route path="/doctors" element={<Doctor />} />
              <Route path="/doctors/:speciality" element={<Doctor />} />
              <Route path="/my-appointments" element={<Myappointment />} />
              <Route path="/appointment/:docId" element={<Appointment />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/my-profile" element={<Myprofile />} />
              
              {/* Admin Login route */}
              <Route 
                path="/admin-login" 
                element={
                  atoken ? <Navigate to="/admin-dashboard" replace /> :
                  dToken ? <Navigate to="/doctor-dashboard" replace /> :
                  <AdminLogin />
                } 
              />
              
              {/* Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          
          {!isAdminLoginRoute && <Footer />}
        </div>
      )}
    </>
  );
}

export default App;
