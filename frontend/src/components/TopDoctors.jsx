import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const TopDoctors = () => {
    const navigate = useNavigate();
    const { doctors } = useContext(AppContext);

  return (
    <div className="py-16 px-6">
      {/* Heading */}
      <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent tracking-tight text-center">
        Top Doctors to Book
      </h1>
      <p className="text-slate-500 text-center mb-10 font-medium">
        Simply browse through our extensive list of trusted doctors.
      </p>

      {/* Doctors List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {doctors.slice(0, 10).map((item, index) => (
          <div 
            onClick={() => { navigate(`/appointment/${item._id}`); window.scrollTo(0, 0); }}
            key={index}
            className="glass-panel hover:bg-white hover:-translate-y-1.5 hover:border-teal-500/30 hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden cursor-pointer flex flex-col group"
          >
            {/* Image background wrapper */}
            <div className="w-full bg-gradient-to-b from-teal-50/20 to-teal-50/60 h-40 flex items-end justify-center relative overflow-hidden border-b border-slate-100 pt-3 px-3 pb-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-contain object-bottom transition-transform duration-300 group-hover:scale-105"
              />
              {/* Status badge absolute */}
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm border border-slate-200/60 px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1.5 z-20">
                {item.available ? (
                  <span className="flex h-1.5 w-1.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                )}
                <span className={`text-[8px] font-bold tracking-wider uppercase ${item.available ? 'text-emerald-650' : 'text-slate-500'}`}>
                  {item.available ? 'Live' : 'Busy'}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="p-4 flex flex-col flex-1 text-center items-center">
              <p className="font-bold text-slate-800 group-hover:text-teal-600 transition-colors duration-200 text-sm truncate w-full">
                {item.name}
              </p>
              <p className="text-teal-650 font-bold text-[11px] mt-0.5 truncate w-full">
                {item.speciality}
              </p>
              <p className="text-slate-500 text-[10px] mt-1.5 font-medium">
                {item.degree || "MBBS"} • {item.experience || "5"} Yrs Exp
              </p>
            </div>
          </div>
        ))}
      </div>
      {/* More Button */}
      <div className="text-center mt-10">
        <button  
          onClick={() => { navigate('/doctors'); window.scrollTo(0, 0); }}
          className="px-8 py-3.5 bg-teal-600 text-white text-xs font-bold tracking-wider rounded-full hover:bg-teal-700 active:scale-95 hover:scale-105 transition-all duration-200 cursor-pointer shadow-md shadow-teal-700/10 hover:shadow-lg border border-teal-500/20"
        >
          VIEW MORE SPECIALISTS
        </button>
      </div>
    </div>
  );
};

export default TopDoctors;
