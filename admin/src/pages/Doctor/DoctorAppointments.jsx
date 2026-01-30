import React, { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";

const DoctorAppointments = () => {
  const {
    dToken,
    appointments,
    getAppointments,
    completeAppointment,
    cancelAppointment,
    loading, // optional but useful
  } = useContext(DoctorContext);

  const { calculateAge, slotDateFormat, currency } =
    useContext(AppContext);

  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
  }, [dToken, getAppointments]);

  // ✅ SAFE: handle null or undefined
  const safeAppointments = Array.isArray(appointments)
    ? appointments
    : [];

  // ✅ safe reversed copy (no mutation)
  const sortedAppointments = [...safeAppointments].reverse();

  // ✅ optional loading guard
  if (loading) {
    return (
      <div className="p-6 text-gray-400">
        Loading appointments...
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl p-5">
      <h1 className="mb-4 text-2xl font-semibold text-gray-800">
        All Appointments
      </h1>

      <div className="bg-white border rounded-md text-sm overflow-hidden">
        {/* HEADER (desktop only) */}
        <div className="hidden sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] py-3 px-6 border-b bg-gray-50 font-medium text-gray-600">
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {sortedAppointments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No appointments found
          </div>
        ) : (
          <div className="max-h-[70vh] overflow-y-auto">
            {sortedAppointments.map((item, index) => {
              const isDone = item.cancelled || item.completed;

              return (
                <div
                  key={item._id}
                  className="sm:grid sm:grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] flex flex-col gap-2 sm:gap-0 py-4 px-6 border-b text-gray-700"
                >
                  {/* INDEX */}
                  <p className="hidden sm:block">
                    {index + 1}
                  </p>

                  {/* PATIENT */}
                  <div className="flex items-center gap-2">
                    {item.userData?.image && (
                      <img
                        src={item.userData.image}
                        alt="patient"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                    <p>{item.userData?.name || "N/A"}</p>
                  </div>

                  {/* PAYMENT */}
                  <p className="text-xs inline-block border border-primary px-2 py-0.5 rounded-full w-fit">
                    {item.paymentMethod === 'Online' ? "Online" : "Cash"}
                  </p>

                  {/* AGE */}
                  <p className="hidden sm:block">
                    {item.userData?.dob
                      ? calculateAge(item.userData.dob)
                      : "—"}
                  </p>

                  {/* DATE */}
                  <p>
                    {slotDateFormat(item.slotDate)}{" "}
                    {item.slotTime}
                  </p>

                  {/* FEES */}
                  <p>
                    {currency}
                    {item.amount}
                  </p>

                  {/* ACTION */}
                  <div className="flex gap-2">
                    {item.cancelled ? (
                      <span className="text-red-500 text-xs font-semibold">
                        Cancelled
                      </span>
                    ) : item.completed ? (
                      <span className="text-green-600 text-xs font-semibold">
                        Completed
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() =>
                            cancelAppointment(item._id)
                          }
                          className="hover:opacity-80"
                          title="Cancel appointment"
                        >
                          <img
                            src={assets.cancel_icon}
                            alt="Cancel"
                            className="w-6"
                          />
                        </button>
                        <button
                          onClick={() =>
                            completeAppointment(item._id)
                          }
                          className="hover:opacity-80"
                          title="Complete appointment"
                        >
                          <img
                            src={assets.tick_icon}
                            alt="Complete"
                            className="w-6"
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
