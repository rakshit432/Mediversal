import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Myappointment = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext);

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
      theme: { color: "#0F766E" }
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

  /* ================= HELPERS ================= */
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="flex justify-center mt-20">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="px-4">
      <div className="max-w-5xl mx-auto">

        <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">
          My Appointments
        </p>

        {appointments.length === 0 && (
          <p className="text-center mt-10 text-zinc-500">
            No appointments found
          </p>
        )}

        {appointments.map((item) => (
          <div
            key={item._id}
            className="flex flex-col sm:flex-row gap-6 py-5 px-4 sm:px-6 border rounded-lg bg-white shadow-sm mt-4"
          >
            {/* Doctor Image */}
            <img
              className="w-28 h-28 object-cover rounded-lg bg-teal-50 shrink-0"
              src={item.docData?.image || '/doctor-placeholder.png'}
              alt="doctor"
            />

            {/* Info */}
            <div className="flex-1 min-w-0 text-sm text-zinc-600 break-words whitespace-normal">
              <p className="text-neutral-800 font-semibold text-base">
                {item.docData?.name}
              </p>

              <p className="text-zinc-500">
                {item.docData?.speciality}
              </p>

              <p className="text-zinc-700 font-medium mt-2">
                Address:
              </p>
              <p className="text-xs">
                {item.docData?.address?.line1}
              </p>
              <p className="text-xs">
                {item.docData?.address?.line2}
              </p>

              <p className="text-xs mt-2">
                <span className="font-medium text-neutral-700">
                  Date & Time:
                </span>{" "}
                {formatDate(item.slotDate)} | {item.slotTime}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 sm:min-w-[160px] sm:items-end sm:justify-center">
              {!item.cancelled && item.payment && !item.completed && (
                <span className="px-4 py-2 text-sm border rounded bg-teal-50 text-teal-700 text-center">
                  Paid
                </span>
              )}

              {!item.cancelled && !item.payment && !item.completed && (
                <button
                  onClick={() => appointmentRazorpay(item._id)}
                  className="px-4 py-2 text-sm border rounded hover:bg-teal-600 hover:text-white transition"
                >
                  Pay Online
                </button>
              )}

              {!item.cancelled && !item.completed && (
                <button
                  onClick={() => cancelAppointment(item._id)}
                  className="px-4 py-2 text-sm border rounded hover:bg-red-600 hover:text-white transition"
                >
                  Cancel
                </button>
              )}

              {item.cancelled && (
                <span className="px-4 py-2 text-sm border border-red-500 rounded text-red-500 text-center">
                  Cancelled
                </span>
              )}

              {item.completed && (
                <span className="px-4 py-2 text-sm border border-green-500 rounded text-green-500 text-center">
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
