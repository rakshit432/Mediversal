import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

export default function Login() {
  const { backendUrl, token, setToken } = React.useContext(AppContext);
  const navigate = useNavigate();
  const[state,setState]=useState('Sign Up');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const[name,setName]=useState('');

  const onSubmitHandler = async (event) => {
    event.preventDefault(); 
    
    try {
      if (state === 'Sign Up') {
        const { data } = await axios.post(backendUrl + '/api/user/register', { name, password, email });
        if (data.success) {
          setToken(data.token);
          localStorage.setItem("token", data.token);
          toast.success("Registration successful");
          navigate('/');
        } else {
          toast.error(data.message);
        }
      } else {
        // Login functionality
        const { data } = await axios.post(backendUrl + '/api/user/login', { email, password });
        if (data.success) {
          setToken(data.token);
          localStorage.setItem("token", data.token);
          toast.success("Login successful");
          navigate('/');
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "An error occurred");
    }
  }

  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token, navigate])

  return (
    <form onSubmit={onSubmitHandler} className="min-h-[85vh] flex items-center justify-center p-6">
      <div className="flex flex-col bg-white/70 border border-slate-200/60 gap-6 m-auto items-start p-8 w-full max-w-md rounded-3xl shadow-lg backdrop-blur-xl">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">{state}</h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            {state === 'Sign Up' ? "Create an account to book specialist appointments" : "Sign in to manage your medical appointments"}
          </p>
        </div>

        <div className="w-full flex flex-col gap-4">
          {state === 'Sign Up' && (
            <div className="w-full">
              <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Full Name</label>
              <input 
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-semibold text-slate-705 transition" 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="John Doe" 
                required 
              />
            </div>
          )}
          <div className="w-full">
            <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Email Address</label>
            <input 
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-semibold text-slate-705 transition" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="you@example.com" 
              required 
            />
          </div>
          <div className="w-full">
            <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Password</label>
            <input 
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-semibold text-slate-705 transition" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••" 
              required 
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-teal-600 hover:bg-teal-700 active:scale-95 text-white py-3 rounded-full text-xs font-bold tracking-wider hover:scale-[1.02] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          {state === 'Sign Up' ? 'CREATE ACCOUNT' : 'LOG IN'}
        </button>

        {state === 'Login' ? (
          <p className="text-xs text-slate-500 font-medium">
            Don't have an account? <span onClick={() => setState('Sign Up')} className="text-teal-600 font-bold hover:underline cursor-pointer">Sign up here</span>
          </p>
        ) : (
          <p className="text-xs text-slate-500 font-medium">
            Already have an account? <span onClick={() => setState('Login')} className="text-teal-600 font-bold hover:underline cursor-pointer">Login here</span>
          </p>
        )}
      </div>
    </form>
  );
}
