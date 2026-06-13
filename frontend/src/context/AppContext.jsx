import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const currencySymbol = "$";
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";


  const [doctors, setDoctors] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [userData, setUserData] = useState(null);

  // ------------------------------  
  // Get list of doctors
  // ------------------------------
  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/list");

      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error fetching doctors data");
      console.error("Error fetching doctors:", error);
    }
  };

  // ------------------------------  
  // Load logged-in user's profile
  // ------------------------------
  const loadUserProfileData = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/user/get-profile",
        { headers: { token } }
      );

      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error fetching user profile data");
      console.error("Error fetching user profile data:", error);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const slotDateFormat = (slotDate) => {
    if (!slotDate) return 'N/A';
    
    if (slotDate instanceof Date) {
      const day = slotDate.getDate();
      const month = months[slotDate.getMonth() + 1];
      const year = slotDate.getFullYear();
      return `${day} ${month} ${year}`;
    }
    
    if (typeof slotDate === 'string') {
      const cleanDate = slotDate.includes('T') ? slotDate.split('T')[0] : slotDate;
      
      // Underscore format (e.g. 26_6_2026)
      if (cleanDate.includes('_')) {
        const parts = cleanDate.split('_');
        if (parts.length === 3) {
          const d = parts[0];
          const m = months[Number(parts[1])];
          const y = parts[2];
          return `${d} ${m} ${y}`;
        }
      }
      
      // Hyphen format (e.g. 2026-06-26)
      if (cleanDate.includes('-')) {
        const parts = cleanDate.split('-');
        if (parts.length === 3) {
          if (parts[0].length === 4) {
            const y = parts[0];
            const m = months[Number(parts[1])];
            const d = parts[2];
            return `${Number(d)} ${m} ${y}`;
          } else {
            const d = parts[0];
            const m = months[Number(parts[1])];
            const y = parts[2];
            return `${Number(d)} ${m} ${y}`;
          }
        }
      }
    }
    return slotDate;
  };

  const currency = currencySymbol;

  const value = {
    doctors,
    userData,
    setUserData,
    getDoctorsData,
    loadUserProfileData,
    currencySymbol,
    token,
    setToken,
    backendUrl,
    calculateAge,
    slotDateFormat,
    currency,
  };

  // Fetch doctors on first load
  useEffect(() => {
    getDoctorsData();
  }, []);

  // Fetch user profile when token changes
  useEffect(() => {
    if (token) {
      loadUserProfileData();
    } else {
      setUserData(null);
    }
  }, [token]);

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
