import React from 'react'
import { assets } from '../assets/assets'

const Contact = () => {
  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
            CONTACT <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">US</span>
          </h1>
        </div>

        <div className="bg-white/70 border border-slate-200/60 rounded-3xl p-6 sm:p-10 shadow-lg flex flex-col md:flex-row items-center gap-10 backdrop-blur-xl"> 
          <div className="md:w-1/2">
            <img className="w-full h-80 object-cover rounded-2xl border border-slate-200 shadow-sm" src={assets.contact_image} alt="contact us"/>
          </div>
          
          <div className="md:w-1/2 flex flex-col gap-6 text-slate-500 text-xs">
            <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl">
              <p className="text-sm font-bold text-slate-800 tracking-wider mb-2 uppercase">Our Office</p>
              <p className="leading-relaxed font-semibold">
                54709 Willms Station <br/> Suite 350, Washington, USA
              </p>
              <p className="mt-3 leading-relaxed font-bold text-teal-700">
                📞 Tel: (415) 555-0199 <br/> ✉️ Email: office@mediversal.com
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl">
              <p className="text-sm font-bold text-slate-800 tracking-wider mb-2 uppercase">Careers at Mediversal</p>
              <p className="leading-relaxed font-semibold mb-4 text-slate-500">
                Join our team and help us make a difference in healthcare.
              </p>
              <button className="px-5 py-2.5 bg-teal-600 border border-teal-500/20 text-white font-bold text-xs tracking-wider rounded-full hover:bg-teal-700 hover:shadow-md transition-all duration-200 active:scale-95 hover:scale-105 shadow-sm cursor-pointer">
                EXPLORE OPPORTUNITIES
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
