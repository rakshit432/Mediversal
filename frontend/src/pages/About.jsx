import React from 'react'
import { assets } from '../assets/assets'

const About = () => {
  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            ABOUT <span className="text-teal-700">US</span>
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden md:flex">
          <div className="md:w-1/2">
            <img src={assets.about_image} alt="About us" className="w-full h-full object-cover" />
          </div>
          <div className="md:w-1/2 p-8 flex flex-col justify-center">
            <p className="text-gray-600 leading-relaxed mb-4">
              Welcome to Mediversal, your trusted partner in managing your healthcare needs.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Mediversal is committed to excellence in healthcare technology. We continuously strive to provide our best services.
            </p>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">Our vision at Mediversal is to create a seamless and high-quality healthcare experience for everyone.</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl w-full mt-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            WHY <span className="text-teal-700">CHOOSE US</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-6 hover:bg-teal-700 hover:text-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Efficient
            </h3>
            <p className="text-gray-600 hover:text-white">Streamlined appointment scheduling that fits into your busy lifestyle.</p>
          </div>
          <div className="bg-white hover:bg-teal-700 hover:text-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Convenience
            </h3>
            <p className="text-gray-600 hover:text-white">Access to a wide network of trusted doctors and specialists.</p>
          </div>
          <div className="bg-white p-6 hover:bg-teal-700 hover:text-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Personalisation
            </h3>
            <p className="text-gray-600 hover:text-white">Tailored healthcare solutions designed to meet your unique needs.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
export default About;
