import React from 'react'
import { Link } from 'react-router-dom'

export const Footer = () => {
  return (
    <footer className="relative mt-24 overflow-hidden"
            style={{ background: 'linear-gradient(180deg, #f4f9f8 0%, #e8f5f3 100%)' }}>

      {/* Top wave */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-300/40 to-transparent" />

      {/* Ambient glow */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[600px] h-[200px]
                      bg-teal-200/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr_1fr] gap-12 mb-12">

          {/* Brand */}
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-black text-grad-primary tracking-tight cursor-pointer w-fit"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                Mediversal
              </h2>
              <p className="text-slate-500 font-medium leading-relaxed mt-3 max-w-sm text-sm">
                Empowering your wellness journey through compassionate care and intelligent technology —
                because your health deserves the best.
              </p>
            </div>

            {/* Social proof pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-md
                            border border-teal-100 rounded-full shadow-sm w-fit">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <p className="text-xs font-bold text-slate-600">50,000+ patients served</p>
            </div>
          </div>

          {/* Company links */}
          <div>
            <p className="text-[10px] font-black text-slate-800 tracking-[0.15em] uppercase mb-5">Company</p>
            <ul className="flex flex-col gap-3">
              {[
                { to: '/',        label: 'Home'           },
                { to: '/about',   label: 'About Us'       },
                { to: '/contact', label: 'Contact'        },
                { to: '/doctors', label: 'Find Doctors'   },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    onClick={() => window.scrollTo(0, 0)}
                    className="text-sm text-slate-500 font-semibold hover:text-teal-700 transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li className="text-sm text-slate-500 font-semibold hover:text-teal-700 transition-colors duration-200 cursor-pointer">
                Privacy Policy
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[10px] font-black text-slate-800 tracking-[0.15em] uppercase mb-5">Get In Touch</p>
            <ul className="flex flex-col gap-3">
              {[
                { icon: '📞', text: '+1-213-232-2122'       },
                { icon: '✉️', text: 'contact@mediversal.com' },
                { icon: '📍', text: '123 Future Tech St, CA' },
              ].map(({ icon, text }) => (
                <li key={text}
                    className="flex items-center gap-2 text-sm text-slate-500 font-semibold hover:text-teal-700 transition-colors cursor-pointer">
                  <span>{icon}</span> {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-200/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400 font-semibold">© 2026 Mediversal. All rights reserved.</p>
          <p className="text-xs text-slate-400 font-semibold">
            Crafted with 💚 for better healthcare
          </p>
        </div>
      </div>
    </footer>
  )
}
