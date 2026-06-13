import React from 'react'
import { Link } from 'react-router-dom'
import { specialityData } from '../assets/assets'

const SpecialityMenu = () => {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-slate-700" id="speciality">
      
      <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
        Find by Speciality
      </h1>
      <p className="text-center text-slate-500 font-medium max-w-xl">
        Simply browse through our extensive list of trusted doctors, 
        and schedule your appointment hassle-free.
      </p>

      <div className="flex flex-wrap justify-center gap-6 mt-8">
        {specialityData.map((item, index) => (
          <Link 
            key={index} 
            to={`/doctors/${item.speciality}`}
            onClick={() => { window.scrollTo(0, 0); }}
            className="flex flex-col items-center justify-center glass-panel p-5 rounded-2xl hover:border-teal-500/30 hover:-translate-y-1.5 hover:scale-105 hover:bg-white transition-all duration-300 w-36 cursor-pointer group"
          >
            <img 
              src={item.image} 
              alt={item.speciality} 
              className="w-16 h-16 object-contain mb-3 group-hover:scale-110 transition duration-300 filter drop-shadow-[0_4px_6px_rgba(15,118,110,0.05)] group-hover:drop-shadow-[0_4px_10px_rgba(15,118,110,0.15)]" 
            />
            <p className="font-bold text-slate-705 text-xs text-center group-hover:text-teal-650 transition-colors duration-300">
              {item.speciality}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default SpecialityMenu 
