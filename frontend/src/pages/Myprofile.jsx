import { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const Myprofile = () => {
  const {
    userData,
    setUserData,
    token,
    loadUserProfileData,
    backendUrl
  } = useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= IMAGE PREVIEW ================= */
  useEffect(() => {
    if (!image) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  /* ================= LOAD PROFILE (ONCE) ================= */
  useEffect(() => {
    if (!token || userData) return;

    setLoading(true);
    loadUserProfileData().finally(() => setLoading(false));
  }, [token, userData, loadUserProfileData]);

  /* ================= START EDIT ================= */
  const startEdit = () => {
    setFormData(JSON.parse(JSON.stringify(userData))); // deep copy
    setIsEdit(true);
  };

  /* ================= CANCEL EDIT ================= */
  const cancelEdit = () => {
    setIsEdit(false);
    setFormData(null);
    setImage(null);
  };

  /* ================= SAVE PROFILE ================= */
  const updateUserProfileData = async () => {
    try {
      if (!formData.name || !formData.phone) {
        toast.error("Name and phone are required");
        return;
      }

      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('phone', formData.phone);
      fd.append('gender', formData.gender || '');
      fd.append('dob', formData.dob || '');
      fd.append('address', JSON.stringify(formData.address || {}));
      if (image) fd.append('image', image);

      const { data } = await axios.post(
        backendUrl + '/api/user/update-profile',
        fd,
        { headers: { token } }
      );

      if (data.success) {
        setUserData(data.userData); // 🔥 SINGLE SOURCE OF TRUTH
        toast.success("Profile updated successfully");
        setIsEdit(false);
        setFormData(null);
        setImage(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  /* ================= AUTH GUARD ================= */
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold">Please login to view your profile</p>
      </div>
    );
  }

  /* ================= LOADING ================= */
  if (loading || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const data = isEdit ? formData : userData;

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">

        {/* PROFILE HEADER */}
        <div className="flex flex-col items-center border-b pb-6 mb-6">
          {isEdit ? (
            <label htmlFor="image" className="cursor-pointer relative">
              <img
                src={preview || data.image || assets.profile_pic}
                className="w-32 h-32 rounded-full object-cover opacity-80"
                alt="profile"
              />
              <img
                src={assets.upload_icon}
                className="w-8 absolute bottom-0 right-0"
                alt="upload"
              />
              <input
                id="image"
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </label>
          ) : (
            <img
              src={data.image || assets.profile_pic}
              className="w-32 h-32 rounded-full object-cover"
              alt="profile"
            />
          )}

          {isEdit ? (
            <input
              value={data.name}
              onChange={(e) => setFormData({ ...data, name: e.target.value })}
              className="text-2xl font-bold text-center border rounded p-1 mt-3"
            />
          ) : (
            <h1 className="text-3xl font-bold mt-3">{data.name}</h1>
          )}

          <p className="text-gray-500">{data.email}</p>
        </div>

        {/* CONTACT INFO */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-500">Phone</label>
            {isEdit ? (
              <input
                value={data.phone}
                onChange={(e) => setFormData({ ...data, phone: e.target.value })}
                className="w-full p-2 border rounded"
              />
            ) : (
              <p>{data.phone}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-500">Address</label>
            {isEdit ? (
              <>
                <input
                  value={data.address?.line1 || ''}
                  onChange={(e) =>
                    setFormData({
                      ...data,
                      address: { ...data.address, line1: e.target.value }
                    })
                  }
                  className="w-full p-2 border rounded mb-2"
                  placeholder="Line 1"
                />
                <input
                  value={data.address?.line2 || ''}
                  onChange={(e) =>
                    setFormData({
                      ...data,
                      address: { ...data.address, line2: e.target.value }
                    })
                  }
                  className="w-full p-2 border rounded"
                  placeholder="Line 2"
                />
              </>
            ) : (
              <p>{data.address?.line1}<br />{data.address?.line2}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-500">Gender</label>
            {isEdit ? (
              <select
                value={data.gender || ''}
                onChange={(e) => setFormData({ ...data, gender: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <p>{data.gender || 'N/A'}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-500">Date of Birth</label>
            {isEdit ? (
              <input
                type="date"
                value={data.dob || ''}
                onChange={(e) => setFormData({ ...data, dob: e.target.value })}
                className="w-full p-2 border rounded"
              />
            ) : (
              <p>{data.dob || 'N/A'}</p>
            )}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={isEdit ? updateUserProfileData : startEdit}
            className="bg-teal-700 text-white px-6 py-2 rounded hover:bg-teal-800"
          >
            {isEdit ? 'Save Profile' : 'Edit Profile'}
          </button>

          {isEdit && (
            <button
              onClick={cancelEdit}
              className="bg-gray-400 text-white px-6 py-2 rounded"
            >
              Cancel
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default Myprofile;
