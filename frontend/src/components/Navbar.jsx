import { NavLink, useNavigate } from 'react-router-dom';
import profile_pic from '../assets/profile_pic.png';
import drop_down from '../assets/dropdown_icon.svg';
import React from 'react';
import { AppContext } from '../context/AppContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { token, setToken } = React.useContext(AppContext);

  const logout = () => {
    setToken(false);
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navLinkStyle = ({ isActive }) =>
    `text-sm font-medium transition ${
      isActive
        ? 'text-teal-700 border-b-2 border-teal-700'
        : 'text-gray-600 hover:text-teal-700'
    }`;

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-4">

          {/* LOGO */}
          <h1
            className="text-2xl font-bold text-teal-700 cursor-pointer"
            onClick={() => navigate('/')}
          >
            Mediversal
          </h1>

          {/* NAV LINKS */}
          <ul className="hidden md:flex items-center gap-8">
            <NavLink to="/" className={navLinkStyle}>
              HOME
            </NavLink>

            <NavLink to="/doctors" className={navLinkStyle}>
              ALL DOCTORS
            </NavLink>

            <NavLink to="/about" className={navLinkStyle}>
              ABOUT
            </NavLink>

            <NavLink to="/contact" className={navLinkStyle}>
              CONTACT
            </NavLink>
          </ul>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4">
            {token ? (
              <div className="relative group cursor-pointer">
                <div className="flex items-center gap-2">
                  <img
                    src={profile_pic}
                    alt="user"
                    className="w-9 h-9 rounded-full border"
                  />
                  <img src={drop_down} alt="dropdown" className="w-3" />
                </div>

                {/* DROPDOWN */}
                <div className="absolute right-0 mt-3 w-44 bg-white border rounded-lg shadow-lg 
                                opacity-0 invisible group-hover:opacity-100 group-hover:visible
                                transition-all duration-200">
                  <div className="flex flex-col py-2 text-sm text-gray-600">
                    <button
                      onClick={() => navigate('/my-profile')}
                      className="px-4 py-2 text-left hover:bg-teal-50 hover:text-teal-700"
                    >
                      My Profile
                    </button>

                    <button
                      onClick={() => navigate('/my-appointments')}
                      className="px-4 py-2 text-left hover:bg-teal-50 hover:text-teal-700"
                    >
                      My Appointments
                    </button>

                    <button
                      onClick={logout}
                      className="px-4 py-2 text-left hover:bg-red-50 hover:text-red-600"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium 
                           rounded-full px-5 py-2 shadow transition"
              >
                Create Account
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
