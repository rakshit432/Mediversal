import React, { useState, useContext } from 'react';
import { AdminContext } from '../context/AdminContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {
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
          // 🔥 CLEAR DOCTOR TOKEN (CRITICAL FIX)
          localStorage.removeItem('dToken');
          setDtoken(null);

          // SET ADMIN TOKEN
          localStorage.setItem('aToken', res.data.token);
          setAtoken(res.data.token);

          toast.success("Admin login successful");
        } else {
          // 🔥 CLEAR ADMIN TOKEN (CRITICAL FIX)
          localStorage.removeItem('aToken');
          setAtoken(null);

          // SET DOCTOR TOKEN
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
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96">

        <p className="text-2xl font-semibold m-auto">
          {state === 'Admin' ? 'Admin Login' : 'Doctor Login'}
        </p>

        <div className="w-full">
          <p>Email</p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded w-full p-2 mt-1"
            placeholder="Enter your email"
          />
        </div>

        <div className="w-full">
          <p>Password</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded w-full p-2 mt-1"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          className="bg-teal-700 text-white w-full py-2 rounded-md"
        >
          Login
        </button>

        {state === 'Admin' ? (
          <p className="text-sm mt-2">
            Doctor Login?{' '}
            <span
              onClick={() => setState('Doctor')}
              className="text-teal-700 cursor-pointer"
            >
              Click here
            </span>
          </p>
        ) : (
          <p className="text-sm mt-2">
            Admin Login?{' '}
            <span
              onClick={() => setState('Admin')}
              className="text-teal-700 cursor-pointer"
            >
              Click here
            </span>
          </p>
        )}

      </div>
    </form>
  );
};

export default Login;
