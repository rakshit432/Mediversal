import React, { useContext, useEffect } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';

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

  // ✅ fetch only when token changes
  useEffect(() => {
    if (atoken) {
      getAllAppointments();
    }
  }, [atoken]);

  return (
    <div className="w-full max-w-6xl p-5">

      {/* HEADER */}
      <h1 className="mb-4 text-2xl font-semibold text-gray-800">
        All Appointments
      </h1>

      <div className="bg-white border rounded-md text-sm overflow-hidden">

        {/* TABLE HEADER (desktop only) */}
        <div className="hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] py-3 px-6 border-b bg-gray-50 font-medium text-gray-600">
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
          <div className="p-8 text-center text-gray-500">
            No appointments found
          </div>
        ) : (
          <div className="max-h-[70vh] overflow-y-auto">
            {appointments.map((item, index) => {
              const isDone = item.cancelled || item.completed;

              return (
                <div
                  key={item._id}
                  className="sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] flex flex-col gap-2 sm:gap-0 py-4 px-6 border-b text-gray-700"
                >
                  {/* INDEX */}
                  <p className="hidden sm:block">{index + 1}</p>

                  {/* PATIENT */}
                  <div className="flex items-center gap-2">
                    {item.userData?.image && (
                      <img
                        className="w-8 h-8 rounded-full object-cover"
                        src={item.userData.image}
                        alt="patient"
                      />
                    )}
                    <p>{item.userData?.name || 'N/A'}</p>
                  </div>

                  {/* AGE */}
                  <p className="hidden sm:block">
                    {item.userData?.dob
                      ? calculateAge(item.userData.dob)
                      : '—'}
                  </p>

                  {/* DATE */}
                  <p>
                    {slotDateFormat(item.slotDate)} {item.slotTime}
                  </p>

                  {/* DOCTOR */}
                  <div className="flex items-center gap-2">
                    {item.docData?.image && (
                      <img
                        className="w-8 h-8 rounded-full object-cover"
                        src={item.docData.image}
                        alt="doctor"
                      />
                    )}
                    <p>{item.docData?.name || 'N/A'}</p>
                  </div>

                  {/* FEES */}
                  <p>
                    {currency}
                    {item.amount}
                  </p>

                  {/* ACTION */}
                  <div>
                    {item.cancelled ? (
                      <span className="text-red-500 text-xs font-semibold">
                        Cancelled
                      </span>
                    ) : item.completed ? (
                      <span className="text-green-600 text-xs font-semibold">
                        Completed
                      </span>
                    ) : (
                      <button
                        onClick={() => cancelAppointment(item._id)}
                        className="p-1 hover:opacity-80"
                        title="Cancel appointment"
                      >
                        <img
                          className="w-6"
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
