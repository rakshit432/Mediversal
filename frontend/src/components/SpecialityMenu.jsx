import React from 'react'
import { Link } from 'react-router-dom'
import { specialityData } from '../assets/assets'

const SpecialityMenu = () => {
  return (
    <section className="py-20 px-4 sm:px-6" id="speciality">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="section-label mx-auto mb-4">
            🩺 Specialities
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
            Find by <span className="text-grad-primary">Speciality</span>
          </h2>
          <p className="text-slate-500 font-medium max-w-xl mx-auto mt-3 text-sm leading-relaxed">
            Browse our network of board-certified specialists and schedule your visit — quickly,
            comfortably, and without the waiting room.
          </p>
        </div>

        {/* Speciality Grid */}
        <div className="flex flex-wrap justify-center gap-5 mt-6">
          {specialityData.map((item, index) => (
            <Link
              key={index}
              to={`/doctors/${item.speciality}`}
              onClick={() => window.scrollTo(0, 0)}
              className="group flex flex-col items-center gap-3 wellness-card p-6 w-36 sm:w-40 cursor-pointer"
              style={{ animationDelay: `${index * 0.06}s` }}
            >
              {/* Icon ring */}
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50
                                border border-teal-100/80 flex items-center justify-center
                                group-hover:scale-110 group-hover:shadow-[0_8px_20px_rgba(13,148,136,0.20)]
                                transition-all duration-300">
                  <img
                    src={item.image}
                    alt={item.speciality}
                    className="w-9 h-9 object-contain
                               group-hover:drop-shadow-[0_4px_10px_rgba(13,148,136,0.25)]
                               transition duration-300"
                  />
                </div>
                {/* Glow dot on hover */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-teal-400/0 to-cyan-400/0
                                group-hover:from-teal-400/10 group-hover:to-cyan-400/10 transition-all duration-300 -z-10" />
              </div>

              <p className="font-bold text-slate-700 text-xs text-center group-hover:text-teal-700 transition-colors duration-300 leading-tight">
                {item.speciality}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SpecialityMenu
