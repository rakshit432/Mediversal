import { NavLink, useNavigate } from 'react-router-dom';
import profile_pic from '../assets/profile_pic.png';
import drop_down from '../assets/dropdown_icon.svg';
import React, { useState } from 'react';
import { AppContext } from '../context/AppContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { token, setToken } = React.useContext(AppContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = () => {
    setToken(false);
    localStorage.removeItem('token');
    navigate('/login');
    setMenuOpen(false);
  };

  const navLinkStyle = ({ isActive }) =>
    `text-xs font-bold tracking-wider transition-all duration-200 relative py-1 hover:text-teal-600 ${
      isActive
        ? 'text-teal-600 after:w-full'
        : 'text-slate-650 after:w-0'
    } after:content-[""] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:bg-teal-600 after:transition-all after:duration-300 hover:after:w-full`;

  const mobileNavLinkStyle = ({ isActive }) =>
    `block px-4 py-3 text-sm font-bold tracking-wider rounded-xl transition-all duration-200 ${
      isActive ? 'text-teal-600 bg-teal-50' : 'text-slate-700 hover:bg-slate-50 hover:text-teal-600'
    }`;

  return (
    <header className="border-b border-slate-200/50 bg-white/70 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-4">

          {/* LOGO */}
          <h1
            className="text-2xl font-black bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent cursor-pointer tracking-tight"
            onClick={() => { navigate('/'); setMenuOpen(false); }}
          >
            Mediversal
          </h1>

          {/* DESKTOP NAV LINKS */}
          <ul className="hidden md:flex items-center gap-8">
            <NavLink to="/" className={navLinkStyle}>HOME</NavLink>
            <NavLink to="/doctors" className={navLinkStyle}>ALL DOCTORS</NavLink>
            <NavLink to="/about" className={navLinkStyle}>ABOUT</NavLink>
            <NavLink to="/contact" className={navLinkStyle}>CONTACT</NavLink>
          </ul>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3">
            {token ? (
              <div className="relative group cursor-pointer hidden md:block">
                <div className="flex items-center gap-2">
                  <img src={profile_pic} alt="user" className="w-9 h-9 rounded-full border border-slate-200" />
                  <img src={drop_down} alt="dropdown" className="w-3 opacity-60" />
                </div>
                {/* DROPDOWN */}
                <div className="absolute right-0 mt-3 w-44 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-xl shadow-2xl
                                opacity-0 invisible group-hover:opacity-100 group-hover:visible
                                transition-all duration-200 z-50">
                  <div className="flex flex-col py-2 text-xs text-slate-700 font-semibold">
                    <button onClick={() => navigate('/my-profile')} className="px-4 py-2.5 text-left hover:bg-slate-50 hover:text-teal-600 transition">My Profile</button>
                    <button onClick={() => navigate('/my-appointments')} className="px-4 py-2.5 text-left hover:bg-slate-50 hover:text-teal-600 transition">My Appointments</button>
                    <button onClick={logout} className="px-4 py-2.5 text-left hover:bg-red-50 hover:text-red-600 transition border-t border-slate-100 mt-1">Logout</button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="hidden md:block bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold tracking-wider rounded-full px-6 py-2.5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                CREATE ACCOUNT
              </button>
            )}

            {/* HAMBURGER */}
            <button
              className="md:hidden flex flex-col gap-1.5 p-2 rounded-xl hover:bg-slate-50 transition"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span className={`block h-0.5 w-5 bg-slate-700 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 w-5 bg-slate-700 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-5 bg-slate-700 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-96 pb-4' : 'max-h-0'}`}>
          <nav className="flex flex-col gap-1 border-t border-slate-100 pt-3">
            <NavLink to="/" className={mobileNavLinkStyle} onClick={() => setMenuOpen(false)}>Home</NavLink>
            <NavLink to="/doctors" className={mobileNavLinkStyle} onClick={() => setMenuOpen(false)}>All Doctors</NavLink>
            <NavLink to="/about" className={mobileNavLinkStyle} onClick={() => setMenuOpen(false)}>About</NavLink>
            <NavLink to="/contact" className={mobileNavLinkStyle} onClick={() => setMenuOpen(false)}>Contact</NavLink>

            <div className="border-t border-slate-100 mt-2 pt-2">
              {token ? (
                <>
                  <button onClick={() => { navigate('/my-profile'); setMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-teal-600 rounded-xl transition">My Profile</button>
                  <button onClick={() => { navigate('/my-appointments'); setMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-teal-600 rounded-xl transition">My Appointments</button>
                  <button onClick={logout} className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition">Logout</button>
                </>
              ) : (
                <button
                  onClick={() => { navigate('/login'); setMenuOpen(false); }}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold tracking-wider rounded-full px-6 py-3 shadow-sm transition-all duration-200 cursor-pointer mt-1"
                >
                  CREATE ACCOUNT
                </button>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
