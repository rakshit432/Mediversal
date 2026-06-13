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
    <div className="p-5 h-[calc(100vh-80px)] overflow-y-auto w-full">

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
              className="group bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
            >
              {/* IMAGE */}
              <div className="w-full h-48 bg-slate-50 flex items-center justify-center overflow-hidden">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-300"
                />
              </div>

              {/* CONTENT */}
              <div className="p-4 text-slate-700">
                <p className="text-lg font-bold text-slate-800">
                  {doctor.name}
                </p>
                <p className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full inline-block mt-1">
                  {doctor.speciality}
                </p>

                {/* AVAILABILITY */}
                <div className="mt-4 pt-3 border-t border-slate-50">
                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={doctor.available}
                      disabled={doctor.loading}
                      onChange={() => changeAvailablity(doctor._id)}
                      className="accent-teal-600 disabled:cursor-not-allowed w-4 h-4 cursor-pointer"
                    />

                    <span
                      className={
                        doctor.available
                          ? 'text-emerald-600 font-bold text-xs'
                          : 'text-rose-500 font-bold text-xs'
                      }
                    >
                      {doctor.available ? 'Available' : 'Not Available'}
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
