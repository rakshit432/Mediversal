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
    <div className='w-full max-w-6xl mx-auto'>
      
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Dashboard Overview
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Key performance indicators and recent bookings
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 max-w-4xl'>
        
        {/* Doctors Card */}
        <div className='flex items-center gap-4 bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer'>
          <div className='bg-teal-50/60 p-3.5 rounded-xl border border-teal-100/50 group-hover:bg-teal-600 group-hover:border-teal-500 transition-all duration-300'>
            <img className='w-8 h-8 object-contain group-hover:brightness-0 group-hover:invert transition duration-300' src={assets.doctor_icon} alt="Doctors" />
          </div>
          <div>
            <p className='text-3xl font-black text-slate-800 tracking-tight'>
              {dashData.doctors}
            </p>
            <p className='text-xs text-slate-500 font-bold tracking-wider uppercase mt-1'>Doctors</p>
          </div>
        </div>

        {/* Appointments Card */}
        <div className='flex items-center gap-4 bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer'>
          <div className='bg-cyan-50/60 p-3.5 rounded-xl border border-cyan-100/50 group-hover:bg-cyan-600 group-hover:border-cyan-500 transition-all duration-300'>
            <img className='w-8 h-8 object-contain group-hover:brightness-0 group-hover:invert transition duration-300' src={assets.appointments_icon} alt="Appointments" />
          </div>
          <div>
            <p className='text-3xl font-black text-slate-800 tracking-tight'>
              {dashData.appointments}
            </p>
            <p className='text-xs text-slate-500 font-bold tracking-wider uppercase mt-1'>Appointments</p>
          </div>
        </div>

        {/* Patients Card */}
        <div className='flex items-center gap-4 bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer'>
          <div className='bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-100/50 group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-all duration-300'>
            <img className='w-8 h-8 object-contain group-hover:brightness-0 group-hover:invert transition duration-300' src={assets.patients_icon} alt="Patients" />
          </div>
          <div>
            <p className='text-3xl font-black text-slate-800 tracking-tight'>
              {dashData.patients}
            </p>
            <p className='text-xs text-slate-500 font-bold tracking-wider uppercase mt-1'>Patients</p>
          </div>
        </div>
      </div>

      {/* Latest Bookings */}
      <div className='bg-white border border-slate-200/60 rounded-2xl shadow-sm w-full max-w-4xl overflow-hidden'>
        <div className='flex items-center gap-3 p-4 border-b border-slate-200/60 bg-slate-50/50'>
          <img src={assets.list_icon} alt="List" className='w-5 h-5 opacity-70' />
          <p className='font-bold text-slate-850 text-xs tracking-wider uppercase'>Latest Bookings</p>
        </div>

        <div className='divide-y divide-slate-100 max-h-[50vh] overflow-y-auto scrollbar-hide'>
          {latestBookings?.length === 0 && (
            <p className='text-center text-slate-400 py-10 font-medium text-xs'>
              No recent bookings
            </p>
          )}

          {latestBookings?.map((item) => (
            <div
              key={item._id}
              className='flex items-center px-6 py-4 gap-4 hover:bg-slate-50/40 transition'
            >
              <img
                className='rounded-full w-10 h-10 object-cover border border-slate-200/60 shadow-sm bg-teal-50'
                src={item.docData?.image || '/doctor-placeholder.png'}
                alt={item.docData?.name}
              />

              <div className='flex-1 text-xs text-slate-500 leading-normal'>
                <p className='text-slate-850 font-bold text-sm'>
                  {item.docData?.name}
                </p>
                <p className='text-teal-600 font-semibold mt-0.5'>
                  {slotDateFormat ? slotDateFormat(item.slotDate) : item.slotDate} • {item.slotTime}
                </p>
              </div>

              {item.cancelled ? (
                <span className='px-2.5 py-1 text-rose-600 bg-rose-50 text-[10px] font-bold rounded-full border border-rose-100/50'>
                  Cancelled
                </span>
              ) : item.completed ? (
                <span className='px-2.5 py-1 text-emerald-600 bg-emerald-50 text-[10px] font-bold rounded-full border border-emerald-100/50'>
                  Completed
                </span>
              ) : (
                <button
                  onClick={() => cancelAppointment(item._id)}
                  className='p-1.5 hover:bg-rose-50 border border-slate-200 hover:border-rose-200/60 rounded-xl transition cursor-pointer group/btn'
                  title="Cancel Booking"
                >
                  <img
                    className='w-4 h-4 opacity-60 group-hover/btn:opacity-100 transition'
                    src={assets.cancel_icon}
                    alt="Cancel"
                  />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
