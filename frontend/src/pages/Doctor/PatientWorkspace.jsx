import React, { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { DoctorContext } from "../../context/DoctorContext";
import PatientCard from "../../components/Doctor/PatientCard";
import ReportList from "../../components/Doctor/ReportList";
import QueryInput from "../../components/Doctor/QueryInput";
import QueryResponse from "../../components/Doctor/QueryResponse";

const PatientWorkspace = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { dToken, backendUrl } = useContext(DoctorContext);

  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [queryLoading, setQueryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'reports' | 'ai'

  // AI Query state
  const [currentQuery, setCurrentQuery] = useState("");
  const [queryResult, setQueryResult] = useState(null);

  // Fetch Patient Details & Authorization
  const fetchPatientData = useCallback(async () => {
    if (!dToken || !patientId) return;

    try {
      setLoading(true);
      const [patientRes, reportsRes] = await Promise.all([
        axios.get(`${backendUrl}/api/doctor/patients/${patientId}`, {
          headers: { dtoken: dToken },
        }),
        axios.get(`${backendUrl}/api/doctor/patients/${patientId}/reports`, {
          headers: { dtoken: dToken },
        }),
      ]);

      if (patientRes.data.success) {
        setPatient(patientRes.data.patient);
        setAppointments(patientRes.data.appointments || []);
      }

      if (reportsRes.data.success) {
        setReports(reportsRes.data.reports || []);
      }
    } catch (error) {
      console.error("Error loading patient workspace:", error);
      if (error.response?.status === 403) {
        toast.error("Forbidden: You are not authorized to access this patient's workspace.");
        navigate("/doctor-appointments");
      } else {
        toast.error(error.response?.data?.message || "Failed to load patient workspace");
      }
    } finally {
      setLoading(false);
    }
  }, [backendUrl, dToken, patientId, navigate]);

  useEffect(() => {
    fetchPatientData();
  }, [fetchPatientData]);

  // Execute RAG Query
  const handleQuerySubmit = async (question) => {
    if (!question || !question.trim()) return;

    try {
      setQueryLoading(true);
      setCurrentQuery(question);
      setQueryResult(null);

      const { data } = await axios.post(
        `${backendUrl}/api/doctor/patients/${patientId}/query`,
        { query: question },
        { headers: { dtoken: dToken } }
      );

      if (data.success) {
        setQueryResult(data);
      } else {
        toast.error(data.message || "Failed to retrieve answer");
      }
    } catch (error) {
      console.error("Clinical query error:", error);
      toast.error(
        error.response?.data?.message || error.message || "Error running clinical RAG query"
      );
    } finally {
      setQueryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-slate-400 font-semibold space-y-3">
        <div className="w-8 h-8 mx-auto border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p>Loading Clinical Patient Workspace...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-10 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-700">Patient not found or unauthorized</h2>
        <button
          onClick={() => navigate("/doctor-appointments")}
          className="text-teal-600 font-bold text-xs underline cursor-pointer"
        >
          ← Return to Appointments
        </button>
      </div>
    );
  }

  const latestAppointment = appointments.length > 0 ? appointments[0] : null;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* TOP NAVIGATION BAR */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/doctor-appointments")}
          className="text-xs font-bold text-slate-500 hover:text-teal-700 transition flex items-center gap-1.5 cursor-pointer bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs"
        >
          <span>←</span>
          <span>Back to Appointments</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-slate-600">Active Patient Consultation</span>
        </div>
      </div>

      {/* PATIENT HEADER CARD */}
      <PatientCard
        patient={patient}
        reportsCount={reports.length}
        latestAppointment={latestAppointment}
      />

      {/* WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: MEDICAL REPORTS LIST */}
        <div className="lg:col-span-5 space-y-4">
          <ReportList
            reports={reports}
            onRefresh={fetchPatientData}
            loading={loading}
          />
        </div>

        {/* RIGHT COLUMN: CLINICAL RAG QUERY ASSISTANT */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-xl font-bold text-teal-600">
                ✨
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Ask About Patient's Medical Reports
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  RAG-powered clinical assistant retrieving facts from this patient's indexed reports
                </p>
              </div>
            </div>

            {/* QUERY INPUT COMPONENT */}
            <QueryInput
              onSubmit={handleQuerySubmit}
              loading={queryLoading}
              disabled={reports.length === 0}
            />

            {reports.length === 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                ⚠️ This patient has not uploaded any medical reports yet. AI querying will become available once records are uploaded and indexed.
              </div>
            )}
          </div>

          {/* QUERY RESPONSE COMPONENT */}
          {queryLoading && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3 shadow-sm">
              <div className="w-8 h-8 mx-auto border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-slate-700">
                Searching patient report vector indices & synthesizing answer with Gemini...
              </p>
              <p className="text-[11px] text-slate-400">
                Partitioned search strictly scoped to patient ID: {patientId}
              </p>
            </div>
          )}

          {queryResult && !queryLoading && (
            <QueryResponse
              queryResult={queryResult}
              currentQuery={currentQuery}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientWorkspace;
