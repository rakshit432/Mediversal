import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Doctor from './pages/Doctor'
import  Myappointment  from './pages/Myappointment'
import  Appointment  from './pages/Appointment'
import Myprofile from './pages/Myprofile'
import Navbar from './components/Navbar'
import { Footer } from './components/Footer'
import TriageBot from './components/Triagebot'
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <>
        <ToastContainer />
      </>
      <div>
        <Navbar />
      </div>
      <div>
        <TriageBot/>
      </div>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/doctors" element={<Doctor />} />
          <Route path="/doctors/:speciality" element={<Doctor />} />
          <Route path="/my-appointments" element={<Myappointment />} />
          <Route path="/appointment/:docId" element={<Appointment />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/my-profile" element={<Myprofile />} />
          <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Routes>
        <Footer />  
      </div>
    </>
  );
}

export default App
