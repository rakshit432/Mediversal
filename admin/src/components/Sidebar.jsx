import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AdminContext } from '../context/AdminContext.jsx';
import { assets } from '../assets/assets';

const Sidebar = () => {

  // ✅ READ BOTH TOKENS FROM SAME CONTEXT
  const { atoken, dToken } = useContext(AdminContext);

  return (
    <div className="min-h-screen bg-white border-r">

      {/* ================= ADMIN SIDEBAR ================= */}
      {!!atoken && (
        <ul className="text-[#515151] mt-5">

          <NavLink
            to="/admin-dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-teal-50 border-r-4 border-primary' : ''
              }`
            }
          >
            <img src={assets.home_icon} alt="" />
            <p>Dashboard</p>
          </NavLink>

          <NavLink
            to="/all-appointments"
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-teal-50 border-r-4 border-primary' : ''
              }`
            }
          >
            <img src={assets.appointment_icon} alt="" />
            <p>Appointments</p>
          </NavLink>

          <NavLink
            to="/add-doctor"
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''
              }`
            }
          >
            <img src={assets.add_icon} alt="" />
            <p>Add Doctor</p>
          </NavLink>

          <NavLink
            to="/doctor-list"
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-teal-50 border-r-4 border-primary' : ''
              }`
            }
          >
            <img src={assets.people_icon} alt="" />
            <p>Doctors List</p>
          </NavLink>

        </ul>
      )}

      {/* ================= DOCTOR SIDEBAR ================= */}
      {!!dToken && (
        <ul className="text-[#515151] mt-5">

          <NavLink
            to="/doctor-dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''
              }`
            }
          >
            <img src={assets.home_icon} alt="" />
            <p className="hidden md:block">Dashboard</p>
          </NavLink>

          <NavLink
            to="/doctor-appointments"
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''
              }`
            }
          >
            <img src={assets.appointment_icon} alt="" />
            <p className="hidden md:block">Appointments</p>
          </NavLink>

          <NavLink
            to="/doctor-profile"
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-teal-50 border-r-4 border-primary' : ''
              }`
            }
          >
            <img src={assets.profile_icon} alt="" />
            <p className="hidden md:block">Profile</p>
          </NavLink>



        </ul>
      )}

    </div>
  );
};

export default Sidebar;
