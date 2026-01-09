import React from 'react'
import { assets } from '../assets/assets'

const Contact = () => {
  return (
    <div>
      <div className='text-center my-8 text-2xl font-bold text-gray-600'>
        <p>Contact <span className='text-teal-700 font-semibold'>Us</span></p>
      </div>
      <div className='flex flex-col md:flex-row justify-center items-start gap-8 md:gap-16 p-4 md:p-16'> 
        <img className='w-full md:max-w-[360px] object-cover' src={assets.contact_image} alt="contact us"/>
        <div className='flex flex-col gap-4 text-gray-600'>
          <p className='text-xl font-bold'>Our OFFICE</p>
          <p>54709 Willms Station <br/> Suite 350 , Washington , USA</p>
          <p>Tel: (415) 555 123-4567 <br/> Email: contact@mediversal.com </p>
           <p className='text-xl font-bold'>Careers at MEDIVERSAL</p>
          <p>Join our team and help us make a difference in healthcare.</p>
          <button className='p-2 border-2 font-semibold'>Explore Jobs</button>
        </div>
      </div>
    </div>
  )
}

export default Contact
