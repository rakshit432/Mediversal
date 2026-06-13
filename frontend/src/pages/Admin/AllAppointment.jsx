import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/adminAssets';

const AllAppointment = () => {
  const { atoken, getAllAppointments, appointments, cancelAppointment } = useContext(AdminContext);
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | active | completed | cancelled

  useEffect(() => {
    if (atoken) getAllAppointments();
  }, [atoken]);

  const filtered = appointments.filter(item => {
    const matchSearch =
      item.userData?.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.docData?.name?.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === 'all' ||
      (filter === 'active' && !item.cancelled && !item.completed) ||
      (filter === 'completed' && item.completed) ||
      (filter === 'cancelled' && item.cancelled);

    return matchSearch && matchFilter;
  });

  const stats = {
    total: appointments.length,
    active: appointments.filter(a => !a.cancelled && !a.completed).length,
    completed: appointments.filter(a => a.completed).length,
    cancelled: appointments.filter(a => a.cancelled).length,
  };

  return (
    <div className="w-full">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">All Appointments</h1>
        <p className="text-sm text-slate-500 font-medium">View and manage client booking schedules</p>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'teal', onClick: () => setFilter('all') },
          { label: 'Active', value: stats.active, color: 'sky', onClick: () => setFilter('active') },
          { label: 'Completed', value: stats.completed, color: 'emerald', onClick: () => setFilter('completed') },
          { label: 'Cancelled', value: stats.cancelled, color: 'rose', onClick: () => setFilter('cancelled') },
        ].map(s => (
          <button
            key={s.label}
            onClick={s.onClick}
            className={`bg-white border rounded-2xl p-3 sm:p-4 text-left shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer
              ${filter === (s.label === 'Total' ? 'all' : s.label.toLowerCase()) ? 'border-' + s.color + '-400 ring-2 ring-' + s.color + '-100' : 'border-slate-200/60'}`}
          >
            <p className="text-2xl sm:text-3xl font-black text-slate-800">{s.value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{s.label}</p>
          </button>
        ))}
      </div>

      {/* SEARCH */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search patient or doctor..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm"
        />
      </div>

      {/* TABLE — Desktop */}
      <div className="hidden sm:block bg-white border border-slate-200/60 rounded-2xl shadow-sm text-xs overflow-hidden text-slate-700">
        {/* TABLE HEADER */}
        <div className="grid grid-cols-[0.4fr_2fr_0.8fr_2fr_2fr_0.8fr_1fr] py-4 px-6 border-b border-slate-200/60 bg-slate-50/50 font-bold text-slate-500 tracking-wider uppercase">
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">No appointments found</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((item, index) => (
              <div
                key={item._id}
                className="grid grid-cols-[0.4fr_2fr_0.8fr_2fr_2fr_0.8fr_1fr] py-4 px-6 text-slate-700 items-center hover:bg-slate-50/40 transition"
              >
                <p className="text-slate-400 font-bold">{index + 1}</p>

                <div className="flex items-center gap-2">
                  {item.userData?.image ? (
                    <img className="w-8 h-8 rounded-full object-cover border border-slate-200/60 bg-teal-50" src={item.userData.image} alt="patient" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200/60 flex items-center justify-center font-bold text-slate-400 text-sm">
                      {item.userData?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <p className="font-bold text-slate-800 truncate">{item.userData?.name || 'N/A'}</p>
                </div>

                <p className="font-semibold text-slate-650">
                  {item.userData?.dob ? `${calculateAge(item.userData.dob)} Yrs` : '—'}
                </p>

                <p className="font-semibold text-slate-600">
                  {slotDateFormat(item.slotDate)} • {item.slotTime}
                </p>

                <div className="flex items-center gap-2">
                  {item.docData?.image ? (
                    <img className="w-8 h-8 rounded-full object-cover border border-slate-200/60 bg-teal-50" src={item.docData.image} alt="doctor" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200/60 flex items-center justify-center font-bold text-slate-400 text-sm">
                      {item.docData?.name?.charAt(0) || 'D'}
                    </div>
                  )}
                  <p className="font-semibold text-slate-700 truncate">{item.docData?.name || 'N/A'}</p>
                </div>

                <p className="font-black text-slate-800">{currency}{item.amount}</p>

                <div>
                  {item.cancelled ? (
                    <span className="px-2.5 py-1 text-rose-600 bg-rose-50 text-[10px] font-bold rounded-full border border-rose-100/50">Cancelled</span>
                  ) : item.completed ? (
                    <span className="px-2.5 py-1 text-emerald-600 bg-emerald-50 text-[10px] font-bold rounded-full border border-emerald-100/50">Completed</span>
                  ) : (
                    <button
                      onClick={() => cancelAppointment(item._id)}
                      className="p-1.5 hover:bg-rose-50 border border-slate-200 hover:border-rose-200/60 rounded-xl transition cursor-pointer group/btn"
                      title="Cancel appointment"
                    >
                      <img className="w-4 h-4 opacity-60 group-hover/btn:opacity-100 transition" src={assets.cancel_icon} alt="Cancel" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CARDS — Mobile */}
      <div className="sm:hidden space-y-3">
        {filtered.length === 0 && (
          <div className="text-center text-slate-400 py-10 font-medium text-sm">No appointments found</div>
        )}
        {filtered.map((item) => (
          <div key={item._id} className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              {/* Patient + Doctor */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-full bg-teal-50 border border-slate-200 flex items-center justify-center font-bold text-teal-700 text-xs shrink-0">
                    {item.userData?.name?.charAt(0) || 'U'}
                  </div>
                  <p className="font-bold text-slate-800 text-sm truncate">{item.userData?.name || 'N/A'}</p>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  👨‍⚕️ {item.docData?.name || 'N/A'} — <span className="text-teal-600">{item.docData?.speciality}</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  📅 {slotDateFormat(item.slotDate)} • ⏰ {item.slotTime}
                </p>
                <p className="text-xs font-black text-slate-800 mt-1">{currency}{item.amount}</p>
              </div>

              {/* Status / Action */}
              <div className="shrink-0 flex flex-col items-end gap-2">
                {item.cancelled ? (
                  <span className="px-2.5 py-1 text-rose-600 bg-rose-50 text-[10px] font-bold rounded-full border border-rose-100/50">Cancelled</span>
                ) : item.completed ? (
                  <span className="px-2.5 py-1 text-emerald-600 bg-emerald-50 text-[10px] font-bold rounded-full border border-emerald-100/50">Completed</span>
                ) : (
                  <>
                    <span className="px-2.5 py-1 text-sky-600 bg-sky-50 text-[10px] font-bold rounded-full border border-sky-100/50">Active</span>
                    <button
                      onClick={() => cancelAppointment(item._id)}
                      className="text-[10px] font-bold text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllAppointment;
