import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Banner = () => {
  const navigate = useNavigate();

  return (
    <div className="flex bg-teal-700 rounded-lg px-6 sm:px-10 md:px-14 lg:px-12 my-20 md:mx-10">
      
      {/* Left Side */}
      <div className="flex-1 py-8 sm:py-10 md:py-16 lg:py-24 lg:pl-5 flex flex-col gap-4">
        <p className="text-xl text-white md:text-2xl font-medium">Book Appointment</p>
        <p className="text-3xl text-white md:text-4xl font-bold">With 100+ Doctors</p>
        
        <div>
          <button
            onClick={() => {
              navigate('/login');
              window.scrollTo(0, 0);
            }}
            className="flex items-center gap-2 bg-white text-teal-700 font-medium px-5 py-3 rounded-full shadow-md hover:scale-105 transition duration-200"
          >
            Create account
          </button>
        </div>
      </div>

      {/* Right Side */}
      <div className="hidden md:block md:w-1/2 lg:w-[370px] relative">
        <img
          className="w-full absolute bottom-0 right-0 max-w-md"
          src={assets.appointment_img}
          alt="banner"
        />
      </div>
    </div>
  )
}

export default Banner
