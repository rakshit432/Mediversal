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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-8">
        {specialityData.map((item, index) => (
          <Link 
            key={index} 
            to={`/doctors`}
            onClick={() => {scrollTo(0,0)}}
            className="flex flex-col items-center bg-white p-4 rounded-lg shadow hover:shadow-md transition"
          >
            <img 
              src={item.image} 
              alt={item.speciality} 
              className="w-20 h-20 object-contain mb-2" 
            />
            <p className="font-medium text-gray-800">{item.speciality}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default SpecialityMenu 
