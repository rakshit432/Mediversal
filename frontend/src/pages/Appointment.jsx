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

  const { doctors, backendUrl, token, getDoctorsData } =
    useContext(AppContext);

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const fetchDocInfo = () => {
    const foundDoc = doctors.find((doc) => doc._id === docId);
    setDocInfo(foundDoc || null);
  };

  const getAvailableSlots = () => {
    if (!docInfo) return;

    const bookedSlots = docInfo.slots_booked || {};  // ← BOOKED SLOTS OBJECT

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
        startTime.setMinutes(
          today.getHours() >= 10 && today.getMinutes() > 30 ? 30 : 0
        );
      } else {
        startTime.setHours(10, 0, 0, 0);
      }

      let daySlots = [];
      let tempTime = new Date(startTime);

      while (tempTime < endTime) {

        const timeStr = tempTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        const slotDate = `${currDate.getDate()}_${currDate.getMonth() + 1}_${currDate.getFullYear()}`;
        const slotsForDate = bookedSlots[slotDate] || [];
        const isBooked = slotsForDate.includes(timeStr);

        daySlots.push({
          datetime: new Date(tempTime),
          time: timeStr,
          isBooked: isBooked  // ← MARK BOOKED
        });

        tempTime.setMinutes(tempTime.getMinutes() + 30);
      }

      slotsForWeek.push({
        date: currDate,
        slots: daySlots,
      });
    }

    setDocSlots(slotsForWeek);
  };

  useEffect(() => {
    fetchDocInfo();
  }, [docId, doctors]);

  useEffect(() => {
    if (docInfo) getAvailableSlots();
  }, [docInfo]);


  const bookAppointment = async () => {
    if (!token) {
      toast.error("Please login to book appointment");
      return navigate('/login');
    }

    try {
      if (selectedDayIndex === null || selectedSlot === null) {
        toast.error("Please select a day and slot");
        return;
      }

      // Find slot in the original day array matching the selected slot time
      const selectedSlotObj = docSlots[selectedDayIndex].slots.find(
        (slot) => slot.time === selectedSlot
      );

      if (!selectedSlotObj) {
        toast.error("Selected slot is no longer available");
        return;
      }

      const date = selectedSlotObj.datetime;
      const time = selectedSlotObj.time;

      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();

      const slotDate = `${day}_${month}_${year}`;
      const slotTime = time;

      const { data } = await axios.post(
        backendUrl + '/api/user/book-appointment',
        { docId, slotDate, slotTime },
        { headers: { token } }
      );

      if (data.success) {
        toast.success("Appointment booked successfully");
        getDoctorsData();
        navigate('/my-appointments');
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error("Failed to book appointment. Please try again.");
    }
  };

  return (
    docInfo && (
      <div className="min-h-screen py-12 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Profile Image Column */}
            <div className="lg:w-1/3">
              <img
                className="w-full h-80 object-cover bg-gradient-to-tr from-teal-50 to-teal-100 border border-slate-100 rounded-2xl shadow-sm"
                src={docInfo.image}
                alt={docInfo.name}
              />
            </div>

            {/* Details and Slots Column */}
            <div className="lg:w-2/3 flex flex-col gap-6">

              {/* Title & Verified Info */}
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">{docInfo.name}</h1>
                <img src={assets.verified_icon} alt="verified" className="w-5 h-5" />
              </div>

              {/* Experience and Degree Badges */}
              <div className="flex flex-wrap gap-2 items-center text-xs">
                <span className="bg-teal-50 text-teal-700 font-bold px-3 py-1 rounded-full border border-teal-100">
                  {docInfo.degree} - {docInfo.speciality}
                </span>
                <span className="bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full">
                  {docInfo.experience} Years Exp
                </span>
                <span className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-100">
                  Fee: ${docInfo.fees}
                </span>
              </div>

              {/* About biography */}
              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-sm font-bold text-slate-800">About Doctor</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {docInfo.about || "Dedicated healthcare professional committed to delivering excellent patient care and guidance."}
                </p>
              </div>

              {/* Date / Day Selection */}
              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Select Date</h3>
                <div className="flex flex-wrap gap-2">
                  {docSlots.map((day, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedDayIndex(idx);
                        setSelectedSlot(null); // Reset selected slot time on day change
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-300 transform active:scale-95 cursor-pointer ${
                        selectedDayIndex === idx
                          ? 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/20'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-teal-50/50 hover:border-teal-500/20'
                      }`}
                    >
                      {daysOfWeek[day.date.getDay()]}, {months[day.date.getMonth()]} {day.date.getDate()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots Selection */}
              {selectedDayIndex !== null && (
                <div className="border-t border-slate-100 pt-4">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Available Slots</h3>
                  <div className="flex flex-wrap gap-2">
                    {docSlots[selectedDayIndex].slots
                      .filter((slot) => !slot.isBooked)
                      .map((slot) => (
                        <button
                          key={slot.datetime.toISOString()}
                          onClick={() => setSelectedSlot(slot.time)}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border transition-all duration-200 ${
                            selectedSlot === slot.time
                              ? 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/20 scale-105'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-teal-50/50 hover:border-teal-500/20'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                  </div>
                  {docSlots[selectedDayIndex].slots.filter((slot) => !slot.isBooked).length === 0 && (
                    <p className="text-xs text-rose-500 font-semibold mt-1">No slots available for this day.</p>
                  )}
                </div>
              )}

              {/* Booking Action */}
              <button
                onClick={bookAppointment}
                className="mt-4 px-8 py-3.5 bg-teal-600 hover:bg-teal-700 active:scale-95 hover:scale-[1.02] text-white text-xs font-bold tracking-wider rounded-full shadow-lg shadow-teal-600/10 hover:shadow-xl hover:shadow-teal-600/25 transition-all duration-200 w-full md:w-fit cursor-pointer"
              >
                CONFIRM APPOINTMENT
              </button>

            </div>
          </div>
        </div>

        {/* Related Doctors */}
        <div className="max-w-5xl mx-auto mt-12">
          <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
        </div>
      </div>
    )
  );
};

export default Appointment;
