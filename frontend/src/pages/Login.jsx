import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

export default function Login() {
  const { backendUrl, token, setToken } = React.useContext(AppContext);
  const navigate = useNavigate();
  const [state, setState] = useState('Sign Up');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (state === 'Sign Up') {
        const { data } = await axios.post(backendUrl + '/api/user/register', { name, password, email });
        if (data.success) {
          setToken(data.token);
          localStorage.setItem("token", data.token);
          toast.success("Welcome to Mediversal! 🎉");
          navigate('/');
        } else toast.error(data.message);
      } else {
        const { data } = await axios.post(backendUrl + '/api/user/login', { email, password });
        if (data.success) {
          setToken(data.token);
          localStorage.setItem("token", data.token);
          toast.success("Welcome back! 💚");
          navigate('/');
        } else toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) navigate('/'); }, [token, navigate]);

  const isSignUp = state === 'Sign Up';

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-6 page-enter">
      {/* Background blobs */}
      <div className="fixed hero-blob w-[500px] h-[500px] bg-teal-200/20 -top-32 -right-32 pointer-events-none" />
      <div className="fixed hero-blob w-[400px] h-[400px] bg-cyan-200/15 -bottom-20 -left-20 pointer-events-none" style={{ animationDelay: '4s' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="wellness-card p-8 sm:p-10">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 grad-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg glow-teal">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 13H9V9h2v6zm4 0h-2V9h2v6z" fill="white"/>
              </svg>
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-slate-500 text-xs font-medium mt-2">
              {isSignUp
                ? 'Join thousands on their health journey with Mediversal'
                : 'Sign in to continue your wellness journey'}
            </p>
          </div>

          {/* Toggle tabs */}
          <div className="flex bg-slate-100/70 rounded-2xl p-1 mb-6">
            {['Sign Up', 'Login'].map((tab) => (
              <button
                key={tab}
                onClick={() => setState(tab)}
                className={`flex-1 py-2.5 text-xs font-bold tracking-wider rounded-xl transition-all duration-300 ${
                  state === tab
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmitHandler} className="flex flex-col gap-4">
            {isSignUp && (
              <div>
                <label className="text-[10px] font-black text-slate-400 block mb-1.5 uppercase tracking-widest">
                  Full Name
                </label>
                <input
                  className="input-wellness"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. Jane Doe"
                  required
                />
              </div>
            )}

            <div>
              <label className="text-[10px] font-black text-slate-400 block mb-1.5 uppercase tracking-widest">
                Email Address
              </label>
              <input
                className="input-wellness"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 block mb-1.5 uppercase tracking-widest">
                Password
              </label>
              <input
                className="input-wellness"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn-primary w-full justify-center text-xs py-3.5 mt-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : isSignUp ? 'CREATE ACCOUNT →' : 'SIGN IN →'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 font-medium mt-5">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button
              onClick={() => setState(isSignUp ? 'Login' : 'Sign Up')}
              className="text-teal-600 font-bold hover:underline"
            >
              {isSignUp ? 'Sign in here' : 'Create one free'}
            </button>
          </p>
        </div>

        {/* Trust note */}
        <p className="text-center text-[10px] text-slate-400 font-medium mt-4">
          🔒 Your data is encrypted and HIPAA-compliant
        </p>
      </div>
    </div>
  );
}
