import { useContext, useEffect } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';

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
    <div className='m-5'>
      {/* Stats Cards */}
      <div className='flex flex-wrap gap-5 mb-5'>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105'>
          <img className='w-14' src={assets.doctor_icon} alt="Doctors" />
          <div>
            <p className='text-xl font-semibold text-gray-500'>
              {dashData.doctors}
            </p>
            <p>Doctors</p>
          </div>
        </div>

        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105'>
          <img className='w-14' src={assets.appointments_icon} alt="Appointments" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>
              {dashData.appointments}
            </p>
            <p className='text-gray-400'>Appointments</p>
          </div>
        </div>

        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105'>
          <img className='w-14' src={assets.patients_icon} alt="Patients" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>
              {dashData.patients}
            </p>
            <p className='text-gray-400'>Patients</p>
          </div>
        </div>
      </div>

      {/* Latest Bookings */}
      <div className='bg-white border rounded max-h-[60vh] overflow-y-scroll'>
        <div className='flex items-center gap-3 p-4 border-b'>
          <img src={assets.list_icon} alt="List" className='w-6 h-6' />
          <p className='font-semibold text-lg'>Latest Bookings</p>
        </div>

        <div className='pt-4'>
          {latestBookings?.length === 0 && (
            <p className='text-center text-gray-400 py-6'>
              No recent bookings
            </p>
          )}

          {latestBookings?.map((item) => (
            <div
              key={item._id}
              className='flex items-center px-6 py-3 gap-3 hover:bg-gray-100'
            >
              <img
                className='rounded-full w-10 h-10 object-cover'
                src={item.docData?.image}
                alt={item.docData?.name}
              />

              <div className='flex-1 text-sm'>
                <p className='text-gray-800 font-medium'>
                  {item.docData?.name}
                </p>
                <p className='text-gray-600'>
                  {slotDateFormat(item.slotDate)} {item.slotTime}
                </p>
              </div>

              {item.cancelled ? (
                <p className='text-red-400 text-xs font-medium'>
                  Cancelled
                </p>
              ) : item.completed ? (
                <p className='text-green-500 text-xs font-medium'>
                  Completed
                </p>
              ) : (
                <img
                  onClick={() => cancelAppointment(item._id)}
                  className='w-10 cursor-pointer'
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
