import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const TopDoctors = () => {
    const navigate = useNavigate();
    const { doctors } = useContext(AppContext);

  return (
    <div className="py-16 px-6">
      {/* Heading */}
      <h1 className="text-2xl font-semibold text-center">Top Doctors to Book</h1>
      <p className="text-gray-600 text-center mb-10">
        Simply browse through our extensive list of trusted doctors.
      </p>

      {/* Doctors List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {doctors.slice(0, 10).map((item, index) => (
          <div 
            onClick={() => { navigate(`/appointment/${item._id}`); window.scrollTo(0, 0); }}
            key={index}
            className="bg-white border border-slate-100 shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-teal-500/30 transition-all duration-300 rounded-2xl overflow-hidden cursor-pointer flex flex-col"
          >
            {/* Image background wrapper */}
            <div className="w-full bg-teal-50/50 p-4 flex justify-center border-b border-slate-50 relative group">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-full border-4 border-white shadow-sm transition-transform duration-300 group-hover:scale-105"
              />
              {/* Status badge absolute */}
              <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm border border-slate-100 px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                {item.available ? (
                  <span className="flex h-1.5 w-1.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                  </span>
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                )}
                <span className={`text-[8px] font-bold ${item.available ? 'text-green-600' : 'text-slate-400'}`}>
                  {item.available ? 'Live' : 'Busy'}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="p-4 flex flex-col flex-1 text-center items-center">
              <p className="font-bold text-slate-800 hover:text-teal-700 transition text-sm truncate w-full">
                {item.name}
              </p>
              <p className="text-teal-600 font-semibold text-[11px] mt-0.5 truncate w-full">
                {item.speciality}
              </p>
              <p className="text-slate-400 text-[10px] mt-1.5">
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
          className="px-6 py-2.5 bg-teal-700 text-white text-xs font-bold tracking-wide rounded-full hover:bg-teal-800 active:scale-95 hover:scale-105 transition-all duration-200 cursor-pointer shadow-md shadow-teal-700/10 hover:shadow-lg hover:shadow-teal-700/20"
        >
          VIEW MORE SPECIALISTS
        </button>
      </div>
    </div>
  );
};

export default TopDoctors;
