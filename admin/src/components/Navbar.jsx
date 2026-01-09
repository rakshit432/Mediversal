import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AdminContext } from "../context/AdminContext.jsx";
import { assets } from "../assets/assets";

const Navbar = () => {
  const { atoken, setAtoken } = useContext(AdminContext);
  const { dToken, setDtoken } = useContext(AdminContext);

  const navigate = useNavigate();

  const logout = () => {
   navigate('/');
   setAtoken(null);
   localStorage.removeItem('aToken');
   setDtoken(null);
   localStorage.removeItem('dToken');
  };

  return (
    <div className="flex justify-between items-center p-4 border-b border-gray-300">
      <div className="flex items-center gap-2 text-xs">
        <h1 className="text-xl font-bold text-teal-700">Mediversal</h1>
        <p className="border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600">
          {atoken ? "Admin" : "Doctor"}
        </p>
      </div>
      <button
        className="bg-primary text-white text-sm px-10 py-2 rounded-full"
        onClick={logout}
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
