import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminContext } from "../context/AdminContext.jsx";
import { assets } from "../assets/adminAssets";

const AdminNavbar = ({ onMenuToggle }) => {
  const { atoken, setAtoken, dToken, setDtoken } = useContext(AdminContext);
  const navigate = useNavigate();

  const logout = () => {
    navigate('/admin-login');
    setAtoken(null);
    localStorage.removeItem('aToken');
    setDtoken(null);
    localStorage.removeItem('dToken');
  };

  return (
    <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b border-slate-200 bg-white/70 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-3">
        {/* Hamburger for mobile */}
        <button
          onClick={onMenuToggle}
          className="md:hidden flex flex-col gap-1.5 p-2 rounded-xl hover:bg-slate-100 transition"
          aria-label="Toggle sidebar"
        >
          <span className="block h-0.5 w-5 bg-slate-700" />
          <span className="block h-0.5 w-5 bg-slate-700" />
          <span className="block h-0.5 w-5 bg-slate-700" />
        </button>

        <div className="flex items-center gap-2">
          <h1 className="text-xl font-black bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
            Mediversal
          </h1>
          <p className="bg-teal-50 text-teal-800 border border-teal-100/50 px-2.5 py-0.5 rounded-full font-bold text-xs">
            {atoken ? "Admin" : "Doctor"}
          </p>
        </div>
      </div>

      <button
        className="bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold tracking-wider px-4 sm:px-6 py-2.5 rounded-full shadow-sm hover:scale-105 transition-all duration-200 cursor-pointer border border-teal-500/20"
        onClick={logout}
      >
        LOGOUT
      </button>
    </div>
  );
};

export default AdminNavbar;
