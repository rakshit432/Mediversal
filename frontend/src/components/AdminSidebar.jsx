import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AdminContext } from '../context/AdminContext.jsx';
import { assets } from '../assets/adminAssets';

const AdminSidebar = ({ isOpen, onClose }) => {
  const { atoken, dToken } = useContext(AdminContext);

  const activeLinkStyle = ({ isActive }) =>
    `flex items-center gap-3 py-3.5 px-4 sm:px-6 cursor-pointer border-l-4 transition-all duration-300 hover:translate-x-1 hover:text-teal-700 ${
      isActive
        ? 'bg-teal-50 border-teal-600 text-teal-700 font-bold shadow-sm'
        : 'border-transparent text-slate-600 hover:bg-slate-50/60'
    }`;

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static top-0 left-0 h-full z-40
        bg-white/90 backdrop-blur-md border-r border-slate-200
        flex-shrink-0 flex flex-col
        transition-transform duration-300
        w-60
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Mobile close button */}
        <div className="md:hidden flex items-center justify-between px-4 py-4 border-b border-slate-100">
          <span className="text-sm font-black text-slate-700">Menu</span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition text-lg">✕</button>
        </div>

        {/* ================= ADMIN SIDEBAR ================= */}
        {!!atoken && (
          <ul className="text-slate-700 mt-4 space-y-1 flex-1">
            <NavLink to="/admin-dashboard" className={activeLinkStyle} onClick={handleNavClick}>
              <img src={assets.home_icon} alt="" className="w-5 h-5 shrink-0" />
              <p className="text-sm font-semibold">Dashboard</p>
            </NavLink>

            <NavLink to="/all-appointments" className={activeLinkStyle} onClick={handleNavClick}>
              <img src={assets.appointment_icon} alt="" className="w-5 h-5 shrink-0" />
              <p className="text-sm font-semibold">Appointments</p>
            </NavLink>

            <NavLink to="/add-doctor" className={activeLinkStyle} onClick={handleNavClick}>
              <img src={assets.add_icon} alt="" className="w-5 h-5 shrink-0" />
              <p className="text-sm font-semibold">Add Doctor</p>
            </NavLink>

            <NavLink to="/doctor-list" className={activeLinkStyle} onClick={handleNavClick}>
              <img src={assets.people_icon} alt="" className="w-5 h-5 shrink-0" />
              <p className="text-sm font-semibold">Doctors List</p>
            </NavLink>
          </ul>
        )}

        {/* ================= DOCTOR SIDEBAR ================= */}
        {!!dToken && (
          <ul className="text-slate-700 mt-4 space-y-1 flex-1">
            <NavLink to="/doctor-dashboard" className={activeLinkStyle} onClick={handleNavClick}>
              <img src={assets.home_icon} alt="" className="w-5 h-5 shrink-0" />
              <p className="text-sm font-semibold">Dashboard</p>
            </NavLink>

            <NavLink to="/doctor-appointments" className={activeLinkStyle} onClick={handleNavClick}>
              <img src={assets.appointment_icon} alt="" className="w-5 h-5 shrink-0" />
              <p className="text-sm font-semibold">Appointments</p>
            </NavLink>

            <NavLink to="/doctor-profile" className={activeLinkStyle} onClick={handleNavClick}>
              <img src={assets.people_icon} alt="" className="w-5 h-5 shrink-0" />
              <p className="text-sm font-semibold">Profile</p>
            </NavLink>
          </ul>
        )}
      </div>
    </>
  );
};

export default AdminSidebar;
