import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Myappointment = () => {
  const { backendUrl, token, getDoctorsData, slotDateFormat } = useContext(AppContext);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  /* ================= FETCH APPOINTMENTS ================= */
  const getUserAppointments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        backendUrl + '/api/user/appointments',
        { headers: { token } }
      );

      if (data.success) {
        setAppointments(data.appointments || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  /* ================= CANCEL APPOINTMENT ================= */
  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/cancel-appointment',
        { appointmentId },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Unable to cancel appointment");
    }
  };

  /* ================= RAZORPAY ================= */
  const initPay = (order) => {
    if (!window.Razorpay) {
      toast.error("Payment service not loaded");
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY,
      amount: order.amount,
      currency: order.currency,
      name: 'Appointment Payment',
      description: 'Doctor Appointment',
      order_id: order.id,
      handler: async (response) => {
        try {
          const { data } = await axios.post(
            backendUrl + '/api/user/verifyRazorpay',
            response,
            { headers: { token } }
          );

          if (data.success) {
            toast.success("Payment successful");
            getUserAppointments();
            navigate('/my-appointments');
          } else {
            toast.error(data.message);
          }
        } catch (error) {
          console.log(error);
          toast.error("Payment verification failed");
        }
      },
      theme: { color: "#09403bff" }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const appointmentRazorpay = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/payment-razorpay',
        { appointmentId },
        { headers: { token } }
      );

      if (data.success) {
        initPay(data.order);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Payment initiation failed");
    }
  };

  /* ================= EFFECT ================= */
  useEffect(() => {
    if (token) getUserAppointments();
  }, [token]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="flex justify-center mt-20">
        <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="px-4 sm:px-6 py-10 min-h-[85vh]">
      <div className="max-w-4xl mx-auto">

        <h2 className="text-2xl font-black text-slate-800 tracking-tight pb-4 border-b border-slate-200">
          My Appointments
        </h2>

        {appointments.length === 0 && (
          <div className="glass-panel rounded-3xl p-12 shadow-md text-center mt-8 border border-slate-200 bg-white/70 backdrop-blur-md">
            <p className="text-slate-500 font-medium text-sm">
              No appointments scheduled yet.
            </p>
          </div>
        )}

        {appointments.map((item) => (
          <div
            key={item._id}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6 border border-slate-200/60 rounded-3xl bg-white hover:border-teal-500/20 shadow-md hover:shadow-lg transition-all duration-300 mt-6 relative overflow-hidden group"
          >
            {/* Left Accent strip */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
              item.completed ? 'bg-teal-600' :
              item.cancelled ? 'bg-rose-500' :
              item.payment ? 'bg-emerald-500' : 'bg-teal-600'
            }`} />

            {/* Doctor Image */}
            <img
              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl bg-teal-50 shrink-0 border border-slate-200 shadow-sm"
              src={item.docData?.image || '/doctor-placeholder.png'}
              alt="doctor"
            />

            {/* Info */}
            <div className="flex-1 min-w-0 text-xs text-slate-500 break-words leading-relaxed">
              <p className="text-slate-800 font-bold text-base hover:text-teal-700 transition duration-150">
                {item.docData?.name}
              </p>
              <p className="text-teal-600 font-semibold text-xs mt-0.5">
                {item.docData?.speciality}
              </p>
              <div className="mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/50 max-w-sm">
                <p className="text-slate-700 font-bold mb-0.5 text-[10px]">CLINIC ADDRESS:</p>
                <p className="text-[11px] text-slate-600">{item.docData?.address?.line1}</p>
                {item.docData?.address?.line2 && (
                  <p className="text-[11px] text-slate-600">{item.docData?.address?.line2}</p>
                )}
              </div>
              <p className="text-[11px] mt-3 font-semibold text-teal-800 bg-teal-50/50 w-fit px-3 py-1.5 rounded-full border border-teal-100/50">
                📅 {slotDateFormat(item.slotDate)} &nbsp;|&nbsp; ⏰ {item.slotTime}
              </p>
            </div>

            {/* Actions */}
            <div className="flex sm:flex-col gap-2 sm:min-w-[140px] sm:items-end sm:justify-center pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex-wrap">
              {!item.cancelled && item.payment && !item.completed && (
                <span className="px-4 py-2 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">
                  Paid
                </span>
              )}

              {!item.cancelled && !item.payment && !item.completed && (
                <button
                  onClick={() => appointmentRazorpay(item._id)}
                  className="px-4 py-2 text-xs font-bold text-teal-700 bg-white border border-teal-600 hover:bg-teal-600 hover:text-white rounded-full shadow-sm hover:shadow active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  Pay Online
                </button>
              )}

              {!item.cancelled && !item.completed && (
                <button
                  onClick={() => cancelAppointment(item._id)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-full shadow-sm active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
              )}

              {item.cancelled && (
                <span className="px-4 py-2 text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100 rounded-full">
                  Cancelled
                </span>
              )}

              {item.completed && (
                <span className="px-4 py-2 text-xs font-bold bg-teal-50 text-teal-700 border border-teal-100 rounded-full">
                  Completed
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Myappointment;
