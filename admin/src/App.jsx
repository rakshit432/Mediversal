import React, { useContext } from 'react';
import Login from './pages/Login.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AdminContext } from './context/AdminContext.jsx';
import DoctorContextProvider from './context/DoctorContext.jsx';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';

import { Routes, Route, Navigate } from 'react-router-dom';

import Dashboard from './pages/Admin/Dashboard.jsx';
import AddDoctor from './pages/Admin/AddDoctor.jsx';
import DoctorsList from './pages/Admin/DoctorsList.jsx';
import AllAppointment from './pages/Admin/AllAppointment.jsx';

import DoctorDashboard from './pages/Doctor/DoctorDashboard.jsx';
import DoctorAppointments from './pages/Doctor/DoctorAppointments.jsx';
import DoctorProfile from './pages/Doctor/DoctorProfile.jsx';

const App = () => {
  const { atoken, dToken } = useContext(AdminContext);

  // 🔐 If no one is logged in
  if (!atoken && !dToken) {
    return (
      <>
        <ToastContainer />
        <Login />
      </>
    );
  }

  return (
    <DoctorContextProvider>
      <div>
      <ToastContainer />

      <Navbar />

      <div className="flex items-start">
        <Sidebar />

        <Routes>
          {/* ================= ADMIN ROUTES ================= */}
          {atoken && (
            <>
              <Route path="/" element={<Navigate to="/admin-dashboard" />} />
              <Route path="/admin-dashboard" element={<Dashboard />} />
              <Route path="/add-doctor" element={<AddDoctor />} />
              <Route path="/doctor-list" element={<DoctorsList />} />
              <Route path="/all-appointments" element={<AllAppointment />} />
            </>
          )}

          {/* ================= DOCTOR ROUTES ================= */}
          {dToken && (
            <>
              <Route path="/" element={<Navigate to="/doctor-dashboard" />} />
              <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor-appointments" element={<DoctorAppointments />} />
              <Route path="/doctor-profile" element={<DoctorProfile />} />
            </>
          )}

          {/* ================= FALLBACK ================= */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      </div>
    </DoctorContextProvider>
  );
};

export default App;
