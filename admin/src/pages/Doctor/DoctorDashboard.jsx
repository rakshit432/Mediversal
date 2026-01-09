import React, { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";

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

  // ✅ FIX: explicit render states
  if (dashLoading) {
    return (
      <div className="m-5 text-gray-400">
        Loading dashboard...
      </div>
    );
  }

  if (!dashData) {
    return (
      <div className="m-5 text-center text-gray-500">
        <p>No dashboard data available.</p>
        <button onClick={getDashData} className="mt-2 text-blue-500 underline">Retry</button>
      </div>
    );
  }

  const latestBookings =
    dashData.latestBookings || dashData.latestAppointments || [];

  return (
    <div className="m-5">
      {/* STATS */}
      <div className="flex flex-wrap gap-5 mb-5">
        <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border">
          <img className="w-14" src={assets.earning_icon} alt="" />
          <div>
            <p className="text-xl font-semibold text-gray-600">
              {dashData.earning}
            </p>
            <p>Earnings</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border">
          <img className="w-14" src={assets.appointments_icon} alt="" />
          <div>
            <p className="text-xl font-semibold text-gray-600">
              {dashData.appointments}
            </p>
            <p>Appointments</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border">
          <img className="w-14" src={assets.patients_icon} alt="" />
          <div>
            <p className="text-xl font-semibold text-gray-600">
              {dashData.patients}
            </p>
            <p>Patients</p>
          </div>
        </div>
      </div>

      {/* LATEST BOOKINGS */}
      <div className="bg-white border rounded max-h-[60vh] overflow-y-scroll">
        <div className="flex items-center gap-3 p-4 border-b">
          <img src={assets.list_icon} className="w-6 h-6" />
          <p className="font-semibold text-lg">Latest Bookings</p>
        </div>

        <div className="pt-4">
          {latestBookings.length === 0 && (
            <p className="text-center text-gray-400 py-6">
              No recent bookings
            </p>
          )}

          {latestBookings.map((item) => (
            <div
              key={item._id}
              className="flex items-center px-6 py-3 gap-3 hover:bg-gray-100"
            >
              <img
                className="rounded-full w-10 h-10 object-cover"
                src={item.userData?.image}
                alt=""
              />

              <div className="flex-1 text-sm">
                <p className="text-gray-800 font-medium">
                  {item.userData?.name}
                </p>
                <p className="text-gray-600">
                  {slotDateFormat(item.slotDate)} {item.slotTime}
                </p>
              </div>

              {item.cancelled ? (
                <p className="text-red-400 text-xs font-medium">
                  Cancelled
                </p>
              ) : item.completed ? (
                <p className="text-green-500 text-xs font-medium">
                  Completed
                </p>
              ) : (
                <div className="flex gap-2">
                  <img
                    onClick={() => cancelAppointment(item._id)}
                    className="w-8 cursor-pointer"
                    src={assets.cancel_icon}
                    alt=""
                  />
                  <img
                    onClick={() => completeAppointment(item._id)}
                    className="w-8 cursor-pointer"
                    src={assets.tick_icon}
                    alt=""
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
