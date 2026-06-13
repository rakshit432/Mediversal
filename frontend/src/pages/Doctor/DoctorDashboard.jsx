import React, { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/adminAssets";

const DoctorDashboard = () => {
  const {
    dashData,
    dashLoading,
    getDashData,
    dToken,
    cancelAppointment,
    completeAppointment,
  } = useContext(DoctorContext);

  const { slotDateFormat } = useContext(AppContext);

  useEffect(() => {
    if (dToken) {
      getDashData();
    }
  }, [dToken, getDashData]);

  if (dashLoading) {
    return (
      <div className="m-5 text-slate-400 font-semibold">
        Loading dashboard...
      </div>
    );
  }

  if (!dashData) {
    return (
      <div className="m-5 text-center text-slate-500 py-10 font-semibold">
        <p>No dashboard data available.</p>
        <button onClick={getDashData} className="mt-2 text-teal-600 underline cursor-pointer">Retry</button>
      </div>
    );
  }

  const latestBookings =
    dashData.latestBookings || dashData.latestAppointments || [];

  return (
    <div className="m-5 w-full">
      {/* STATS */}
      <div className="flex flex-wrap gap-5 mb-5">
        <div className="flex items-center gap-4 bg-white p-6 min-w-60 rounded-xl border border-slate-100 shadow-sm cursor-pointer hover:scale-102 transition duration-200">
          <img className="w-14" src={assets.earning_icon} alt="" />
          <div>
            <p className="text-2xl font-bold text-slate-800">
              ${dashData.earning ? dashData.earning : 0}
            </p>
            <p className="text-sm text-slate-500 font-medium">Earnings</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-6 min-w-60 rounded-xl border border-slate-100 shadow-sm cursor-pointer hover:scale-102 transition duration-200">
          <img className="w-14" src={assets.appointments_icon} alt="" />
          <div>
            <p className="text-2xl font-bold text-slate-800">
              {dashData.appointments ? dashData.appointments : 0}
            </p>
            <p className="text-sm text-slate-500 font-medium">Appointments</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-6 min-w-60 rounded-xl border border-slate-100 shadow-sm cursor-pointer hover:scale-102 transition duration-200">
          <img className="w-14" src={assets.patients_icon} alt="" />
          <div>
            <p className="text-2xl font-bold text-slate-800">
              {dashData.patients ? dashData.patients : 0}
            </p>
            <p className="text-sm text-slate-500 font-medium">Patients</p>
          </div>
        </div>
      </div>

      {/* LATEST BOOKINGS */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm max-h-[60vh] overflow-y-scroll scrollbar-hide w-full">
        <div className="flex items-center gap-3 p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl">
          <img src={assets.list_icon} className="w-6 h-6" />
          <p className="font-bold text-slate-800 text-lg">Latest Bookings</p>
        </div>

        <div className="pt-2 divide-y divide-slate-50">
          {latestBookings.length === 0 && (
            <p className="text-center text-slate-400 py-10 font-medium">
              No recent bookings
            </p>
          )}

          {latestBookings.map((item) => (
            <div
              key={item._id}
              className="flex items-center px-6 py-4 gap-4 hover:bg-slate-50/80 transition"
            >
              <img
                className="rounded-full w-11 h-11 object-cover border border-slate-100"
                src={item.userData?.image}
                alt=""
              />

              <div className="flex-1 text-sm">
                <p className="text-slate-800 font-semibold">
                  {item.userData?.name}
                </p>
                <p className="text-slate-500 mt-0.5 text-xs font-medium">
                  {slotDateFormat(item.slotDate)} • {item.slotTime}
                </p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-200 bg-teal-50 text-teal-700 inline-block mt-1">
                  {item.paymentMethod === 'Online' ? "Online" : "Cash"}
                </span>
              </div>

              {item.cancelled ? (
                <span className="px-2.5 py-1 text-rose-600 bg-rose-50 text-xs font-semibold rounded-full">
                  Cancelled
                </span>
              ) : item.completed ? (
                <span className="px-2.5 py-1 text-emerald-600 bg-emerald-50 text-xs font-semibold rounded-full">
                  Completed
                </span>
              ) : (
                <div className="flex gap-2">
                  <img
                    onClick={() => cancelAppointment(item._id)}
                    className="w-8 h-8 cursor-pointer hover:scale-105 transition"
                    src={assets.cancel_icon}
                    alt="Cancel"
                  />
                  <img
                    onClick={() => completeAppointment(item._id)}
                    className="w-8 h-8 cursor-pointer hover:scale-105 transition"
                    src={assets.tick_icon}
                    alt="Complete"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
