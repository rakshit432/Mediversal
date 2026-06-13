import React from 'react'
import { Link } from 'react-router-dom'

export const Footer = () => {
  return (
    <div className='md:mx-10 border-t border-slate-100 mt-20 pt-10'>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 text-sm'>
        {/* Footer left part */}
        <div>
            <h1 className="text-2xl font-bold text-teal-700 mb-5">Mediversal</h1>
            <p className='w-full md:w-2/3 leading-6 text-slate-500'>Your trusted health partner.</p>
        </div>
        {/* Footer centre part */}
        <div>
            <p className='text-sm font-bold text-slate-800 tracking-wider mb-5 uppercase'>Company</p>
            <ul className='flex flex-col gap-2 text-gray-600 font-semibold'>
                <li>
                  <Link to="/" onClick={() => window.scrollTo(0,0)} className="hover:text-teal-700 transition">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" onClick={() => window.scrollTo(0,0)} className="hover:text-teal-700 transition">
                    About us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" onClick={() => window.scrollTo(0,0)} className="hover:text-teal-700 transition">
                    Contact us
                  </Link>
                </li>
                <li className="hover:text-teal-700 transition cursor-pointer">
                  Privacy policy
                </li>
            </ul>
        </div>
        {/* Footer right part */}
        <div>
            <p className='text-sm font-bold text-slate-800 tracking-wider mb-5 uppercase'>Get In Touch</p>
            <ul className='flex flex-col gap-2 text-gray-500 font-medium'>
                <li>+1-213-232-2122</li>
                <li>abc@gmail.com</li>
                <li>123, xyz street, USA</li>
            </ul>
        </div>
    </div>
    <div>
        <hr className="border-slate-100" />
        <p className='py-5 text-xs text-center text-slate-400 font-bold'>© 2026 Mediversal. All rights reserved</p>
    </div>
    </div>
  )
}
