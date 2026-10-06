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
        (doc) => doc.speciality.toLowerCase() === speciality.toLowerCase() && doc._id !== docId
      );
      setReldoc(related);
    }
  }, [doctors, docId, speciality]);

  if (relDoc.length === 0) return null;

  return (
    <section className="py-8">
      <div className="text-center mb-8">
        <div className="section-label mx-auto mb-3">👥 Related Specialists</div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
          More <span className="text-grad-primary">{speciality}</span> Doctors
        </h2>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {relDoc.slice(0, 5).map((item) => (
          <div
            key={item._id}
            onClick={() => { navigate(`/appointment/${item._id}`); window.scrollTo(0, 0); }}
            className="wellness-card overflow-hidden cursor-pointer flex flex-col w-52 shrink-0 group"
          >
            <div className="w-full h-36 bg-gradient-to-b from-teal-50/60 to-emerald-50/40
                            flex items-end justify-center relative overflow-hidden border-b border-slate-100/60">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-contain object-bottom group-hover:scale-[1.06] transition-transform duration-500"
              />
              {/* Status */}
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm border border-white/80
                              px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1.5">
                {item.available ? (
                  <>
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-[8px] font-bold text-emerald-600 uppercase">Live</span>
                  </>
                ) : (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Busy</span>
                  </>
                )}
              </div>
            </div>
            <div className="p-4 text-center">
              <p className="font-black text-slate-800 group-hover:text-teal-700 transition-colors text-xs leading-tight">
                {item.name}
              </p>
              <p className="text-teal-600 font-bold text-[10px] mt-1">{item.speciality}</p>
              <p className="text-slate-400 text-[9px] font-medium mt-1">
                {item.degree || 'MBBS'} · {item.experience || '5'} yrs
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
