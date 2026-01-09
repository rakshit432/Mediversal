import React from 'react'

export const Footer = () => {
  return (
    <div className='md:mx-10'>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
        {/* Footer left part */}
        <div>
            <h1 className="text-2xl font-bold text-teal-700 mb-5">Mediversal</h1>
            <p className='w-full md:w-2/3 leading-6'>Your trusted health partner.</p>
        </div>
        {/* Footer centre part */}
        <div>
            <p className='text-xl font-medium mb-5'>Company</p>
            <ul className='flex flex-col gap-2 text-gray-600'>
                <li>Home</li>
                <li>About us</li>
                <li>Contact us</li>
                <li>Privacy policy</li>
            </ul>
        </div>
        {/* Footer right part */}
        <div>
            <p className='text-xl font-medium mb-5'>Get In Touch</p>
            <ul className='flex flex-col gap-2 text-gray-600'>
                <li>+1-213-232-2122</li>
                <li>abc@gmail.com</li>
                <li>123,xyz street,USA</li>
            </ul>
        </div>
    </div>
    <div>
        <hr />
        <p className='py-5 text-sm text-center'>© 2025 Mediversal. All rights reserved</p>
        
    </div>
    </div>
  )
}
