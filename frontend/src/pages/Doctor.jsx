import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useParams, useNavigate } from "react-router-dom";

export default function Doctor() {
  const { doctors } = useContext(AppContext);
  const { speciality } = useParams();
  const navigate = useNavigate();
  const [filteredDoc, setFilteredDoc] = useState([]);

  /* ================= FILTER ================= */
  useEffect(() => {
    if (speciality && doctors.length) {
      setFilteredDoc(
        doctors.filter(
          (doc) =>
            doc.speciality.toLowerCase() === speciality.toLowerCase()
        )
      );
    } else {
      setFilteredDoc(doctors);
    }
  }, [doctors, speciality]);

  return (
    <div className="px-6 py-6">
      {/* MAIN GRID LAYOUT */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* ================= LEFT SIDEBAR ================= */}
        <div className="lg:col-span-1 bg-gray-100 p-4 rounded-lg shadow h-fit">
          <p className="font-semibold mb-4 text-sm text-gray-700">
            Browse doctors by speciality
          </p>

          <div className="flex flex-col gap-2">
            {[
              "General physician",
              "Gynecologist",
              "Dermatologist",
              "Neurologist",
              "Pediatrician",
              "Gastroenterologist",
            ].map((item) => (
              <button
                key={item}
                onClick={() => navigate(`/doctors/${item}`)}
                className={`px-3 py-2 text-left rounded-md transition text-sm
                  ${
                    speciality === item
                      ? "bg-teal-700 text-white font-semibold"
                      : "bg-white hover:bg-teal-50 text-gray-700"
                  }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* ================= DOCTOR CARDS GRID ================= */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-start">

            {filteredDoc.map((item) => (
              <div
                key={item._id}
                onClick={() => navigate(`/appointment/${item._id}`)}
                className="
                  bg-white shadow-md rounded-xl p-4 
                  flex flex-col items-center 
                  cursor-pointer hover:shadow-lg transition
                  w-full max-w-[260px]
                "
              >
                {/* Image */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-full mb-3"
                />

                {/* Status */}
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      item.available ? "bg-green-500" : "bg-gray-400"
                    }`}
                  ></span>
                  <p
                    className={`font-medium ${
                      item.available ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {item.available ? "Available" : "Not Available"}
                  </p>
                </div>

                {/* Name & Speciality */}
                <p className="mt-2 font-semibold text-gray-800 text-center">
                  {item.name}
                </p>
                <p className="text-gray-500 text-sm text-center">
                  {item.speciality}
                </p>
              </div>
            ))}

          </div>

          {/* Empty State */}
          {filteredDoc.length === 0 && (
            <p className="text-center text-gray-500 mt-12">
              No doctors found for this speciality
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
