import { createContext, useState, useContext, useCallback, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AdminContext } from "./AdminContext";

export const DoctorContext = createContext({});

const DoctorContextProvider = ({ children }) => {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  const { dToken, setDtoken } = useContext(AdminContext);

  const [appointments, setAppointments] = useState(null);
  const [dashData, setDashData] = useState(null);

  const [loading, setLoading] = useState(false);      // appointments
  const [dashLoading, setDashLoading] = useState(false); // ✅ dashboard

  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (!dToken) {
      setAppointments(null);
      setDashData(null);
      setProfileData(null);
    }
  }, [dToken]);

  /* ================= COMPLETE APPOINTMENT ================= */
  const completeAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/appointments/complete",
        { appointmentId },
        { headers: { dToken } }
      );

      if (data.success) {
        toast.success(data.message);
        getAppointments();
        getDashData(); // keep dashboard in sync
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error completing appointment");
    }
  };

  /* ================= CANCEL APPOINTMENT ================= */
  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/appointments/cancel",
        { appointmentId },
        { headers: { dToken } }
      );

      if (data.success) {
        toast.success(data.message);
        getAppointments();
        getDashData(); // keep dashboard in sync
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error canceling appointment");
    }
  };

  /* ================= GET APPOINTMENTS ================= */
  const getAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        backendUrl + "/api/doctor/appointments",
        { headers: { dToken } }
      );

      if (data.success) {
        setAppointments(data.appointments);
      } else {
        toast.error(data.message || "Failed to fetch appointments");
      }
    } catch (error) {
      toast.error("Error fetching appointments");
    } finally {
      setLoading(false);
    }
  }, [dToken, backendUrl]);

  /* ================= DASHBOARD ================= */
  const getDashData = useCallback(async () => {
    try {
      setDashLoading(true); // ✅ START

      const { data } = await axios.get(
        backendUrl + "/api/doctor/dashboard",
        { headers: { dToken } }
      );

      if (data.success) {
        setDashData(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error fetching dashboard data");
    } finally {
      setDashLoading(false); // ✅ END
    }
  }, [dToken, backendUrl]);

  /* ================= PROFILE ================= */
  const getProfile = useCallback(async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/doctor/profile",
        { headers: { dToken } }
      );

      if (data.success) {
        setProfileData(data.docData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error fetching profile data");
    }
  }, [dToken, backendUrl]);

  const updateProfile = async (profileData) => {
    try {
      const { data } = await axios.put(
        backendUrl + "/api/doctor/profile",
        profileData,
        { headers: { dToken } }
      );

      if (data.success) {
        toast.success(data.message);
        getProfile();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error updating profile data");
    }
  };

  const value = {
    backendUrl,
    dToken,
    setDtoken,

    appointments,
    getAppointments,
    loading,

    dashData,
    dashLoading,
    getDashData,

    profileData,
    getProfile,
    updateProfile,

    completeAppointment,
    cancelAppointment,
  };

  return (
    <DoctorContext.Provider value={value}>
      {children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;
