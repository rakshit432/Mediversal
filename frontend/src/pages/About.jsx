import React from 'react'
import { assets } from '../assets/assets'

const About = () => {
  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-4xl mx-auto w-full">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
            ABOUT <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">US</span>
          </h1>
        </div>

        <div className="bg-white/70 border border-slate-200/60 rounded-3xl shadow-lg overflow-hidden md:flex backdrop-blur-xl">
          <div className="md:w-1/2">
            <img src={assets.about_image} alt="About us" className="w-full h-80 md:h-full object-cover" />
          </div>
          <div className="md:w-1/2 p-8 sm:p-10 flex flex-col justify-center">
            <p className="text-slate-650 leading-relaxed text-sm mb-4 font-semibold">
              Welcome to Mediversal, your trusted partner in managing your healthcare needs.
            </p>
            <p className="text-slate-500 leading-relaxed text-xs mb-6 font-medium">
              Mediversal is committed to excellence in healthcare technology. We continuously strive to provide our best services.
            </p>
            <h2 className="text-lg font-bold text-slate-800 mb-2">Our Vision</h2>
            <p className="text-slate-500 leading-relaxed text-xs font-medium">Our vision at Mediversal is to create a seamless and high-quality healthcare experience for everyone.</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full mt-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
            WHY <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">CHOOSE US</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel p-6 rounded-2xl hover:border-teal-500/30 hover:-translate-y-1.5 hover:bg-teal-650 transition-all duration-300 flex flex-col text-center group cursor-pointer">
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-white transition duration-200">
              Efficient
            </h3>
            <p className="text-xs text-slate-500 group-hover:text-teal-100 transition duration-200 leading-relaxed font-semibold">
              Streamlined appointment scheduling that fits into your busy lifestyle.
            </p>
          </div>
          <div className="glass-panel p-6 rounded-2xl hover:border-teal-500/30 hover:-translate-y-1.5 hover:bg-teal-655 transition-all duration-300 flex flex-col text-center group cursor-pointer">
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-white transition duration-200">
              Convenience
            </h3>
            <p className="text-xs text-slate-500 group-hover:text-teal-100 transition duration-200 leading-relaxed font-semibold">
              Access to a wide network of trusted doctors and specialists.
            </p>
          </div>
          <div className="glass-panel p-6 rounded-2xl hover:border-teal-500/30 hover:-translate-y-1.5 hover:bg-teal-660 transition-all duration-300 flex flex-col text-center group cursor-pointer">
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-white transition duration-200">
              Personalisation
            </h3>
            <p className="text-xs text-slate-500 group-hover:text-teal-100 transition duration-200 leading-relaxed font-semibold">
              Tailored healthcare solutions designed to meet your unique needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
export default About;
