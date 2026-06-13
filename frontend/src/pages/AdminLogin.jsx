import React, { useState, useContext } from 'react';
import { AdminContext } from '../context/AdminContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminLogin = () => {
  const [state, setState] = useState('Admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { setAtoken, setDtoken, backendUrl } = useContext(AdminContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    try {
      const url =
        state === 'Admin'
          ? `${backendUrl}/api/admin/login`
          : `${backendUrl}/api/doctor/login`;

      const res = await axios.post(url, {
        email: email.trim(),
        password: password.trim(),
      });

      if (res.data.success) {

        if (state === 'Admin') {
          localStorage.removeItem('dToken');
          setDtoken(null);

          localStorage.setItem('aToken', res.data.token);
          setAtoken(res.data.token);

          toast.success("Admin login successful");
        } else {
          localStorage.removeItem('aToken');
          setAtoken(null);

          localStorage.setItem('dToken', res.data.token);
          setDtoken(res.data.token);

          toast.success("Doctor login successful");
        }

        setEmail('');
        setPassword('');
      } else {
        toast.error(res.data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      toast.error("Server error during login");
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white/70 border border-slate-200/60 p-8 rounded-3xl shadow-lg backdrop-blur-xl space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            {state === 'Admin' ? 'Admin Login' : 'Doctor Login'}
          </h2>
          <p className="mt-2 text-xs text-slate-400 font-semibold">
            Welcome back, please log in to access your portal.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="rounded-md space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-semibold text-slate-705 transition"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-semibold text-slate-705 transition"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-xs font-bold tracking-wider rounded-full text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-150 cursor-pointer shadow-sm hover:shadow-md active:scale-95 hover:scale-[1.02]"
            >
              Login
            </button>
          </div>

          <div className="text-center mt-4">
            {state === 'Admin' ? (
              <p className="text-xs text-slate-550 font-medium">
                Doctor Login?{' '}
                <span
                  onClick={() => setState('Doctor')}
                  className="text-teal-650 hover:text-teal-750 font-bold cursor-pointer transition"
                >
                  Click here
                </span>
              </p>
            ) : (
              <p className="text-xs text-slate-550 font-medium">
                Admin Login?{' '}
                <span
                  onClick={() => setState('Admin')}
                  className="text-teal-655 hover:text-teal-755 font-bold cursor-pointer transition"
                >
                  Click here
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};

export default AdminLogin;
