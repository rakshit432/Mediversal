import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useParams, useNavigate } from 'react-router-dom';

export default function Doctor() {
  const { doctors } = useContext(AppContext);
  const { speciality } = useParams();
  const navigate = useNavigate();
  const [filteredDoc, setFilteredDoc] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const SPECIALITIES = [
    'General physician', 'Gynecologist', 'Dermatologist',
    'Neurologist', 'Pediatrician', 'Gastroenterologist',
  ];

  useEffect(() => {
    let filtered = doctors;
    if (speciality && doctors.length)
      filtered = filtered.filter((d) => d.speciality.toLowerCase() === speciality.toLowerCase());
    if (searchQuery.trim())
      filtered = filtered.filter((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredDoc(filtered);
  }, [doctors, speciality, searchQuery]);

  return (
    <div className="min-h-screen px-4 sm:px-6 py-10 page-enter">
      <div className="max-w-7xl mx-auto">

        {/* Page title */}
        <div className="mb-8">
          <div className="section-label mb-3">🩺 Our Specialists</div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
            {speciality
              ? <><span className="text-grad-primary">{speciality}</span> Specialists</>
              : <>Find Your <span className="text-grad-primary">Doctor</span></>}
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-2">
            {filteredDoc.length} specialist{filteredDoc.length !== 1 ? 's' : ''} available
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* ── SIDEBAR ── */}
          <div className="lg:col-span-1">
            {/* Mobile toggle */}
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="lg:hidden w-full flex items-center justify-between px-4 py-3
                         wellness-card rounded-2xl text-xs font-bold text-slate-700 tracking-wider uppercase mb-2"
            >
              <span>Filter by Speciality</span>
              <span className={`transition-transform duration-300 text-teal-600 ${showFilter ? 'rotate-180' : ''}`}>▼</span>
            </button>

            <div className={`wellness-card p-4 rounded-2xl overflow-hidden transition-all duration-300
              ${showFilter ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 lg:max-h-none lg:opacity-100'}`}>
              <p className="hidden lg:block font-black mb-4 text-[10px] tracking-widest uppercase text-slate-400">
                Browse by Speciality
              </p>

              {/* All */}
              <button
                onClick={() => { navigate('/doctors'); setShowFilter(false); }}
                className={`w-full px-3.5 py-2.5 text-left rounded-xl mb-1 transition-all duration-200 text-xs font-semibold cursor-pointer ${
                  !speciality
                    ? 'grad-primary text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:bg-teal-50/80 hover:text-teal-700'
                }`}
              >
                All Specialities
              </button>

              <div className="flex flex-col gap-1 mt-1">
                {SPECIALITIES.map((item) => (
                  <button
                    key={item}
                    onClick={() => { navigate(`/doctors/${item}`); setShowFilter(false); }}
                    className={`px-3.5 py-2.5 text-left rounded-xl transition-all duration-200 text-xs font-semibold cursor-pointer ${
                      speciality === item
                        ? 'grad-primary text-white font-bold shadow-sm'
                        : 'text-slate-600 hover:bg-teal-50/80 hover:text-teal-700'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── DOCTOR GRID ── */}
          <div className="lg:col-span-3">
            {/* Search */}
            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input
                type="text"
                placeholder="Search doctors by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-wellness pl-10"
              />
            </div>

            {doctors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="wellness-loader mb-4" />
                <p className="text-slate-400 text-sm font-medium">Fetching specialists...</p>
              </div>
            ) : filteredDoc.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-4">🔍</p>
                <p className="text-slate-600 font-bold text-lg">No doctors found</p>
                <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filter</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                {filteredDoc.map((item, idx) => (
                  <div
                    key={item._id}
                    onClick={() => navigate(`/appointment/${item._id}`)}
                    className="wellness-card overflow-hidden cursor-pointer flex flex-col group"
                    style={{ animationDelay: `${idx * 0.04}s` }}
                  >
                    {/* Image */}
                    <div className="w-full h-48 bg-gradient-to-b from-teal-50/60 to-emerald-50/40
                                    flex items-end justify-center relative overflow-hidden border-b border-slate-100/60">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain object-bottom
                                   group-hover:scale-[1.06] transition-transform duration-500"
                      />
                      {/* Status */}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm
                                      border border-white/80 px-2.5 py-1 rounded-full shadow-sm
                                      flex items-center gap-1.5">
                        {item.available ? (
                          <>
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            </span>
                            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide">Available</span>
                          </>
                        ) : (
                          <>
                            <span className="h-2 w-2 rounded-full bg-slate-300" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Busy</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 flex flex-col flex-1">
                      <p className="font-black text-slate-800 group-hover:text-teal-700 transition-colors text-sm leading-tight">
                        {item.name}
                      </p>
                      <p className="text-teal-600 font-bold text-[11px] mt-1 tracking-wide">{item.speciality}</p>
                      <p className="text-slate-400 text-[10px] font-medium mt-1">
                        {item.degree || 'MBBS'} · {item.experience || '5'} yrs
                      </p>
                      <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-teal-700 text-xs font-bold bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-lg">
                          ${item.fees || '50'}
                        </span>
                        <span className="text-teal-600 text-xs font-bold group-hover:translate-x-1 transition-transform duration-200">
                          Book →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
