import React, { useContext, useEffect } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/adminAssets';

const AllAppointment = () => {
  const {
    atoken,
    getAllAppointments,
    appointments,
    cancelAppointment,
  } = useContext(AdminContext);

  const {
    calculateAge,
    slotDateFormat,
    currency,
  } = useContext(AppContext);

  useEffect(() => {
    if (atoken) {
      getAllAppointments();
    }
  }, [atoken]);

  return (
    <div className="w-full max-w-6xl p-5">
      <h1 className="mb-4 text-2xl font-bold text-slate-800">
        All Appointments
      </h1>

      <div className="bg-white border border-slate-100 rounded-xl shadow-sm text-sm overflow-hidden text-slate-700">
        {/* TABLE HEADER (desktop only) */}
        <div className="hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] py-3.5 px-6 border-b border-slate-100 bg-slate-50 font-semibold text-slate-600">
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {/* EMPTY STATE */}
        {appointments.length === 0 ? (
          <div className="p-10 text-center text-slate-400 font-medium">
            No appointments found
          </div>
        ) : (
          <div className="max-h-[70vh] overflow-y-auto divide-y divide-slate-50">
            {appointments.map((item, index) => {
              return (
                <div
                  key={item._id}
                  className="sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] flex flex-col gap-2 sm:gap-0 py-4 px-6 border-b border-slate-100 text-slate-700 items-center hover:bg-slate-50/50 transition"
                >
                  {/* INDEX */}
                  <p className="hidden sm:block text-slate-400 font-medium">{index + 1}</p>

                  {/* PATIENT */}
                  <div className="flex items-center gap-2">
                    {item.userData?.image && (
                      <img
                        className="w-8 h-8 rounded-full object-cover border border-slate-100 shadow-sm"
                        src={item.userData.image}
                        alt="patient"
                      />
                    )}
                    <p className="font-semibold text-slate-800">{item.userData?.name || 'N/A'}</p>
                  </div>

                  {/* AGE */}
                  <p className="hidden sm:block">
                    {item.userData?.dob
                      ? calculateAge(item.userData.dob)
                      : '—'}
                  </p>

                  {/* DATE */}
                  <p className="font-medium text-slate-600">
                    {slotDateFormat(item.slotDate)} • {item.slotTime}
                  </p>

                  {/* DOCTOR */}
                  <div className="flex items-center gap-2">
                    {item.docData?.image && (
                      <img
                        className="w-8 h-8 rounded-full object-cover border border-slate-100 shadow-sm"
                        src={item.docData.image}
                        alt="doctor"
                      />
                    )}
                    <p className="font-medium">{item.docData?.name || 'N/A'}</p>
                  </div>

                  {/* FEES */}
                  <p className="font-semibold text-slate-800">
                    {currency}
                    {item.amount}
                  </p>

                  {/* ACTION */}
                  <div>
                    {item.cancelled ? (
                      <span className="px-2 py-0.5 text-rose-600 bg-rose-50 text-xs font-semibold rounded-full">
                        Cancelled
                      </span>
                    ) : item.completed ? (
                      <span className="px-2 py-0.5 text-emerald-600 bg-emerald-50 text-xs font-semibold rounded-full">
                        Completed
                      </span>
                    ) : (
                      <button
                        onClick={() => cancelAppointment(item._id)}
                        className="p-1 hover:scale-105 transition cursor-pointer"
                        title="Cancel appointment"
                      >
                        <img
                          className="w-8 h-8"
                          src={assets.cancel_icon}
                          alt="Cancel"
                        />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllAppointment;
