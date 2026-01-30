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

      const date = docSlots[selectedDayIndex].slots[selectedSlot].datetime;
      const time = docSlots[selectedDayIndex].slots[selectedSlot].time;

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
        const appointmentId = data.appointmentId;
        if (appointmentId) {
          getDoctorsData();
          navigate('/my-appointments');
        }
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
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto border-width-2px border-teal-600 rounded-lg p-6 bg-white">
          <div className="flex flex-col lg:flex-row gap-6">

            <div className="lg:w-1/3">
              <img
                className="w-full h-80 object-cover bg-teal-100 border-teal-200 rounded-lg"
                src={docInfo.image}
                alt={docInfo.name}
              />
            </div>

            <div className="lg:w-2/3 flex flex-col gap-4">

              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-800">{docInfo.name}</h1>
                <img src={assets.verified_icon} alt="verified" className="w-6 h-6" />
              </div>

              {/* Days */}
              <h3 className="text-lg font-bold text-gray-800 mb-4">Select Slot</h3>

              <div className="flex flex-wrap gap-2 mb-4">
                {docSlots.map((day, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedDayIndex(idx)}
                    className={`px-4 py-2 rounded-lg border ${selectedDayIndex === idx
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                      }`}
                  >
                    {daysOfWeek[day.date.getDay()]}, {months[day.date.getMonth()]} {day.date.getDate()}
                  </button>
                ))}
              </div>

              {/* Slots */}
              {selectedDayIndex !== null && (
                <div>
                  <h4 className="text-gray-800 font-semibold mb-2">Available Slots</h4>

                  <div className="flex items-center gap-3 w-full overflow-x-scroll scrollbar-hide mt-4 pb-2">
                    {docSlots[selectedDayIndex].slots
                      .filter(slot => !slot.isBooked)     // ← HIDE BOOKED SLOTS
                      .map((slot, idx) => (
                        <span
                          key={slot.datetime.toISOString()}
                          onClick={() => setSelectedSlot(idx)}
                          className="bg-teal-50 text-teal-800 px-2 py-1 rounded-2xl text-xs cursor-pointer"
                          style={{
                            border: selectedSlot === idx ? "2px solid #0F766E" : "none"
                          }}
                        >
                          {slot.time}
                        </span>
                      ))
                    }
                  </div>
                </div>
              )}

              <button
                onClick={bookAppointment}
                className="mt-6 px-6 py-3 cursor-pointer bg-teal-700 text-white rounded-lg font-semibold hover:bg-teal-800 transition"
              >
                Confirm Appointment
              </button>

              <RelatedDoctors docId={docId} speciality={docInfo.speciality} />

            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default Appointment;
