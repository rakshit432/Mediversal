import { createContext } from "react";

export const AppContext = createContext({});

const AppContextProvider = ({ children }) => {

  const calculateAge = (dob) => 
  {
    if (!dob) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dob);

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
 
  const months = ["" , "Jan" , "Feb" , "Mar" , "Apr" , "May" , "Jun" , "Jul" , "Aug" , "Sep" , "Oct" , "Nov" , "Dec"];
   const slotDateFormat = (slotDate) =>
  {
     if (!slotDate) return 'N/A';
     // Handle both Date objects and string formats
     let dateStr;
     if (slotDate instanceof Date) {
       dateStr = slotDate.toISOString().split('T')[0];
     } else if (typeof slotDate === 'string') {
       dateStr = slotDate.includes('T') ? slotDate.split('T')[0] : slotDate;
     } else {
       return 'Invalid Date';
     }
     
     const dateArray = dateStr.split('-'); // 'YYYY-MM-DD' format
     if (dateArray.length === 3) {
       return dateArray[2] + " " + months[Number(dateArray[1])] + " " + dateArray[0];
     }
     return dateStr;
   }
  
  const currency = '$' ;
  const value = {
    calculateAge , slotDateFormat,currency 
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
