import React from 'react';
import grp from '../assets/group_profiles.png';
import arrow from '../assets/arrow_icon.svg';
import header from '../assets/header_img.png';

const Header = () => {
  return (
    <section className="px-4 sm:px-6 mt-6 mb-12">
      <div className="max-w-7xl mx-auto bg-teal-700 rounded-3xl overflow-hidden">
        <div className="relative flex flex-col lg:flex-row items-center px-6 sm:px-10 lg:px-14 py-12">

          {/* LEFT CONTENT */}
          <div className="flex-1 flex flex-col gap-6 text-center lg:text-left max-w-xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight text-white">
              Book Appointment <br />
              <span className="text-teal-100">With Trusted Doctors</span>
            </h1>

            {/* Social proof */}
            <div className="flex flex-col items-center lg:items-start gap-3">
              <img
                src={grp}
                alt="trusted users"
                className="w-36 sm:w-44"
              />
              <p className="text-sm sm:text-base text-teal-100">
                Simply browse through our extensive list of trusted doctors and
                schedule your appointment hassle-free.
              </p>
            </div>

            {/* CTA */}
            <a
              href="#speciality"
              className="inline-flex items-center gap-2 bg-white text-teal-700 font-medium 
                         px-6 py-3 rounded-full shadow-md 
                         hover:scale-105 hover:shadow-lg transition w-fit mx-auto lg:mx-0"
            >
              Book Appointment
              <img src={arrow} alt="arrow" className="w-4 h-4" />
            </a>
          </div>

          {/* RIGHT IMAGE */}
          <div className="flex-1 relative mt-10 lg:mt-0 flex justify-center lg:justify-end">
            <img
              src={header}
              alt="doctors"
              className="w-full max-w-sm sm:max-w-md lg:max-w-lg object-contain px-4"
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default Header;
