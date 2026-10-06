import { createContext } from "react";

export const AppContext = createContext({});

const AppContextProvider = ({ children }) => {

  const calculateAge = (dob) => {
    if (!dob || dob === 'Not Specified') return '—';
    const today = new Date();
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return '—';
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : '—';
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
