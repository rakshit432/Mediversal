import React from 'react'
import { Link } from 'react-router-dom'
import { specialityData } from '../assets/assets'

const SpecialityMenu = () => {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-gray-700" id="speciality">
      
      <h1 className="text-2xl md:text-3xl font-semibold">Find by Speciality</h1>
      <p className="text-center max-w-xl">
        Simply browse through our extensive list of trusted doctors, 
        and schedule your appointment hassle-free.
      </p>

      <div className="flex flex-wrap justify-center gap-6 mt-8">
        {specialityData.map((item, index) => (
          <Link 
            key={index} 
            to={`/doctors/${item.speciality}`}
            onClick={() => { window.scrollTo(0, 0); }}
            className="flex flex-col items-center justify-center bg-white p-5 border border-slate-100 rounded-2xl shadow-sm hover:shadow-lg hover:border-teal-500/20 hover:-translate-y-1 hover:scale-105 transition-all duration-300 w-36 cursor-pointer"
          >
            <img 
              src={item.image} 
              alt={item.speciality} 
              className="w-16 h-16 object-contain mb-3" 
            />
            <p className="font-semibold text-gray-700 text-xs text-center">{item.speciality}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default SpecialityMenu 
