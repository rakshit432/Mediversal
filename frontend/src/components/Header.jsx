import React from 'react';
import grp from '../assets/group_profiles.png';
import arrow from '../assets/arrow_icon.svg';
import header from '../assets/header_img.png';

const STATS = [
  { value: '100+', label: 'Verified Doctors' },
  { value: '50k+', label: 'Happy Patients'   },
  { value: '4.9★', label: 'Average Rating'   },
];

const Header = () => {
  return (
    <section className="px-4 sm:px-6 mt-6 mb-16 page-enter">
      <div className="max-w-7xl mx-auto rounded-[2.5rem] overflow-hidden relative
                      border border-white/60 shadow-[0_8px_48px_rgba(13,148,136,0.12)]"
           style={{ background: 'linear-gradient(140deg, #f0fdf9 0%, #ecfeff 45%, #f0f9ff 100%)' }}>

        {/* Ambient glow blobs */}
        <div className="hero-blob w-[500px] h-[500px] bg-teal-300/15 -top-32 -left-32"   style={{ animationDelay: '0s'   }} />
        <div className="hero-blob w-[400px] h-[400px] bg-cyan-300/12 -bottom-20 -right-20" style={{ animationDelay: '3s'   }} />
        <div className="hero-blob w-[300px] h-[300px] bg-emerald-200/10 top-1/2 left-1/3"  style={{ animationDelay: '1.5s' }} />

        <div className="relative flex flex-col lg:flex-row items-center lg:items-end
                        px-8 sm:px-12 lg:px-16 pt-14 pb-12 lg:pt-20 lg:pb-0 gap-8">

          {/* ── LEFT CONTENT ── */}
          <div className="flex-1 flex flex-col gap-7 text-center lg:text-left max-w-xl z-10 lg:pb-16">

            {/* Eyebrow pill */}
            <div className="section-label mx-auto lg:mx-0">
              ✦ Trusted Healthcare Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black leading-[1.1] text-slate-800 tracking-tight">
              Your Health,<br/>
              <span className="text-grad-primary">Our Priority</span>
            </h1>

            <p className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed max-w-md mx-auto lg:mx-0">
              Connect with trusted, board-certified specialists in minutes — not weeks.
              Compassionate care, powered by intelligent technology.
            </p>

            {/* Social proof */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4">
              <img
                src={grp}
                alt="trusted users"
                className="w-36 sm:w-40 hover:scale-105 transition duration-300 filter drop-shadow-md"
              />
              <p className="text-xs text-slate-500 font-semibold leading-relaxed max-w-xs text-center sm:text-left">
                Join <span className="text-teal-600 font-black">50,000+</span> patients who have
                already simplified their healthcare journey with Mediversal.
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <a
                href="#speciality"
                className="btn-primary text-[11px]"
              >
                BOOK APPOINTMENT
                <img src={arrow} alt="arrow" className="w-3.5 h-3.5 brightness-0 invert" />
              </a>
              <a
                href="/about"
                className="btn-outline text-[11px]"
              >
                LEARN MORE
              </a>
            </div>

            {/* Stats row */}
            <div className="flex gap-6 justify-center lg:justify-start pt-2">
              {STATS.map(({ value, label }) => (
                <div key={label} className="text-center lg:text-left">
                  <p className="text-2xl font-black text-grad-primary">{value}</p>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT IMAGE ── */}
          <div className="flex-1 relative flex justify-center lg:justify-end z-10 lg:self-end">
            {/* Circular glow behind doctor */}
            <div className="absolute bottom-0 right-0 lg:right-4 w-[340px] h-[340px] rounded-full
                            bg-gradient-to-tr from-teal-200/30 to-cyan-200/20 blur-3xl pointer-events-none" />
            <img
              src={header}
              alt="doctors at Mediversal"
              className="w-full max-w-[320px] sm:max-w-[400px] lg:max-w-[440px] object-contain
                         hover:scale-[1.02] transition-transform duration-700
                         filter drop-shadow-[0_16px_40px_rgba(13,148,136,0.12)] block"
            />
          </div>
        </div>

        {/* Bottom wave decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-1 grad-primary opacity-30 rounded-b-[2.5rem]" />
      </div>
    </section>
  );
};

export default Header;
