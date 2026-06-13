import React, { useEffect, useContext } from 'react';
import { AdminContext } from '../../context/AdminContext';

const DoctorsList = () => {
  const {
    doctors,
    atoken,
    getAllDoctors,
    changeAvailablity,
  } = useContext(AdminContext);

  useEffect(() => {
    if (atoken) {
      getAllDoctors();
    }
  }, [atoken]);

  return (
    <div className="w-full">

      {/* ===== HEADER ===== */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          All Doctors
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Manage doctor profiles and availability
        </p>
      </div>

      {/* ===== EMPTY STATE ===== */}
      {doctors.length === 0 ? (
        <div className="text-center text-slate-400 mt-20 font-medium">
          No doctors found.
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          {doctors.map((doctor) => (
            <div
              key={doctor._id}
              className="glass-panel hover:bg-white hover:-translate-y-1.5 hover:border-teal-500/30 hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden cursor-pointer flex flex-col group"
            >
              {/* IMAGE */}
              <div className="w-full h-48 bg-gradient-to-b from-teal-50/20 to-teal-50/60 flex items-end justify-center relative overflow-hidden border-b border-slate-100 pt-3 px-3 pb-0">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-full object-contain object-bottom transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* CONTENT */}
              <div className="p-4 flex flex-col flex-1 text-center items-center text-slate-700">
                <p className="font-bold text-slate-800 group-hover:text-teal-600 transition-colors duration-200 text-sm truncate w-full">
                  {doctor.name}
                </p>
                <div className="mt-1.5">
                  <span className="text-teal-650 font-bold text-[10px] tracking-wide bg-teal-50/60 border border-teal-100/50 px-2.5 py-0.5 rounded-full">
                    {doctor.speciality}
                  </span>
                </div>

                {/* AVAILABILITY */}
                <div className="mt-4 pt-3 border-t border-slate-100 w-full flex justify-center">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none text-slate-600">
                    <input
                      type="checkbox"
                      checked={doctor.available}
                      disabled={doctor.loading}
                      onChange={() => changeAvailablity(doctor._id)}
                      className="accent-teal-600 disabled:cursor-not-allowed w-3.5 h-3.5 cursor-pointer"
                    />

                    <span
                      className={
                        doctor.available
                          ? 'text-emerald-600 font-bold'
                          : 'text-rose-500 font-bold'
                      }
                    >
                      {doctor.available ? 'Available' : 'Busy'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
};

export default DoctorsList;
