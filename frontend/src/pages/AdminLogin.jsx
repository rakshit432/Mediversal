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
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md border border-slate-100">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {state === 'Admin' ? 'Admin Login' : 'Doctor Login'}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Welcome back, please log in to access your portal.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="rounded-md space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 text-sm"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-150 cursor-pointer"
            >
              Login
            </button>
          </div>

          <div className="text-center mt-4">
            {state === 'Admin' ? (
              <p className="text-sm text-slate-600">
                Doctor Login?{' '}
                <span
                  onClick={() => setState('Doctor')}
                  className="text-teal-600 hover:text-teal-700 font-semibold cursor-pointer transition"
                >
                  Click here
                </span>
              </p>
            ) : (
              <p className="text-sm text-slate-600">
                Admin Login?{' '}
                <span
                  onClick={() => setState('Admin')}
                  className="text-teal-600 hover:text-teal-700 font-semibold cursor-pointer transition"
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
