import { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const Myprofile = () => {
  const { userData, setUserData, token, loadUserProfileData, backendUrl } = useContext(AppContext);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!image) { setPreview(null); return; }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  useEffect(() => {
    if (!token || userData) return;
    setLoading(true);
    loadUserProfileData().finally(() => setLoading(false));
  }, [token, userData, loadUserProfileData]);

  const startEdit = () => { setFormData(JSON.parse(JSON.stringify(userData))); setIsEdit(true); };
  const cancelEdit = () => { setIsEdit(false); setFormData(null); setImage(null); };

  const updateUserProfileData = async () => {
    try {
      if (!formData.name || !formData.phone) { toast.error('Name and phone are required'); return; }
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('phone', formData.phone);
      fd.append('gender', formData.gender || '');
      fd.append('dob', formData.dob || '');
      fd.append('address', JSON.stringify(formData.address || {}));
      if (image) fd.append('image', image);
      const { data } = await axios.post(backendUrl + '/api/user/update-profile', fd, { headers: { token } });
      if (data.success) {
        setUserData(data.userData);
        toast.success('Profile updated! 💚');
        setIsEdit(false); setFormData(null); setImage(null);
      } else toast.error(data.message);
    } catch (error) { toast.error(error.message); }
  };

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="wellness-card p-10 text-center max-w-sm">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-black text-slate-800 mb-2">Authentication Required</h2>
        <p className="text-sm text-slate-500 mb-6">Please log in to view your health profile.</p>
        <a href="/login" className="btn-primary text-xs">GO TO LOGIN</a>
      </div>
    </div>
  );

  if (loading || !userData) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="wellness-loader" />
    </div>
  );

  const data = isEdit ? formData : userData;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 page-enter">
      {/* Background blobs */}
      <div className="fixed hero-blob w-96 h-96 bg-teal-200/10 top-0 right-0 pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="section-label mb-5">👤 My Profile</div>

        <div className="wellness-card p-6 sm:p-8">

          {/* PROFILE HEADER */}
          <div className="flex flex-col items-center border-b border-slate-100 pb-8 mb-8">
            {isEdit ? (
              <label htmlFor="image"
                     className="cursor-pointer relative group block w-32 h-32 rounded-full overflow-hidden
                                border-4 border-teal-200 shadow-lg hover:border-teal-400 transition">
                <img
                  src={preview || data.image || assets.profile_pic}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  alt="profile"
                />
                <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center
                                opacity-0 group-hover:opacity-100 transition duration-200">
                  <img src={assets.upload_icon} className="w-8 filter brightness-200" alt="upload" />
                </div>
                <input id="image" type="file" hidden accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
              </label>
            ) : (
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-teal-200 shadow-lg">
                <img src={data.image || assets.profile_pic} className="w-full h-full object-cover" alt="profile" />
              </div>
            )}

            {isEdit ? (
              <input
                value={data.name}
                onChange={(e) => setFormData({ ...data, name: e.target.value })}
                className="input-wellness text-center text-xl font-black mt-4 max-w-xs"
                placeholder="Your Name"
              />
            ) : (
              <h1 className="text-3xl font-black text-slate-800 mt-4 tracking-tight">{data.name}</h1>
            )}
            <span className="mt-2 text-xs text-slate-500 font-semibold px-4 py-1.5 bg-slate-50
                             border border-slate-200 rounded-full">
              {data.email}
            </span>
          </div>

          {/* INFO GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

            {/* Phone */}
            <div className="bg-gradient-to-br from-teal-50/50 to-transparent border border-slate-200/60 rounded-2xl p-5">
              <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">
                📞 Phone Number
              </label>
              {isEdit ? (
                <input
                  value={data.phone}
                  onChange={(e) => setFormData({ ...data, phone: e.target.value })}
                  className="input-wellness text-sm"
                />
              ) : (
                <p className="text-sm font-bold text-slate-700">{data.phone || 'Not provided'}</p>
              )}
            </div>

            {/* Gender */}
            <div className="bg-gradient-to-br from-teal-50/50 to-transparent border border-slate-200/60 rounded-2xl p-5">
              <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">
                🧬 Gender
              </label>
              {isEdit ? (
                <select
                  value={data.gender || ''}
                  onChange={(e) => setFormData({ ...data, gender: e.target.value })}
                  className="input-wellness text-sm cursor-pointer"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p className="text-sm font-bold text-slate-700">{data.gender || 'Not provided'}</p>
              )}
            </div>

            {/* DOB */}
            <div className="bg-gradient-to-br from-teal-50/50 to-transparent border border-slate-200/60 rounded-2xl p-5">
              <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">
                🎂 Date of Birth
              </label>
              {isEdit ? (
                <input
                  type="date"
                  value={data.dob || ''}
                  onChange={(e) => setFormData({ ...data, dob: e.target.value })}
                  className="input-wellness text-sm cursor-pointer"
                />
              ) : (
                <p className="text-sm font-bold text-slate-700">{data.dob || 'Not provided'}</p>
              )}
            </div>

            {/* Address */}
            <div className="bg-gradient-to-br from-teal-50/50 to-transparent border border-slate-200/60 rounded-2xl p-5 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">
                📍 Address
              </label>
              {isEdit ? (
                <div className="space-y-2">
                  <input
                    value={data.address?.line1 || ''}
                    onChange={(e) => setFormData({ ...data, address: { ...data.address, line1: e.target.value } })}
                    className="input-wellness text-sm"
                    placeholder="Street / Line 1"
                  />
                  <input
                    value={data.address?.line2 || ''}
                    onChange={(e) => setFormData({ ...data, address: { ...data.address, line2: e.target.value } })}
                    className="input-wellness text-sm"
                    placeholder="City, State / Line 2"
                  />
                </div>
              ) : (
                <div className="text-sm font-bold text-slate-700 leading-relaxed">
                  {data.address?.line1 ? (
                    <>
                      <p>{data.address.line1}</p>
                      {data.address.line2 && <p className="mt-0.5">{data.address.line2}</p>}
                    </>
                  ) : (
                    <p>Not provided</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-6">
            <button
              onClick={isEdit ? updateUserProfileData : startEdit}
              className="btn-primary text-[11px]"
            >
              {isEdit ? '💾 SAVE CHANGES' : '✏️ EDIT PROFILE'}
            </button>
            {isEdit && (
              <button onClick={cancelEdit} className="btn-outline text-[11px]">
                CANCEL
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Myprofile;
