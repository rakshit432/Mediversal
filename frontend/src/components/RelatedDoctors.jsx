import React, { useEffect, useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export const RelatedDoctors = ({ speciality, docId }) => {
  const { doctors } = useContext(AppContext);
  const [relDoc, setReldoc] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (doctors.length > 0 && speciality) {
      const related = doctors.filter(
        (doc) =>
          doc.speciality.toLowerCase() === speciality.toLowerCase() &&
          doc._id !== docId
      );
      setReldoc(related);
    }
  }, [doctors, docId, speciality]);

  return (
    <div className="py-16 px-6">
      {/* Heading */}
      <h1 className="text-2xl font-semibold text-center mb-2">Related Doctors</h1>
      <p className="text-gray-600 text-center mb-10">
        More similar specialists available for you.
      </p>

      {/* Doctors List */}
      <div className="flex flex-nowrap justify-start gap-6 overflow-x-auto scrollbar-hide pb-4">
        {relDoc.slice(0, 5).map((item) => (
          <div
            onClick={() => {navigate(`/appointment/${item._id}`);scrollTo(0,0)}}
            key={item._id}
            className="flex-shrink-0 w-64 bg-white border-2 border-teal-200 shadow-md rounded-lg p-6 flex flex-col items-center cursor-pointer hover:shadow-lg transition"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-36 h-36 object-cover rounded-full mb-4"
            />
            <div className="text-center">
              <div className="flex justify-center items-center gap-2 text-sm mb-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <p className="text-green-600 font-medium">Available</p>
              </div>
              <p className="mt-2 font-semibold text-lg">{item.name}</p>
              <p className="text-gray-500 text-sm">{item.speciality}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
