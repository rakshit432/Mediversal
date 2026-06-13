import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Banner = () => {
  const navigate = useNavigate();

  return (
    <div className="flex rounded-[2rem] px-6 sm:px-10 md:px-14 lg:px-16 my-20 md:mx-10 shadow-lg relative overflow-hidden border border-slate-200/60 bg-gradient-to-br from-teal-50 via-sky-50 to-indigo-50">
      {/* Decorative background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-200/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-200/25 rounded-full blur-[120px] pointer-events-none" />

      {/* Left Side */}
      <div className="flex-1 py-12 sm:py-16 md:py-20 lg:py-24 lg:pl-5 flex flex-col gap-4 z-10">
        <p className="text-lg text-slate-600 md:text-xl font-bold tracking-wide">Book Appointment</p>
        <p className="text-3xl bg-gradient-to-r from-teal-700 to-cyan-700 bg-clip-text text-transparent md:text-4xl font-black tracking-tight">
          With 100+ Trusted Doctors
        </p>
        
        <div className="mt-4">
          <button
            onClick={() => {
              navigate('/login');
              window.scrollTo(0, 0);
            }}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs tracking-wider px-7 py-4 rounded-full shadow-md shadow-teal-700/15 hover:shadow-lg transition duration-200 cursor-pointer border border-teal-500/20 active:scale-95 hover:scale-105"
          >
            CREATE ACCOUNT
          </button>
        </div>
      </div>

      {/* Right Side */}
      <div 
        className="hidden md:block md:w-1/2 lg:w-[370px] relative z-10"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 15%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%)'
        }}
      >
        <img
          className="h-[95%] w-auto absolute bottom-0 right-0 hover:scale-[1.02] transition duration-300 filter drop-shadow-[0_10px_20px_rgba(15,118,110,0.08)]"
          src={assets.appointment_img}
          alt="banner"
        />
      </div>
    </div>
  )
}

export default Banner
