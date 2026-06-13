import { createContext, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const AdminContext = createContext({});

const AdminContextProvider = ({ children }) => {

  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || '';

  const normalizeToken = (token) => {
    if (
      !token ||
      token === "null" ||
      token === "undefined"
    ) {
      return null;
    }
    return token;
  };

  const [atoken, setAtoken] = useState(
    normalizeToken(localStorage.getItem('aToken'))
  );

  const [dToken, setDtoken] = useState(
    normalizeToken(localStorage.getItem('dToken'))
  );

  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(false);

  const getAllDoctors = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + '/api/admin/all-doctors',
        { headers: { atoken } }
      );

      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message || 'Failed to fetch doctors');
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Error fetching doctors');
    }
  };

  const getAllAppointments = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + '/api/admin/appointments',
        { headers: { atoken } }
      );

      if (data.success) {
        setAppointments(data.appointments);
      } else {
        toast.error(data.message || 'Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Error fetching appointments');
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + '/api/admin/cancel-appointment',
        { appointmentId },
        { headers: { atoken } }
      );

      if (data.success) {
        toast.success(data.message);
        getAllAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error canceling appointment:', error);
      toast.error('Error canceling appointment');
    }
  };

  const getDashData = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + '/api/admin/dashboard',
        { headers: { atoken } }
      );

      if (data.success) {
        setDashData(data.dashData);
      } else {
        toast.error(data.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error fetching dashboard data');
    }
  };

  const changeAvailablity = async (docId) => {
    const currentDoctor = doctors.find((doc) => doc._id === docId);

    if (!currentDoctor || currentDoctor.loading) return;

    const previousAvailability = currentDoctor.available;

    setDoctors((prev) =>
      prev.map((doc) =>
        doc._id === docId
          ? { ...doc, available: !previousAvailability, loading: true }
          : doc
      )
    );

    try {
      const { data } = await axios.post(
        backendUrl + '/api/admin/change-availability',
        { docId },
        { headers: { atoken } }
      );

      if (!data.success) {
        throw new Error(data.message);
      }

      toast.success(data.message);
    } catch (error) {
      console.error('Error changing availability:', error);

      setDoctors((prev) =>
        prev.map((doc) =>
          doc._id === docId
            ? { ...doc, available: previousAvailability }
            : doc
        )
      );

      toast.error('Error changing availability');
    } finally {
      setDoctors((prev) =>
        prev.map((doc) =>
          doc._id === docId
            ? { ...doc, loading: false }
            : doc
        )
      );
    }
  };

  const value = {
    backendUrl,
    atoken,
    setAtoken,
    dToken,
    setDtoken,
    doctors,
    appointments,
    dashData,
    getAllDoctors,
    getAllAppointments,
    cancelAppointment,
    getDashData,
    changeAvailablity,
    setDashData,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
