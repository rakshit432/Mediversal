import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useParams, useNavigate } from "react-router-dom";

export default function Doctor() {
  const { doctors } = useContext(AppContext);
  const { speciality } = useParams();
  const navigate = useNavigate();
  const [filteredDoc, setFilteredDoc] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  /* ================= FILTER ================= */
  useEffect(() => {
    let filtered = doctors;
    if (speciality && doctors.length) {
      filtered = filtered.filter(
        (doc) => doc.speciality.toLowerCase() === speciality.toLowerCase()
      );
    }
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (doc) => doc.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredDoc(filtered);
  }, [doctors, speciality, searchQuery]);

  return (
    <div className="px-4 sm:px-6 py-6">
      {/* MAIN GRID LAYOUT */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* ================= LEFT SIDEBAR ================= */}
        <div className="lg:col-span-1">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="lg:hidden w-full flex items-center justify-between px-4 py-3 glass-panel rounded-2xl border border-slate-200 bg-white/70 mb-2 text-xs font-bold text-slate-700 tracking-wider uppercase"
          >
            <span>Filter by Speciality</span>
            <span className={`transition-transform duration-300 ${showFilter ? 'rotate-180' : ''}`}>▼</span>
          </button>

          <div className={`glass-panel p-4 rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-md overflow-hidden transition-all duration-300
            ${showFilter ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 lg:max-h-none lg:opacity-100'}`}>
            <p className="hidden lg:block font-bold mb-4 text-xs tracking-wider uppercase text-slate-500">
              Browse by speciality
            </p>
            <div className="flex flex-col gap-2">
              {[
                "General physician",
                "Gynecologist",
                "Dermatologist",
                "Neurologist",
                "Pediatrician",
                "Gastroenterologist",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => { navigate(`/doctors/${item}`); setShowFilter(false); }}
                  className={`px-3.5 py-2.5 text-left rounded-xl transition-all duration-200 text-xs font-semibold tracking-wide cursor-pointer
                    ${
                      speciality === item
                        ? "bg-teal-600 text-white font-bold shadow-sm border border-teal-500/20"
                        : "bg-white/40 border border-slate-200/60 text-slate-700 hover:bg-slate-50 hover:text-teal-600"
                    }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ================= DOCTOR CARDS GRID ================= */}
        <div className="lg:col-span-3">
          {/* SEARCH BAR */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search doctors by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white text-slate-800 placeholder-slate-400 shadow-sm focus:border-teal-505 transition-all duration-200"
            />
          </div>

          {doctors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 w-full col-span-full">
              <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-550 text-sm mt-4 font-medium">Fetching medical specialists...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 place-items-start">
                {filteredDoc.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => navigate(`/appointment/${item._id}`)}
                    className="glass-panel hover:bg-white hover:-translate-y-1.5 hover:border-teal-500/30 hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden cursor-pointer flex flex-col w-full max-w-[280px] group"
                  >
                    {/* Image background wrapper */}
                    <div className="w-full bg-gradient-to-b from-teal-50/20 to-teal-50/60 h-44 flex items-end justify-center relative overflow-hidden border-b border-slate-100 pt-3 px-3 pb-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain object-bottom transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Status badge absolute */}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm border border-slate-200/60 px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 z-20">
                        {item.available ? (
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                        )}
                        <span className={`text-[10px] font-bold tracking-wider uppercase ${item.available ? 'text-emerald-650' : 'text-slate-500'}`}>
                          {item.available ? 'Available' : 'Busy'}
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-4 flex flex-col flex-1">
                      <p className="font-bold text-slate-800 group-hover:text-teal-600 transition-colors duration-200 text-sm">
                        {item.name}
                      </p>
                      <p className="text-teal-655 font-bold text-xs mt-0.5">
                        {item.speciality}
                      </p>
                      <p className="text-slate-500 text-xs mt-2 line-clamp-2 leading-relaxed font-medium">
                        {item.degree || "MBBS"} • {item.experience || "5"} Yrs Exp
                      </p>
                      
                      {/* Action Button layout at bottom */}
                      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-teal-700 text-xs font-bold bg-teal-50/60 border border-teal-100 px-2.5 py-1 rounded-md">
                          ${item.fees || "50"} Consultation
                        </span>
                        <span className="text-xs text-teal-600 font-bold group-hover:text-teal-700 hover:translate-x-1 transition duration-150">
                          Book →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {filteredDoc.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-slate-500 font-medium text-sm">
                    No specialist doctors match your query.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
