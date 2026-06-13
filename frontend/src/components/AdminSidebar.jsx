import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AdminContext } from '../context/AdminContext.jsx';
import { assets } from '../assets/adminAssets';

const AdminSidebar = () => {
  const { atoken, dToken } = useContext(AdminContext);

  return (
    <div className="min-h-screen bg-white border-r w-64 flex-shrink-0">
      {/* ================= ADMIN SIDEBAR ================= */}
      {!!atoken && (
        <ul className="text-gray-700 mt-5 space-y-1">
          <NavLink
            to="/admin-dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-6 cursor-pointer border-r-4 transition-all duration-300 hover:translate-x-1 hover:text-teal-700 ${
                isActive 
                  ? 'bg-teal-50/70 border-teal-600 text-teal-700 font-semibold shadow-sm shadow-teal-600/5' 
                  : 'border-transparent text-gray-600 hover:bg-teal-50/20'
              }`
            }
          >
            <img src={assets.home_icon} alt="" className="w-5 h-5" />
            <p>Dashboard</p>
          </NavLink>

          <NavLink
            to="/all-appointments"
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-6 cursor-pointer border-r-4 transition-all duration-300 hover:translate-x-1 hover:text-teal-700 ${
                isActive 
                  ? 'bg-teal-50/70 border-teal-600 text-teal-700 font-semibold shadow-sm shadow-teal-600/5' 
                  : 'border-transparent text-gray-600 hover:bg-teal-50/20'
              }`
            }
          >
            <img src={assets.appointment_icon} alt="" className="w-5 h-5" />
            <p>Appointments</p>
          </NavLink>

          <NavLink
            to="/add-doctor"
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-6 cursor-pointer border-r-4 transition-all duration-300 hover:translate-x-1 hover:text-teal-700 ${
                isActive 
                  ? 'bg-teal-50/70 border-teal-600 text-teal-700 font-semibold shadow-sm shadow-teal-600/5' 
                  : 'border-transparent text-gray-600 hover:bg-teal-50/20'
              }`
            }
          >
            <img src={assets.add_icon} alt="" className="w-5 h-5" />
            <p>Add Doctor</p>
          </NavLink>

          <NavLink
            to="/doctor-list"
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-6 cursor-pointer border-r-4 transition-all duration-300 hover:translate-x-1 hover:text-teal-700 ${
                isActive 
                  ? 'bg-teal-50/70 border-teal-600 text-teal-700 font-semibold shadow-sm shadow-teal-600/5' 
                  : 'border-transparent text-gray-600 hover:bg-teal-50/20'
              }`
            }
          >
            <img src={assets.people_icon} alt="" className="w-5 h-5" />
            <p>Doctors List</p>
          </NavLink>
        </ul>
      )}

      {/* ================= DOCTOR SIDEBAR ================= */}
      {!!dToken && (
        <ul className="text-gray-700 mt-5 space-y-1">
          <NavLink
            to="/doctor-dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-6 cursor-pointer border-r-4 transition-all duration-300 hover:translate-x-1 hover:text-teal-700 ${
                isActive 
                  ? 'bg-teal-50/70 border-teal-600 text-teal-700 font-semibold shadow-sm shadow-teal-600/5' 
                  : 'border-transparent text-gray-600 hover:bg-teal-50/20'
              }`
            }
          >
            <img src={assets.home_icon} alt="" className="w-5 h-5" />
            <p>Dashboard</p>
          </NavLink>

          <NavLink
            to="/doctor-appointments"
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-6 cursor-pointer border-r-4 transition-all duration-300 hover:translate-x-1 hover:text-teal-700 ${
                isActive 
                  ? 'bg-teal-50/70 border-teal-600 text-teal-700 font-semibold shadow-sm shadow-teal-600/5' 
                  : 'border-transparent text-gray-600 hover:bg-teal-50/20'
              }`
            }
          >
            <img src={assets.appointment_icon} alt="" className="w-5 h-5" />
            <p>Appointments</p>
          </NavLink>

          <NavLink
            to="/doctor-profile"
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-6 cursor-pointer border-r-4 transition-all duration-300 hover:translate-x-1 hover:text-teal-700 ${
                isActive 
                  ? 'bg-teal-50/70 border-teal-600 text-teal-700 font-semibold shadow-sm shadow-teal-600/5' 
                  : 'border-transparent text-gray-600 hover:bg-teal-50/20'
              }`
            }
          >
            <img src={assets.people_icon} alt="" className="w-5 h-5" />
            <p>Profile</p>
          </NavLink>
        </ul>
      )}
    </div>
  );
};

export default AdminSidebar;
