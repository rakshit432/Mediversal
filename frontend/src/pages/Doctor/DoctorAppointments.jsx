import React, { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/adminAssets";

const DoctorAppointments = () => {
  const {
    dToken,
    appointments,
    getAppointments,
    completeAppointment,
    cancelAppointment,
    loading,
  } = useContext(DoctorContext);

  const { calculateAge, slotDateFormat, currency } =
    useContext(AppContext);

  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
  }, [dToken, getAppointments]);

  const safeAppointments = Array.isArray(appointments)
    ? appointments
    : [];

  const sortedAppointments = [...safeAppointments].reverse();

  if (loading) {
    return (
      <div className="p-6 text-slate-400 font-semibold">
        Loading appointments...
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl p-5">
      <h1 className="mb-4 text-2xl font-bold text-slate-800">
        All Appointments
      </h1>

      <div className="bg-white border border-slate-100 rounded-xl shadow-sm text-sm overflow-hidden text-slate-700">
        {/* HEADER (desktop only) */}
        <div className="hidden sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] py-3.5 px-6 border-b border-slate-100 bg-slate-50 font-semibold text-slate-600">
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {sortedAppointments.length === 0 ? (
          <div className="p-10 text-center text-slate-400 font-medium">
            No appointments found
          </div>
        ) : (
          <div className="max-h-[70vh] overflow-y-auto divide-y divide-slate-50">
            {sortedAppointments.map((item, index) => {
              return (
                <div
                  key={item._id}
                  className="sm:grid sm:grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] flex flex-col gap-2 sm:gap-0 py-4 px-6 border-b border-slate-100 text-slate-700 items-center hover:bg-slate-50/50 transition"
                >
                  {/* INDEX */}
                  <p className="hidden sm:block text-slate-400 font-medium">
                    {index + 1}
                  </p>

                  {/* PATIENT */}
                  <div className="flex items-center gap-2">
                    {item.userData?.image && (
                      <img
                        src={item.userData.image}
                        alt="patient"
                        className="w-8 h-8 rounded-full object-cover border border-slate-100 shadow-sm"
                      />
                    )}
                    <p className="font-semibold text-slate-800">{item.userData?.name || "N/A"}</p>
                  </div>

                  {/* PAYMENT */}
                  <p className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-teal-200 bg-teal-50 text-teal-700 w-fit">
                    {item.paymentMethod === 'Online' ? "Online" : "Cash"}
                  </p>

                  {/* AGE */}
                  <p className="hidden sm:block">
                    {item.userData?.dob
                      ? calculateAge(item.userData.dob)
                      : "—"}
                  </p>

                  {/* DATE */}
                  <p className="font-medium text-slate-600">
                    {slotDateFormat(item.slotDate)} • {item.slotTime}
                  </p>

                  {/* FEES */}
                  <p className="font-semibold text-slate-850">
                    {currency}
                    {item.amount}
                  </p>

                  {/* ACTION */}
                  <div className="flex gap-2">
                    {item.cancelled ? (
                      <span className="px-2 py-0.5 text-rose-600 bg-rose-50 text-xs font-semibold rounded-full">
                        Cancelled
                      </span>
                    ) : item.completed ? (
                      <span className="px-2 py-0.5 text-emerald-600 bg-emerald-50 text-xs font-semibold rounded-full">
                        Completed
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() =>
                            cancelAppointment(item._id)
                          }
                          className="hover:scale-105 transition cursor-pointer"
                          title="Cancel appointment"
                        >
                          <img
                            src={assets.cancel_icon}
                            alt="Cancel"
                            className="w-8 h-8"
                          />
                        </button>
                        <button
                          onClick={() =>
                            completeAppointment(item._id)
                          }
                          className="hover:scale-105 transition cursor-pointer"
                          title="Complete appointment"
                        >
                          <img
                            src={assets.tick_icon}
                            alt="Complete"
                            className="w-8 h-8"
                          />
                        </button>
                      </>
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

export default DoctorAppointments;
