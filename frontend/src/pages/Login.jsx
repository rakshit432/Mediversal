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
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="flex flex-col border-teal-200 border-2 gap-6 m-auto items-start p-8 w-full max-w-md rounded-lg shadow-lg">
        <h1 className="text-2xl text-teal-800 font-bold">{state}</h1>
        <p className="text-gray-600">
          {state === 'Sign Up' ? "Create Account" : "Login"}
        </p>
        <div className="w-full flex flex-col gap-5">
          {state === 'Sign Up' && (
            <div className="w-full">
              <p className="text-gray-800 mb-1">Full Name</p>
              <input className="w-full p-2 border border-gray-300 rounded-md" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" required />
            </div>
          )}
          <div className="w-full">
            <p className="text-gray-800 mb-1">Email</p>
            <input className="w-full p-2 border border-gray-300 rounded-md" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required />
          </div>
          <div className="w-full">
            <p className="text-gray-800 mb-1">Password</p>
            <input className="w-full p-2 border border-gray-300 rounded-md" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter the password" required />
          </div>
        </div>

        <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded-md font-semibold hover:bg-teal-700 transition">
          {state === 'Sign Up' ? 'Create Account' : 'Login'}
        </button>

        {state === 'Login' ? (
          <p className="text-sm text-gray-600">
            Don't have an account? <span onClick={() => setState('Sign Up')} className="text-teal-600 font-semibold cursor-pointer">Sign up here</span>
          </p>
        ) : (
          <p className="text-sm text-gray-600">
            Already have an account? <span onClick={() => setState('Login')} className="text-teal-600 font-semibold cursor-pointer">Login here</span>
          </p>
        )}
      </div>
    </form>
  );
}
