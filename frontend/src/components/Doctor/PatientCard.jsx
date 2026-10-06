import React from "react";
import { assets } from "../../assets/adminAssets";

export const calculateAge = (dob) => {
  if (!dob || dob === "Not Specified") return null;
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
};

const PatientCard = ({ patient, reportsCount = 0, latestAppointment = null }) => {
  if (!patient) return null;

  const age = calculateAge(patient.dob);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* PATIENT INFO */}
        <div className="flex items-center gap-4">
          <img
            src={patient.image || assets.profile_pic}
            alt={patient.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                {patient.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                Patient
              </span>
            </div>

            <p className="text-xs text-slate-500 font-medium mt-0.5 flex flex-wrap items-center gap-2">
              <span>{patient.email}</span>
              <span>•</span>
              <span>{patient.phone || "No phone provided"}</span>
            </p>
          </div>
        </div>

        {/* CLINICAL PILLS */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2">
            <span className="block text-[10px] uppercase font-bold text-slate-400">Gender</span>
            <span className="text-xs font-bold text-slate-700">{patient.gender || "Not Specified"}</span>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2">
            <span className="block text-[10px] uppercase font-bold text-slate-400">Age</span>
            <span className="text-xs font-bold text-slate-700">
              {age !== null ? `${age} yrs` : patient.dob && patient.dob !== "Not Specified" ? patient.dob : "N/A"}
            </span>
          </div>

          <div className="bg-teal-50/60 border border-teal-200/80 rounded-xl px-3.5 py-2">
            <span className="block text-[10px] uppercase font-bold text-teal-600">Indexed Reports</span>
            <span className="text-xs font-bold text-teal-800">{reportsCount} Files</span>
          </div>

          {latestAppointment && (
            <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-xl px-3.5 py-2">
              <span className="block text-[10px] uppercase font-bold text-indigo-600">Latest Slot</span>
              <span className="text-xs font-bold text-indigo-800">
                {latestAppointment.slotTime} ({new Date(latestAppointment.slotDate).toLocaleDateString()})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ADDRESS BAR */}
      {patient.address && (patient.address.line1 || patient.address.line2) && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>📍</span>
          <span>
            {[patient.address.line1, patient.address.line2].filter(Boolean).join(", ")}
          </span>
        </div>
      )}
    </div>
  );
};

export default PatientCard;
