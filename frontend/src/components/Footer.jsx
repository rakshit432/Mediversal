import React from 'react'
import { Link } from 'react-router-dom'

export const Footer = () => {
  return (
    <footer className='border-t border-slate-200 mt-20 pt-12 pb-6 px-4 bg-slate-50/50 backdrop-blur-md'>
      <div className='max-w-7xl mx-auto'>
        <div className='grid grid-cols-1 md:grid-cols-[3fr_1fr_1fr] gap-12 mb-10 text-sm'>
          {/* Footer left part */}
          <div className="flex flex-col gap-4">
              <h1 
                className="text-2xl font-black bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent tracking-tight w-fit cursor-pointer"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Mediversal
              </h1>
              <p className='w-full md:w-2/3 leading-relaxed text-slate-600 font-medium'>
                Providing access to top-tier medical specialists through a seamless, state-of-the-art telehealth experience.
              </p>
          </div>

          {/* Footer centre part */}
          <div>
              <p className='text-xs font-bold text-slate-800 tracking-widest mb-4 uppercase'>Company</p>
              <ul className='flex flex-col gap-3 text-slate-600 font-semibold'>
                  <li>
                    <Link to="/" onClick={() => window.scrollTo(0,0)} className="hover:text-teal-600 transition-colors duration-200">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link to="/about" onClick={() => window.scrollTo(0,0)} className="hover:text-teal-600 transition-colors duration-200">
                      About us
                    </Link>
                  </li>
                  <li>
                    <Link to="/about" onClick={() => window.scrollTo(0,0)} className="hover:text-teal-600 transition-colors duration-200">
                      Contact us
                    </Link>
                  </li>
                  <li className="hover:text-teal-600 transition-colors duration-200 cursor-pointer">
                    Privacy policy
                  </li>
                  <li>
                    <Link to="/admin" onClick={() => window.scrollTo(0,0)} className="hover:text-teal-600 transition-colors duration-200">
                      Admin Portal
                    </Link>
                  </li>
              </ul>
          </div>

          {/* Footer right part */}
          <div>
              <p className='text-xs font-bold text-slate-800 tracking-widest mb-4 uppercase'>Get In Touch</p>
              <ul className='flex flex-col gap-3 text-slate-600 font-semibold'>
                  <li className="hover:text-teal-600 transition-colors duration-200 cursor-pointer">+1-213-232-2122</li>
                  <li className="hover:text-teal-600 transition-colors duration-200 cursor-pointer">contact@mediversal.com</li>
                  <li>123 Future Tech Street, CA, USA</li>
              </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className='text-xs text-slate-500 font-semibold'>© 2026 Mediversal. All rights reserved.</p>
            <p className='text-xs text-slate-500 font-semibold'>Designed with visual excellence in mind.</p>
        </div>
      </div>
    </footer>
  )
}
