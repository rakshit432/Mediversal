import React, { useEffect, useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export const RelatedDoctors = ({ speciality, docId }) => {
  const { doctors } = useContext(AppContext);
  const [relDoc, setReldoc] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (doctors.length > 0 && speciality) {
      const related = doctors.filter(
        (doc) =>
          doc.speciality.toLowerCase() === speciality.toLowerCase() &&
          doc._id !== docId
      );
      setReldoc(related);
    }
  }, [doctors, docId, speciality]);

  return (
    <div className="py-16 px-6">
      {/* Heading */}
      <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent tracking-tight text-center mb-2">
        Related Doctors
      </h1>
      <p className="text-slate-400 text-center mb-10 font-medium text-xs md:text-sm">
        More similar specialists available for you.
      </p>

      {/* Doctors List */}
      <div className="flex flex-nowrap justify-start gap-6 overflow-x-auto scrollbar-hide pb-4">
        {relDoc.slice(0, 5).map((item) => (
          <div
            onClick={() => {navigate(`/appointment/${item._id}`);window.scrollTo(0,0)}}
            key={item._id}
            className="glass-panel hover:bg-white hover:-translate-y-1.5 hover:border-teal-500/30 hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden cursor-pointer flex flex-col w-56 group flex-shrink-0"
          >
            {/* Image background wrapper */}
            <div className="w-full bg-gradient-to-b from-teal-50/20 to-teal-50/60 h-36 flex items-end justify-center relative overflow-hidden border-b border-slate-100 pt-3 px-3 pb-0">
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
              <p className="font-bold text-slate-800 group-hover:text-teal-600 transition-colors duration-200 text-xs truncate w-full">
                {item.name}
              </p>
              <p className="text-teal-650 font-bold text-[10px] mt-0.5 truncate w-full">
                {item.speciality}
              </p>
              <p className="text-slate-500 text-[9px] mt-1.5 font-medium">
                {item.degree || "MBBS"} • {item.experience || "5"} Yrs Exp
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
