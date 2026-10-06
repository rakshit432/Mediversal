import { NavLink, useNavigate } from 'react-router-dom';
import profile_pic from '../assets/profile_pic.png';
import drop_down from '../assets/dropdown_icon.svg';
import React, { useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { token, setToken } = React.useContext(AppContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const logout = () => {
    setToken(false);
    localStorage.removeItem('token');
    navigate('/login');
    setMenuOpen(false);
  };

  const navLinkStyle = ({ isActive }) =>
    `text-[11px] font-bold tracking-widest transition-all duration-200 relative py-1 uppercase
     ${isActive ? 'text-teal-600' : 'text-slate-500 hover:text-teal-600'}
     after:content-[""] after:absolute after:left-0 after:bottom-0 after:h-[2px]
     after:rounded-full after:bg-gradient-to-r after:from-teal-500 after:to-cyan-500
     after:transition-all after:duration-300
     ${isActive ? 'after:w-full' : 'after:w-0 hover:after:w-full'}`;

  const mobileNavLinkStyle = ({ isActive }) =>
    `block px-4 py-3 text-sm font-bold tracking-wider rounded-xl transition-all duration-200
     ${isActive ? 'text-teal-700 bg-teal-50/80 border border-teal-100' : 'text-slate-600 hover:bg-teal-50/60 hover:text-teal-700'}`;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_2px_20px_rgba(13,148,136,0.07)]'
          : 'bg-white/60 backdrop-blur-md border-b border-white/40'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-3.5">

          {/* LOGO */}
          <button
            className="flex items-center gap-2 group"
            onClick={() => { navigate('/'); setMenuOpen(false); }}
          >
            <div className="w-8 h-8 rounded-xl grad-primary flex items-center justify-center shadow-md group-hover:scale-105 transition">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="white"/>
              </svg>
            </div>
            <span className="text-xl font-black text-grad-primary tracking-tight">
              Mediversal
            </span>
          </button>

          {/* DESKTOP NAV */}
          <ul className="hidden md:flex items-center gap-8">
            <NavLink to="/"        className={navLinkStyle}>Home</NavLink>
            <NavLink to="/doctors" className={navLinkStyle}>Doctors</NavLink>
            <NavLink to="/about"   className={navLinkStyle}>About</NavLink>
            <NavLink to="/contact" className={navLinkStyle}>Contact</NavLink>
          </ul>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3">
            {token ? (
              <div className="relative group cursor-pointer hidden md:block">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200/80 bg-white/70 hover:border-teal-200 hover:bg-teal-50/50 transition">
                  <img src={profile_pic} alt="user" className="w-7 h-7 rounded-full border-2 border-teal-200 object-cover" />
                  <img src={drop_down} alt="dropdown" className="w-2.5 opacity-50 transition group-hover:rotate-180 duration-300" />
                </div>
                {/* DROPDOWN */}
                <div className="absolute right-0 mt-2 w-48 glass-panel rounded-2xl shadow-2xl opacity-0 invisible
                                group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
                                translate-y-2 transition-all duration-200 z-50 overflow-hidden">
                  <div className="flex flex-col py-2">
                    {[
                      { label: 'My Profile',      path: '/my-profile',      icon: '👤' },
                      { label: 'My Reports',      path: '/my-reports',      icon: '📋' },
                      { label: 'My Appointments', path: '/my-appointments', icon: '📅' },
                    ].map(({ label, path, icon }) => (
                      <button
                        key={path}
                        onClick={() => navigate(path)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition w-full text-left"
                      >
                        <span>{icon}</span>
                        {label}
                      </button>
                    ))}
                    <div className="border-t border-slate-100 mx-3 my-1" />
                    <button
                      onClick={logout}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-500 hover:bg-rose-50 transition w-full text-left"
                    >
                      <span>🚪</span> Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="hidden md:flex btn-primary text-[11px] py-2.5 px-5"
              >
                Get Started
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            )}

            {/* HAMBURGER */}
            <button
              className="md:hidden flex flex-col gap-1.5 p-2 rounded-xl hover:bg-slate-100/70 transition"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span className={`block h-0.5 w-5 bg-slate-600 rounded-full transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 w-5 bg-slate-600 rounded-full transition-all duration-300 ${menuOpen ? 'opacity-0 -translate-x-2' : ''}`} />
              <span className={`block h-0.5 w-5 bg-slate-600 rounded-full transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        <div className={`md:hidden overflow-hidden transition-all duration-400 ${menuOpen ? 'max-h-[28rem] opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
          <nav className="flex flex-col gap-1 border-t border-slate-100 pt-3">
            <NavLink to="/"        className={mobileNavLinkStyle} onClick={() => setMenuOpen(false)}>Home</NavLink>
            <NavLink to="/doctors" className={mobileNavLinkStyle} onClick={() => setMenuOpen(false)}>Doctors</NavLink>
            <NavLink to="/about"   className={mobileNavLinkStyle} onClick={() => setMenuOpen(false)}>About</NavLink>
            <NavLink to="/contact" className={mobileNavLinkStyle} onClick={() => setMenuOpen(false)}>Contact</NavLink>

            <div className="border-t border-slate-100 mt-2 pt-2">
              {token ? (
                <>
                  <button onClick={() => { navigate('/my-profile');      setMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-teal-50 hover:text-teal-700 rounded-xl transition">👤 My Profile</button>
                  <button onClick={() => { navigate('/my-reports');      setMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-teal-50 hover:text-teal-700 rounded-xl transition">📋 My Reports</button>
                  <button onClick={() => { navigate('/my-appointments'); setMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-teal-50 hover:text-teal-700 rounded-xl transition">📅 My Appointments</button>
                  <button onClick={logout} className="w-full text-left px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition">🚪 Logout</button>
                </>
              ) : (
                <button
                  onClick={() => { navigate('/login'); setMenuOpen(false); }}
                  className="w-full btn-primary justify-center text-xs py-3 mt-1"
                >
                  Get Started →
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
