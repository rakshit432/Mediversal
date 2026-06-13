import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md w-full p-8 bg-white/70 border border-slate-200/60 rounded-3xl shadow-lg flex flex-col items-center backdrop-blur-xl">
        {/* Modern illustrative SVG for 404 */}
        <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mb-6 animate-pulse">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-6xl font-black bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">404</h1>
        <h2 className="text-xl font-bold text-slate-800 mt-4">Page Not Found</h2>
        <p className="text-slate-500 mt-2 text-sm leading-relaxed font-semibold">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <button
          onClick={() => navigate('/')}
          className="mt-8 px-6 py-3 cursor-pointer bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-full shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 w-full border border-teal-500/20"
        >
          Go Back Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
