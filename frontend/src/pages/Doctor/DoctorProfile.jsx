import React, { useContext, useEffect, useState } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';

const DoctorProfile = () => {

  const { dToken, profileData, getProfile, updateProfile } = useContext(DoctorContext);
  const { currency } = useContext(AppContext);
  const [isEdit, setIsEdit] = useState(false);
  const [localProfileData, setLocalProfileData] = useState(null);

  useEffect(() => {
    if (dToken) {
      getProfile();
    }
  }, [dToken, getProfile]);

  useEffect(() => {
    if (profileData) {
      setLocalProfileData(profileData);
    }
  }, [profileData]);
 
  return (
    localProfileData ? (
      <div className='p-5 w-full max-w-3xl'>
        <div className='bg-white p-8 border border-slate-100 rounded-xl shadow-sm text-slate-700'>
          <div className='flex flex-col items-center mb-6'>
            <img 
              src={localProfileData.image} 
              alt="Doctor Profile" 
              className='w-32 h-32 rounded-full object-cover border-4 border-teal-50 shadow-md mb-4' 
            />
            <p className='text-2xl font-bold text-slate-800'>{localProfileData.name}</p>
            <p className='text-sm font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full mt-1.5'>
              {localProfileData.degree} — {localProfileData.speciality}
            </p>
            <span className='inline-block mt-3 px-4 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full'>
              {localProfileData.experience} Years Experience
            </span>
          </div>

          {/* -----Doc About ----- */}
          <div className='mb-6 border-t border-slate-50 pt-6'>
            <p className='text-base font-bold text-slate-800 mb-2'>Biography / About</p>
            {isEdit ? (
              <textarea
                rows="4"
                className='w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none leading-normal'
                value={localProfileData.about}
                onChange={(e) => setLocalProfileData(prev => ({ ...prev, about: e.target.value }))}
              />
            ) : (
              <p className='text-sm text-slate-600 leading-relaxed'>{localProfileData.about}</p>
            )}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-50 pt-6 mb-6'>
            <div>
              <p className='text-sm font-bold text-slate-800 mb-2'>Appointment Fee</p>
              <div className='text-sm font-semibold text-slate-700 flex items-center gap-1.5'>
                <span>{currency}</span>
                {isEdit ? (
                  <input 
                    type="number" 
                    className='p-1 border border-slate-200 rounded-md text-sm w-24 focus:outline-none focus:ring-2 focus:ring-teal-500' 
                    onChange={(e) => setLocalProfileData(prev => ({ ...prev, fees: Number(e.target.value) }))} 
                    value={localProfileData.fees} 
                  />
                ) : (
                  <span>{localProfileData.fees}</span>
                )}
              </div>
            </div>

            <div>
              <p className='text-sm font-bold text-slate-800 mb-2'>Clinic Address</p>
              {isEdit ? (
                <div className="space-y-2">
                  <input 
                    type="text" 
                    className='w-full p-1.5 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-teal-500' 
                    onChange={(e) => setLocalProfileData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))} 
                    value={localProfileData.address.line1} 
                  />
                  <input 
                    type='text' 
                    className='w-full p-1.5 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-teal-500' 
                    onChange={(e) => setLocalProfileData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))} 
                    value={localProfileData.address.line2} 
                  />
                </div>
              ) : (
                <div className="text-sm text-slate-600">
                  <p>{localProfileData.address.line1}</p>
                  <p className="mt-0.5">{localProfileData.address.line2}</p>
                </div>
              )}
            </div>
          </div>

          <div className='flex items-center mb-8 border-t border-slate-50 pt-6'>
            <input
              type="checkbox"
              checked={localProfileData.available}
              onChange={() => isEdit && setLocalProfileData(prev => ({ ...prev, available: !prev.available }))}
              name="available"
              id="available"
              className='mr-2 h-4 w-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500 disabled:cursor-not-allowed cursor-pointer'
              disabled={!isEdit}
            />
            <label htmlFor="available" className='text-sm font-semibold text-slate-700 cursor-pointer select-none'>
              Active & Available for Consultations
            </label>
          </div>

          <div className='text-center border-t border-slate-50 pt-6'>
            {isEdit ? (
              <button 
                onClick={() => { updateProfile(localProfileData); setIsEdit(false); }} 
                className='bg-teal-600 text-white font-semibold px-8 py-2.5 rounded-lg shadow-sm hover:bg-teal-700 transition cursor-pointer'
              >
                Save Profile
              </button>
            ) : (
              <button 
                onClick={() => setIsEdit(true)} 
                className='bg-teal-600 text-white font-semibold px-8 py-2.5 rounded-lg shadow-sm hover:bg-teal-700 transition cursor-pointer'
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    ) : (
      <div className="p-5 text-center text-slate-400 font-semibold">Loading profile...</div>
    )
  );
}

export default DoctorProfile;
