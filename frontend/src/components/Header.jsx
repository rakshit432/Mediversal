import React from 'react';
import grp from '../assets/group_profiles.png';
import arrow from '../assets/arrow_icon.svg';
import header from '../assets/header_img.png';

const Header = () => {
  return (
    <section className="px-4 sm:px-6 mt-6 mb-12">
      <div className="max-w-7xl mx-auto rounded-[2.5rem] overflow-hidden relative shadow-lg border border-slate-200/60 bg-gradient-to-br from-teal-50 via-sky-50 to-indigo-50">
        {/* Soft background glows */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-cyan-200/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-indigo-200/25 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-teal-200/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row items-center lg:items-end px-6 sm:px-10 lg:px-16 pt-12 pb-12 lg:pt-16 lg:pb-0">

          {/* LEFT CONTENT */}
          <div className="flex-1 flex flex-col gap-6 text-center lg:text-left max-w-xl z-10 lg:pb-16">
            <h1 className="text-3.5xl sm:text-4.5xl lg:text-5.5xl font-black leading-tight text-slate-800 tracking-tight">
              Book Appointment <br />
              <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                With Trusted Specialists
              </span>
            </h1>

            {/* Social proof */}
            <div className="flex flex-col items-center lg:items-start gap-4">
              <img
                src={grp}
                alt="trusted users"
                className="w-36 sm:w-44 hover:scale-105 transition duration-300 filter drop-shadow-[0_4px_6px_rgba(15,118,110,0.08)]"
              />
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold max-w-md">
                Simply browse through our extensive list of trusted doctors and
                schedule your appointment hassle-free in just a few clicks.
              </p>
            </div>

            {/* CTA */}
            <a
              href="#speciality"
              className="inline-flex items-center gap-2.5 bg-teal-600 text-white font-bold text-xs tracking-wider
                         px-8 py-4 rounded-full shadow-md shadow-teal-700/10 border border-teal-500/20
                         hover:scale-105 active:scale-95 hover:bg-teal-750 transition-all duration-200 w-fit mx-auto lg:mx-0 cursor-pointer"
            >
              BOOK APPOINTMENT
              <img src={arrow} alt="arrow" className="w-3.5 h-3.5 brightness-0 invert" />
            </a>
          </div>

          {/* RIGHT IMAGE */}
          <div className="flex-1 relative mt-10 lg:mt-0 flex justify-center lg:justify-end z-10 lg:self-end">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-100/0 to-cyan-100/10 rounded-full blur-2xl pointer-events-none" />
            <img
              src={header}
              alt="doctors"
              className="w-full max-w-sm sm:max-w-md lg:max-w-lg object-contain px-4 hover:scale-[1.02] transition-transform duration-500 filter drop-shadow-[0_10px_20px_rgba(15,118,110,0.08)] block"
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default Header;
