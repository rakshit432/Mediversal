import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AdminContext } from "../context/AdminContext.jsx";
import { assets } from "../assets/adminAssets";

const AdminNavbar = () => {
  const { atoken, setAtoken } = useContext(AdminContext);
  const { dToken, setDtoken } = useContext(AdminContext);

  const navigate = useNavigate();

  const logout = () => {
   navigate('/admin-login');
   setAtoken(null);
   localStorage.removeItem('aToken');
   setDtoken(null);
   localStorage.removeItem('dToken');
  };

  return (
    <div className="flex justify-between items-center p-4 border-b border-gray-300 bg-white">
      <div className="flex items-center gap-2 text-xs">
        <h1 className="text-xl font-bold text-teal-700">Mediversal</h1>
        <p className="border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600 font-semibold">
          {atoken ? "Admin" : "Doctor"}
        </p>
      </div>
      <button
        className="bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-semibold px-6 py-2.5 rounded-full shadow-md hover:scale-105 transition-all duration-200 cursor-pointer"
        onClick={logout}
      >
        LOGOUT
      </button>
    </div>
  );
};

export default AdminNavbar;
