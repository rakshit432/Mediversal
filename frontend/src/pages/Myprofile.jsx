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
        <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const data = isEdit ? formData : userData;

  /* ================= UI ================= */
  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-3xl mx-auto glass-panel rounded-3xl shadow-xl p-6 sm:p-8 border border-slate-200 bg-white/70 backdrop-blur-xl">

        {/* PROFILE HEADER */}
        <div className="flex flex-col items-center border-b border-slate-100 pb-8 mb-8">
          {isEdit ? (
            <label htmlFor="image" className="cursor-pointer relative group block w-32 h-32 rounded-full overflow-hidden border-4 border-slate-200 shadow-md">
              <img
                src={preview || data.image || assets.profile_pic}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                alt="profile"
              />
              <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                <img
                  src={assets.upload_icon}
                  className="w-8 filter brightness-110"
                  alt="upload"
                />
              </div>
              <input
                id="image"
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </label>
          ) : (
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-200 shadow-md">
              <img
                src={data.image || assets.profile_pic}
                className="w-full h-full object-cover"
                alt="profile"
              />
            </div>
          )}

          {isEdit ? (
            <input
              value={data.name}
              onChange={(e) => setFormData({ ...data, name: e.target.value })}
              className="text-xl font-bold text-center border border-slate-200 rounded-xl px-4 py-2 mt-4 focus:outline-none focus:ring-2 focus:ring-teal-500 w-full max-w-xs bg-white text-slate-700"
              placeholder="Your Name"
            />
          ) : (
            <h1 className="text-3xl font-black text-slate-800 mt-4 tracking-tight">{data.name}</h1>
          )}

          <p className="text-slate-500 text-xs font-bold mt-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">{data.email}</p>
        </div>

        {/* CONTACT & PERSONAL INFO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Phone */}
          <div className="bg-slate-50/60 border border-slate-150 rounded-2xl p-5 hover:border-teal-500/10 transition-all duration-200">
            <label className="text-[10px] font-bold text-slate-400 block mb-1 tracking-wider">PHONE NUMBER</label>
            {isEdit ? (
              <input
                value={data.phone}
                onChange={(e) => setFormData({ ...data, phone: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-slate-700"
              />
            ) : (
              <p className="text-xs font-bold text-slate-700">{data.phone || 'N/A'}</p>
            )}
          </div>

          {/* Gender */}
          <div className="bg-slate-50/60 border border-slate-150 rounded-2xl p-5 hover:border-teal-500/10 transition-all duration-200">
            <label className="text-[10px] font-bold text-slate-400 block mb-1 tracking-wider">GENDER</label>
            {isEdit ? (
              <select
                value={data.gender || ''}
                onChange={(e) => setFormData({ ...data, gender: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-slate-700 cursor-pointer"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <p className="text-xs font-bold text-slate-700">{data.gender || 'N/A'}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div className="bg-slate-50/60 border border-slate-150 rounded-2xl p-5 hover:border-teal-500/10 transition-all duration-200">
            <label className="text-[10px] font-bold text-slate-400 block mb-1 tracking-wider">DATE OF BIRTH</label>
            {isEdit ? (
              <input
                type="date"
                value={data.dob || ''}
                onChange={(e) => setFormData({ ...data, dob: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-slate-700 cursor-pointer"
              />
            ) : (
              <p className="text-xs font-bold text-slate-700">{data.dob || 'N/A'}</p>
            )}
          </div>

          {/* Address */}
          <div className="bg-slate-50/60 border border-slate-150 rounded-2xl p-5 hover:border-teal-500/10 transition-all duration-200 md:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 block mb-1 tracking-wider">CLINIC / HOME ADDRESS</label>
            {isEdit ? (
              <div className="space-y-2">
                <input
                  value={data.address?.line1 || ''}
                  onChange={(e) =>
                      setFormData({
                        ...data,
                        address: { ...data.address, line1: e.target.value }
                      })
                  }
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-slate-700"
                  placeholder="Street / Line 1"
                />
                <input
                  value={data.address?.line2 || ''}
                  onChange={(e) =>
                      setFormData({
                        ...data,
                        address: { ...data.address, line2: e.target.value }
                      })
                  }
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-slate-700"
                  placeholder="City, State / Line 2"
                />
              </div>
            ) : (
              <div className="text-xs font-bold text-slate-700 leading-normal">
                {data.address?.line1 ? (
                  <>
                    <p>{data.address.line1}</p>
                    {data.address.line2 && <p className="mt-0.5">{data.address.line2}</p>}
                  </>
                ) : (
                  <p>N/A</p>
                )}
              </div>
            )}
          </div>

        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-8 flex flex-wrap gap-4 border-t border-slate-100 pt-6">
          <button
            onClick={isEdit ? updateUserProfileData : startEdit}
            className="px-8 py-3.5 cursor-pointer bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold tracking-wider rounded-full shadow-md hover:shadow-lg transition-all duration-200"
          >
            {isEdit ? 'SAVE CHANGES' : 'EDIT PROFILE'}
          </button>

          {isEdit && (
            <button
              onClick={cancelEdit}
              className="px-8 py-3.5 cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold tracking-wider rounded-full active:scale-95 transition-all duration-200"
            >
              CANCEL
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default Myprofile;
