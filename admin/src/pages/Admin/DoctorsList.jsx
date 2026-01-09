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
    <div className="p-5 h-[calc(100vh-80px)] overflow-y-auto">

      {/* ===== HEADER ===== */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          All Doctors
        </h1>
        <p className="text-sm text-gray-500">
          Manage doctor availability
        </p>
      </div>

      {/* ===== EMPTY STATE ===== */}
      {doctors.length === 0 ? (
        <div className="text-center text-gray-500 mt-20">
          No doctors found.
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          {doctors.map((doctor) => (
            <div
              key={doctor._id}
              className="group bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* IMAGE */}
              <div className="w-full h-48 bg-indigo-50 flex items-center justify-center overflow-hidden">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* CONTENT */}
              <div className="p-4">
                <p className="text-lg font-medium text-gray-800">
                  {doctor.name}
                </p>
                <p className="text-sm text-gray-500">
                  {doctor.speciality}
                </p>

                {/* AVAILABILITY */}
                <label className="mt-3 flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={doctor.available}
                    disabled={doctor.loading}
                    onChange={() => changeAvailablity(doctor._id)}
                    className="accent-teal-600 disabled:cursor-not-allowed"
                  />

                  <span
                    className={
                      doctor.available
                        ? 'text-green-600 font-medium'
                        : 'text-red-500 font-medium'
                    }
                  >
                    {doctor.available ? 'Available' : 'Not Available'}
                  </span>
                </label>
              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
};

export default DoctorsList;
