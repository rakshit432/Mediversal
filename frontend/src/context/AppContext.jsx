import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const currencySymbol = "$";
 const backendUrl = "http://localhost:4000";


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
        toast.success(data.message);
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
      <ToastContainer />
    </AppContext.Provider>
  );
};

export default AppContextProvider;
