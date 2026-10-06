import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const TopDoctors = () => {
  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);

  return (
    <section className="py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">

        {/* Section Header */}
        <div className="text-center mb-14">
          <div className="section-label mx-auto mb-4">⭐ Top Specialists</div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
            Meet Our <span className="text-grad-primary">Trusted Doctors</span>
          </h2>
          <p className="text-slate-500 font-medium max-w-xl mx-auto mt-3 text-sm leading-relaxed">
            Handpicked specialists with years of experience, ready to guide you on your healing journey.
          </p>
        </div>

        {/* Doctors Grid */}
        {doctors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="wellness-loader mb-4" />
            <p className="text-slate-400 text-sm font-medium">Fetching your care team...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {doctors.slice(0, 10).map((item, index) => (
              <div
                key={item._id}
                onClick={() => { navigate(`/appointment/${item._id}`); window.scrollTo(0, 0); }}
                className="wellness-card cursor-pointer overflow-hidden group flex flex-col"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Image */}
                <div className="relative w-full h-44 bg-gradient-to-b from-teal-50/60 to-emerald-50/40
                                flex items-end justify-center overflow-hidden border-b border-slate-100/80">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain object-bottom
                               group-hover:scale-[1.06] transition-transform duration-500"
                  />
                  {/* Status badge */}
                  <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm
                                  border border-white/80 px-2 py-1 rounded-full shadow-sm
                                  flex items-center gap-1.5">
                    {item.available ? (
                      <>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                        <span className="text-[9px] font-bold text-emerald-600 tracking-wide uppercase">Live</span>
                      </>
                    ) : (
                      <>
                        <span className="h-2 w-2 rounded-full bg-slate-300" />
                        <span className="text-[9px] font-bold text-slate-400 tracking-wide uppercase">Busy</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex flex-col flex-1 gap-1 text-center">
                  <p className="font-black text-slate-800 group-hover:text-teal-700 transition-colors duration-200 text-sm leading-tight">
                    {item.name}
                  </p>
                  <p className="text-teal-600 font-bold text-[11px] tracking-wide">
                    {item.speciality}
                  </p>
                  <p className="text-slate-400 text-[10px] font-medium mt-1">
                    {item.degree || 'MBBS'} · {item.experience || '5'} yrs
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View More */}
        <div className="text-center mt-12">
          <button
            onClick={() => { navigate('/doctors'); window.scrollTo(0, 0); }}
            className="btn-primary text-[11px]"
          >
            VIEW ALL SPECIALISTS
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default TopDoctors;
