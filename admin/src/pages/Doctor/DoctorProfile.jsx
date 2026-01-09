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
      <div className='p-5'>
        <div className='bg-white p-6 rounded-lg shadow-md'>
          <div className='flex justify-center mb-6'>
            <img src={localProfileData.image} alt="Doctor Profile" className='w-32 h-32 rounded-full object-cover border-4 border-primary' />
          </div>

          <div className='text-center mb-6'>
            {/* -----Doc Info : name , degree , experience ----- */}
            <p className='text-2xl font-bold text-gray-800'>{localProfileData.name}</p>
            <p className='text-lg text-gray-600'>{localProfileData.degree} - {localProfileData.specialization}</p>
            <span className='inline-block mt-2 px-4 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full'>
              {localProfileData.experience} years of experience
            </span>
          </div>

          {/* -----Doc About ----- */}
          <div className='mb-6'>
            <p className='text-xl font-semibold text-gray-700 mb-2'>About</p>
            {isEdit ? (
              <textarea
                className='w-full p-2 border rounded'
                value={localProfileData.about}
                onChange={(e) => setLocalProfileData(prev => ({ ...prev, about: e.target.value }))}
              />
            ) : (
              <p className='text-gray-600 leading-relaxed'>{localProfileData.about}</p>
            )}
          </div>

          <p className='text-lg font-semibold text-gray-700 mb-4'>
            Appointment fee : <span className='text-primary'>{currency} {isEdit ? <input type="number" className='p-1 border rounded' onChange={(e) => setLocalProfileData(prev => ({ ...prev, fees: e.target.value }))} value={localProfileData.fees} /> : localProfileData.fees}</span>
          </p>
          <div className='mb-6'>
            <p className='text-lg font-semibold text-gray-700 mb-2'>Address:</p>
            <p className='text-gray-600'> {isEdit ? <input type="text" className='w-full p-1 border rounded' onChange={(e) => setLocalProfileData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))} value={localProfileData.address.line1} /> : localProfileData.address.line1}</p>
            <p className='text-gray-600'>{isEdit ? <input type='text' className='w-full p-1 border rounded' onChange={(e) => setLocalProfileData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))} value={localProfileData.address.line2} /> : localProfileData.address.line2}</p>

          </div>
          <div className='flex items-center mb-6'>
            <input
              type="checkbox"
              checked={localProfileData.available}
              onChange={() => isEdit && setLocalProfileData(prev => ({ ...prev, available: !prev.available }))}
              name="available"
              id="available"
              className='mr-2 h-4 w-4 text-primary rounded focus:ring-primary'
              disabled={!isEdit}
            />
            <label htmlFor="available" className='text-gray-700'>Available</label>
          </div>
          <div className='text-center'>
            {isEdit ?
              <button onClick={() => { updateProfile(localProfileData); setIsEdit(false); }} className='bg-primary text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-300'>Save Profile</button>
              :
              <button onClick={() => setIsEdit(true)} className='bg-primary text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-300'>Edit Profile</button>
            }
          </div>
        </div>
      </div>
    ) : (
      <div className="p-5 text-center text-gray-500">Loading profile...</div>
    )
  );
}

export default DoctorProfile;