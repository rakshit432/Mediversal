import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const TopDoctors = () => {
    const navigate = useNavigate();
    const { doctors } = useContext(AppContext);

  return (
    <div className="py-16 px-6">
      {/* Heading */}
      <h1 className="text-2xl font-semibold text-center">Top Doctors to Book</h1>
      <p className="text-gray-600 text-center mb-10">
        Simply browse through our extensive list of trusted doctors.
      </p>

      {/* Doctors List */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {doctors.slice(0, 10).map((item, index) => (
          <div onClick={()=>navigate(`appointment/${item._id}`)}
            key={index}
            className="bg-white shadow-md rounded-xl p-4 flex flex-col items-center cursor-pointer hover:shadow-lg transition"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-24 h-24 object-cover rounded-full mb-3"
            />
            <div className="text-center">
              <div className="flex justify-center items-center gap-2 text-sm">
                <span className={`w-2 h-2 ${item.available ? 'bg-green-500' : 'bg-gray-500'} rounded-full`}></span>
                <p className={`${item.available ? 'text-green-600' : 'text-gray-500'} font-medium`}>{item.available ? 'Available' : 'Not Available'}</p>
              </div>
              <p className="mt-2 font-semibold">{item.name}</p> 
              <p className="text-gray-500 text-sm">{item.speciality}</p>
            </div>
          </div>
        ))}
      </div>
      {/* More Button */}
      <div className="text-center mt-10">
        <button  onClick={()=>{navigate('/doctors');scroll(0,0)}}className="px-6 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition">
          More
        </button>
      </div>
    </div>
  );
};

export default TopDoctors;
