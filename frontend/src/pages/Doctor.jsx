import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useParams, useNavigate } from "react-router-dom";

export default function Doctor() {
  const { doctors } = useContext(AppContext);
  const { speciality } = useParams();
  const navigate = useNavigate();
  const [filteredDoc, setFilteredDoc] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

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
    <div className="px-6 py-6">
      {/* MAIN GRID LAYOUT */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* ================= LEFT SIDEBAR ================= */}
        <div className="lg:col-span-1 bg-gray-100 p-4 rounded-lg shadow h-fit">
          <p className="font-semibold mb-4 text-sm text-gray-700">
            Browse doctors by speciality
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
                onClick={() => navigate(`/doctors/${item}`)}
                className={`px-3 py-2 text-left rounded-md transition text-sm
                  ${
                    speciality === item
                      ? "bg-teal-700 text-white font-semibold"
                      : "bg-white hover:bg-teal-50 text-gray-700"
                  }`}
              >
                {item}
              </button>
            ))}
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
              className="w-full max-w-md p-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white shadow-sm"
            />
          </div>

          {doctors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 w-full col-span-full">
              <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500 text-sm mt-4 font-medium">Fetching medical specialists...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-start">
                {filteredDoc.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => navigate(`/appointment/${item._id}`)}
                    className="bg-white border border-slate-100 shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-teal-500/30 transition-all duration-300 rounded-2xl overflow-hidden cursor-pointer flex flex-col w-full max-w-[280px]"
                  >
                    {/* Image background wrapper */}
                    <div className="w-full bg-teal-50/50 p-4 flex justify-center border-b border-slate-50 relative group">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-sm transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Status badge absolute */}
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm border border-slate-100 px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                        {item.available ? (
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-slate-300"></span>
                        )}
                        <span className={`text-[10px] font-bold ${item.available ? 'text-green-600' : 'text-slate-400'}`}>
                          {item.available ? 'Available' : 'Busy'}
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-4 flex flex-col flex-1">
                      <p className="font-bold text-slate-800 hover:text-teal-700 transition text-sm">
                        {item.name}
                      </p>
                      <p className="text-teal-600 font-semibold text-xs mt-0.5">
                        {item.speciality}
                      </p>
                      <p className="text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed">
                        {item.degree || "MBBS"} • {item.experience || "5"} Yrs Exp
                      </p>
                      
                      {/* Action Button layout at bottom */}
                      <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-teal-700 text-xs font-bold bg-teal-50 px-2.5 py-1 rounded-md">
                          ${item.fees || "50"} Consultation
                        </span>
                        <span className="text-xs text-teal-600 font-bold hover:translate-x-0.5 transition duration-150">
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
                  <p className="text-gray-500 font-medium text-sm">
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
