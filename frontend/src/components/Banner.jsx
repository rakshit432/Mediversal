import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const FEATURES = [
  { icon: '🤖', title: 'AI-Powered Matching', desc: 'Our algorithm recommends the perfect specialist for your unique health profile.' },
  { icon: '🔒', title: 'Secure & Private',    desc: 'Your medical data is encrypted and HIPAA-compliant at every step.' },
  { icon: '⚡', title: 'Instant Booking',     desc: 'Book confirmed appointments in under 60 seconds — no phone calls needed.' },
];

const Banner = () => {
  const navigate = useNavigate();

  return (
    <section className="px-4 sm:px-6 my-20">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* ── Feature Strip ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} className="wellness-card p-6 flex items-start gap-4 group">
              <div className="feature-icon group-hover:rotate-6 transition-transform">
                {icon}
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-sm mb-1">{title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed font-medium">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main CTA Banner ── */}
        <div
          className="relative rounded-[2rem] overflow-hidden flex flex-col md:flex-row items-center
                     min-h-[220px] border border-teal-500/20 shadow-[0_12px_48px_rgba(13,148,136,0.18)]"
          style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 60%, #0e7490 100%)' }}
        >
          {/* Blob accents */}
          <div className="hero-blob w-72 h-72 bg-white/10 -top-20 -left-20" style={{ animationDelay: '0.5s' }} />
          <div className="hero-blob w-56 h-56 bg-cyan-300/15 bottom-0 right-20" style={{ animationDelay: '2s' }} />

          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.06]"
               style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

          {/* Left Content */}
          <div className="relative z-10 flex-1 py-12 sm:py-16 px-8 sm:px-12 lg:px-16 flex flex-col gap-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm
                            border border-white/20 rounded-full text-white/90 text-[10px] font-bold tracking-wider uppercase w-fit">
              ✦ Join 50,000+ patients
            </div>
            <div>
              <p className="text-white/70 font-semibold text-sm mb-1">Start your health journey today</p>
              <p className="text-white font-black text-3xl sm:text-4xl tracking-tight leading-tight">
                Book With 100+<br/>
                Trusted Doctors
              </p>
            </div>
            <button
              onClick={() => { navigate('/login'); window.scrollTo(0, 0); }}
              className="flex items-center gap-2 bg-white text-teal-700 font-bold text-xs tracking-wider
                         px-7 py-3.5 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)]
                         hover:shadow-[0_8px_32px_rgba(0,0,0,0.18)] hover:scale-105 active:scale-95
                         transition-all duration-200 w-fit cursor-pointer"
            >
              CREATE FREE ACCOUNT
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          {/* Right Image */}
          <div
            className="hidden md:block md:w-[40%] lg:w-[360px] relative self-end z-10"
            style={{
              maskImage: 'linear-gradient(to right, transparent, black 20%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 20%)',
            }}
          >
            <img
              className="h-[92%] w-auto absolute bottom-0 right-0 hover:scale-[1.02] transition duration-500
                         filter drop-shadow-[0_16px_40px_rgba(0,0,0,0.20)]"
              src={assets.appointment_img}
              alt="Book appointment"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Banner
