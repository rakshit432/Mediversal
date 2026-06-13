import { useContext, useEffect } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/adminAssets';

const Dashboard = () => {

  const { atoken, dashData, cancelAppointment, getDashData } =
    useContext(AdminContext);

  const { slotDateFormat } = useContext(AppContext);
  const latestBookings =
  dashData.latestBookings || dashData.latestAppointments || [];


  useEffect(() => {
    if (atoken) {
      getDashData();
    }
  }, [atoken, getDashData]);

  return dashData && (
    <div className='m-5 w-full'>
      {/* Stats Cards */}
      <div className='flex flex-wrap gap-5 mb-5'>
        <div className='flex items-center gap-4 bg-white p-6 min-w-60 rounded-xl border border-slate-100 shadow-sm cursor-pointer hover:scale-102 transition duration-200'>
          <img className='w-14' src={assets.doctor_icon} alt="Doctors" />
          <div>
            <p className='text-2xl font-bold text-slate-800'>
              {dashData.doctors}
            </p>
            <p className='text-sm text-slate-500 font-medium'>Doctors</p>
          </div>
        </div>

        <div className='flex items-center gap-4 bg-white p-6 min-w-60 rounded-xl border border-slate-100 shadow-sm cursor-pointer hover:scale-102 transition duration-200'>
          <img className='w-14' src={assets.appointments_icon} alt="Appointments" />
          <div>
            <p className='text-2xl font-bold text-slate-800'>
              {dashData.appointments}
            </p>
            <p className='text-sm text-slate-500 font-medium'>Appointments</p>
          </div>
        </div>

        <div className='flex items-center gap-4 bg-white p-6 min-w-60 rounded-xl border border-slate-100 shadow-sm cursor-pointer hover:scale-102 transition duration-200'>
          <img className='w-14' src={assets.patients_icon} alt="Patients" />
          <div>
            <p className='text-2xl font-bold text-slate-800'>
              {dashData.patients}
            </p>
            <p className='text-sm text-slate-500 font-medium'>Patients</p>
          </div>
        </div>
      </div>

      {/* Latest Bookings */}
      <div className='bg-white border border-slate-100 rounded-xl shadow-sm max-h-[60vh] overflow-y-scroll scrollbar-hide w-full'>
        <div className='flex items-center gap-3 p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl'>
          <img src={assets.list_icon} alt="List" className='w-6 h-6' />
          <p className='font-bold text-slate-800 text-lg'>Latest Bookings</p>
        </div>

        <div className='pt-2 divide-y divide-slate-50'>
          {latestBookings?.length === 0 && (
            <p className='text-center text-gray-400 py-10 font-medium'>
              No recent bookings
            </p>
          )}

          {latestBookings?.map((item) => (
            <div
              key={item._id}
              className='flex items-center px-6 py-4 gap-4 hover:bg-slate-50/80 transition'
            >
              <img
                className='rounded-full w-11 h-11 object-cover border border-slate-100'
                src={item.docData?.image}
                alt={item.docData?.name}
              />

              <div className='flex-1 text-sm'>
                <p className='text-slate-800 font-semibold'>
                  {item.docData?.name}
                </p>
                <p className='text-slate-500 mt-0.5 text-xs font-medium'>
                  {slotDateFormat ? slotDateFormat(item.slotDate) : item.slotDate} • {item.slotTime}
                </p>
              </div>

              {item.cancelled ? (
                <span className='px-2.5 py-1 text-rose-600 bg-rose-50 text-xs font-semibold rounded-full'>
                  Cancelled
                </span>
              ) : item.completed ? (
                <span className='px-2.5 py-1 text-emerald-600 bg-emerald-50 text-xs font-semibold rounded-full'>
                  Completed
                </span>
              ) : (
                <img
                  onClick={() => cancelAppointment(item._id)}
                  className='w-8 h-8 cursor-pointer hover:scale-105 transition'
                  src={assets.cancel_icon}
                  alt="Cancel"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
