import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import { RelatedDoctors } from '../components/RelatedDoctors';
import { toast } from 'react-toastify';
import axios from 'axios';

const Appointment = () => {
  const { docId } = useParams();
  const navigate = useNavigate();
  const { doctors, backendUrl, token, getDoctorsData } = useContext(AppContext);

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const fetchDocInfo = () => {
    const foundDoc = doctors.find((doc) => doc._id === docId);
    setDocInfo(foundDoc || null);
  };

  const getAvailableSlots = () => {
    if (!docInfo) return;
    const bookedSlots = docInfo.slots_booked || {};
    let slotsForWeek = [];
    let today = new Date();
    for (let i = 0; i < 7; i++) {
      let currDate = new Date(today);
      currDate.setDate(today.getDate() + i);
      let startTime = new Date(currDate);
      let endTime = new Date(currDate);
      endTime.setHours(21, 0, 0, 0);
      if (i === 0) {
        if (today.getHours() >= 21) continue;
        let nextHour = today.getHours() >= 10 ? today.getHours() + 1 : 10;
        startTime.setHours(nextHour);
        startTime.setMinutes(today.getHours() >= 10 && today.getMinutes() > 30 ? 30 : 0);
      } else {
        startTime.setHours(10, 0, 0, 0);
      }
      let daySlots = [];
      let tempTime = new Date(startTime);
      while (tempTime < endTime) {
        const timeStr = tempTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const slotDate = `${currDate.getDate()}_${currDate.getMonth() + 1}_${currDate.getFullYear()}`;
        const slotsForDate = bookedSlots[slotDate] || [];
        daySlots.push({ datetime: new Date(tempTime), time: timeStr, isBooked: slotsForDate.includes(timeStr) });
        tempTime.setMinutes(tempTime.getMinutes() + 30);
      }
      slotsForWeek.push({ date: currDate, slots: daySlots });
    }
    setDocSlots(slotsForWeek);
  };

  useEffect(() => { fetchDocInfo(); }, [docId, doctors]);
  useEffect(() => { if (docInfo) getAvailableSlots(); }, [docInfo]);

  const bookAppointment = async () => {
    if (!token) { toast.error('Please login to book appointment'); return navigate('/login'); }
    try {
      if (selectedDayIndex === null || selectedSlot === null) { toast.error('Please select a date and time slot'); return; }
      const selectedSlotObj = docSlots[selectedDayIndex].slots.find((slot) => slot.time === selectedSlot);
      if (!selectedSlotObj) { toast.error('Selected slot is no longer available'); return; }
      const date = selectedSlotObj.datetime;
      const slotDate = `${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}`;
      const { data } = await axios.post(backendUrl + '/api/user/book-appointment',
        { docId, slotDate, slotTime: selectedSlot }, { headers: { token } });
      if (data.success) {
        toast.success('Appointment booked! 🎉');
        getDoctorsData();
        navigate('/my-appointments');
      } else toast.error(data.message);
    } catch (error) {
      toast.error('Failed to book appointment. Please try again.');
    }
  };

  if (!docInfo) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="wellness-loader" />
    </div>
  );

  const availableSlotCount = selectedDayIndex !== null
    ? docSlots[selectedDayIndex]?.slots.filter((s) => !s.isBooked).length
    : null;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 page-enter">
      <div className="max-w-5xl mx-auto">

        {/* Main card */}
        <div className="wellness-card p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Doctor Image */}
            <div className="lg:w-[280px] shrink-0">
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-teal-50 to-cyan-50
                              border border-teal-100/60 shadow-md">
                <img
                  src={docInfo.image}
                  alt={docInfo.name}
                  className="w-full h-80 object-cover hover:scale-[1.03] transition-transform duration-500"
                />
                {/* Availability overlay */}
                <div className={`absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md
                                 border text-xs font-bold ${
                                   docInfo.available
                                     ? 'bg-emerald-50/90 text-emerald-700 border-emerald-200'
                                     : 'bg-slate-100/90 text-slate-500 border-slate-200'
                                 }`}>
                  {docInfo.available ? (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-slate-300" />
                  )}
                  {docInfo.available ? 'Available Today' : 'Currently Busy'}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 flex flex-col gap-5">

              {/* Name + verified */}
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <h1 className="text-3xl font-black text-slate-800 tracking-tight">{docInfo.name}</h1>
                  <img src={assets.verified_icon} alt="verified" className="w-5 h-5" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="specialty-chip">{docInfo.speciality}</span>
                  <span className="specialty-chip bg-slate-50 text-slate-600 border-slate-200">
                    {docInfo.degree}
                  </span>
                  <span className="specialty-chip bg-emerald-50 text-emerald-700 border-emerald-200">
                    {docInfo.experience} yrs exp
                  </span>
                  <span className="specialty-chip bg-amber-50 text-amber-700 border-amber-200">
                    ${docInfo.fees} fee
                  </span>
                </div>
              </div>

              {/* About */}
              <div className="bg-gradient-to-br from-slate-50 to-teal-50/30 rounded-2xl p-5 border border-slate-100">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">About Doctor</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {docInfo.about || 'Dedicated healthcare professional committed to delivering exceptional patient care, evidence-based treatment, and compassionate guidance.'}
                </p>
              </div>

              {/* Date selection */}
              <div>
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Select Date</h3>
                <div className="flex flex-wrap gap-2">
                  {docSlots.map((day, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setSelectedDayIndex(idx); setSelectedSlot(null); }}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer ${
                        selectedDayIndex === idx
                          ? 'grad-primary text-white border-transparent shadow-md scale-105'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700'
                      }`}
                    >
                      {daysOfWeek[day.date.getDay()]}, {months[day.date.getMonth()]} {day.date.getDate()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time slots */}
              {selectedDayIndex !== null && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Available Slots</h3>
                    {availableSlotCount !== null && (
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {availableSlotCount} slot{availableSlotCount !== 1 ? 's' : ''} available
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {docSlots[selectedDayIndex].slots
                      .filter((slot) => !slot.isBooked)
                      .map((slot) => (
                        <button
                          key={slot.datetime.toISOString()}
                          onClick={() => setSelectedSlot(slot.time)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer border transition-all duration-200 ${
                            selectedSlot === slot.time
                              ? 'grad-primary text-white border-transparent shadow-md scale-105'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    {availableSlotCount === 0 && (
                      <p className="text-xs text-rose-500 font-semibold">
                        No slots available for this day. Please try another date.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Book button */}
              <button
                onClick={bookAppointment}
                className={`btn-primary text-[11px] mt-2 ${(!selectedSlot || !selectedDayIndex === null) ? 'opacity-80' : ''}`}
              >
                CONFIRM APPOINTMENT
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Related doctors */}
        <div className="mt-12">
          <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
        </div>
      </div>
    </div>
  );
};

export default Appointment;
