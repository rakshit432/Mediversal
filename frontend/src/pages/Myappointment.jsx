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

  const getUserAppointments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } });
      if (data.success) setAppointments(data.appointments || []);
      else toast.error(data.message);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/user/cancel-appointment',
        { appointmentId }, { headers: { token } });
      if (data.success) { toast.success(data.message); getUserAppointments(); getDoctorsData(); }
      else toast.error(data.message);
    } catch { toast.error('Unable to cancel appointment'); }
  };

  const initPay = (order) => {
    if (!window.Razorpay) { toast.error('Payment service not loaded'); return; }
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY,
      amount: order.amount,
      currency: order.currency,
      name: 'Appointment Payment',
      description: 'Doctor Appointment',
      order_id: order.id,
      handler: async (response) => {
        try {
          const { data } = await axios.post(backendUrl + '/api/user/verifyRazorpay', response, { headers: { token } });
          if (data.success) { toast.success('Payment successful! 💚'); getUserAppointments(); navigate('/my-appointments'); }
          else toast.error(data.message);
        } catch { toast.error('Payment verification failed'); }
      },
      theme: { color: '#0d9488' }
    };
    new window.Razorpay(options).open();
  };

  const appointmentRazorpay = async (appointmentId) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/user/payment-razorpay',
        { appointmentId }, { headers: { token } });
      if (data.success) initPay(data.order);
      else toast.error(data.message);
    } catch { toast.error('Payment initiation failed'); }
  };

  useEffect(() => { if (token) getUserAppointments(); }, [token]);

  const getStatusConfig = (item) => {
    if (item.completed) return { label: '✓ Completed', cls: 'bg-teal-50 text-teal-700 border-teal-100', strip: 'from-teal-500 to-cyan-500' };
    if (item.cancelled) return { label: '✗ Cancelled', cls: 'bg-rose-50 text-rose-600 border-rose-100', strip: 'from-rose-400 to-rose-500' };
    if (item.payment)   return { label: '💳 Paid',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-100', strip: 'from-emerald-400 to-teal-500' };
    return                     { label: '⏳ Pending',  cls: 'bg-amber-50 text-amber-700 border-amber-100', strip: 'from-amber-400 to-orange-400' };
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="wellness-loader" />
    </div>
  );

  return (
    <div className="min-h-screen px-4 sm:px-6 py-10 page-enter">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="section-label mb-3">📅 Appointments</div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">My Appointments</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Empty state */}
        {appointments.length === 0 && (
          <div className="wellness-card p-16 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h2 className="text-xl font-black text-slate-700 mb-2">No Appointments Yet</h2>
            <p className="text-slate-400 text-sm mb-6">Book your first consultation with a trusted specialist today.</p>
            <button onClick={() => navigate('/doctors')} className="btn-primary text-xs">
              FIND A DOCTOR →
            </button>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {appointments.map((item) => {
            const { label, cls, strip } = getStatusConfig(item);
            return (
              <div
                key={item._id}
                className="wellness-card p-5 sm:p-6 flex flex-col sm:flex-row gap-5 relative overflow-hidden group"
              >
                {/* Status strip */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${strip} rounded-l-2xl`} />

                {/* Doctor image */}
                <div className="shrink-0 pl-3">
                  <img
                    src={item.docData?.image || '/doctor-placeholder.png'}
                    alt="doctor"
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl border-2 border-teal-100/60 shadow-sm"
                  />
                </div>

                {/* Doctor info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-slate-800 font-black text-base hover:text-teal-700 transition cursor-pointer"
                         onClick={() => navigate(`/appointment/${item.docData?._id}`)}>
                        {item.docData?.name}
                      </p>
                      <p className="text-teal-600 font-semibold text-xs mt-0.5">{item.docData?.speciality}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border ${cls}`}>
                      {label}
                    </span>
                  </div>

                  <div className="mt-3 bg-slate-50/80 rounded-xl p-3 border border-slate-100 max-w-sm">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Clinic Address</p>
                    <p className="text-xs text-slate-600 font-medium">{item.docData?.address?.line1}</p>
                    {item.docData?.address?.line2 && (
                      <p className="text-xs text-slate-600 font-medium">{item.docData.address.line2}</p>
                    )}
                  </div>

                  <div className="inline-flex items-center gap-1.5 mt-3 bg-teal-50/80 border border-teal-100 px-3 py-2 rounded-full">
                    <span className="text-xs">📅</span>
                    <p className="text-xs font-bold text-teal-700">
                      {slotDateFormat(item.slotDate)} · {item.slotTime}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col gap-2 sm:min-w-[130px] sm:justify-center items-center sm:items-end
                                pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex-wrap">
                  {!item.cancelled && !item.payment && !item.completed && (
                    <button
                      onClick={() => appointmentRazorpay(item._id)}
                      className="btn-outline text-[10px] py-2 px-4"
                    >
                      PAY ONLINE
                    </button>
                  )}
                  {!item.cancelled && !item.completed && (
                    <button
                      onClick={() => cancelAppointment(item._id)}
                      className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200
                                 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200
                                 rounded-full px-4 py-2 active:scale-95 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Myappointment;
