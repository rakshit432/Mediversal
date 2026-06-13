import React from "react";
import { assets } from "../../assets/adminAssets";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";

const AddDoctor = () => {

   const [docImg,setDocImg]=React.useState("");
   const [name,setName]=React.useState("");
   const [email,setEmail]=React.useState("");
   const [password,setPassword]=React.useState("");
   const [experience,setExperience]=React.useState("1");
   const [fees,setFees]=React.useState("");
    const [speciality,setSpeciality]=React.useState("General Physician");
    const [education,setEducation]=React.useState("");
    const [address,setAddress]=React.useState("");
    const [about,setAbout]=React.useState("");
    const [loading,setLoading]=React.useState(false);
    const [address1,setAddress1]=React.useState("");
    const [address2,setAddress2]=React.useState("");
    
    const { backendUrl, atoken } = React.useContext(AdminContext);

    const OnSubmitHandler = async(event) => {
    event.preventDefault();
    setLoading(true);

    try{
      if(!docImg)
      {
        return toast.error("Please upload doctor's image");
      }

      const formData = new FormData();
        formData.append('image',docImg);
        formData.append('name',name);
        formData.append('email',email);
        formData.append('password',password);
        formData.append('speciality',speciality);
        formData.append('experience',experience);
        formData.append('degree',education);
        formData.append('about',about);
        formData.append('fees',Number(fees));
        formData.append('address',JSON.stringify({line1:address1,line2:address2}));
        formData.append('date',Date.now());
       
        const {data} = await axios.post(backendUrl + '/api/admin/add-doctor', formData, { headers: { atoken: atoken } })  
        if(data.success){
          toast.success(data.message);
            setName("");
            setEmail("");
            setPassword("");
            setExperience("1");
            setFees("");
            setSpeciality("General Physician");
            setEducation("");
            setAddress("");
            setAbout("");
            setDocImg(false);
            setLoading(false);
        }

        else
        {
            toast.error(data.message);
        }
    }

        catch(err){
            setLoading(false);
            console.log(err);
            toast.error(err.response?.data?.message || "An error occurred");
        }
    }
   
  return (
    <form onSubmit={OnSubmitHandler} className="m-5 w-full">
      <p className="mb-3 text-lg font-semibold text-slate-800">Add Doctor</p>

      <div className="bg-white px-8 py-8 border border-slate-100 rounded-xl w-full max-w-4xl max-h-[85vh] overflow-y-scroll shadow-sm scrollbar-hide text-slate-700">
        {/* Upload Image */}
        <div className="flex items-center gap-4 mb-8">
          <label htmlFor="doc-img" className="cursor-pointer">
            <img
              className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full object-cover shadow-inner"
              src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
              alt="upload"
            />
          </label>
          <input onChange={(e)=>setDocImg(e.target.files[0])} type="file" id="doc-img" className="hidden" />
          <p className="text-sm font-semibold text-slate-500 leading-normal">
            Upload Doctor<br />Profile Picture
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-10">
          {/* Left Column */}
          <div className="flex flex-col gap-4 w-full lg:w-1/2">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Doctor Name</label>
              <input onChange={(e)=>setName(e.target.value)} value={name} 
                type="text"
                placeholder="Enter full name"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Doctor Email</label>
              <input onChange={(e)=>setEmail(e.target.value)} value={email}
                type="email"
                placeholder="Email"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Doctor Password</label>
              <input onChange={(e)=>setPassword(e.target.value)} value={password}
                type="password"
                placeholder="Password"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Experience</label>
              <select onChange={(e)=>setExperience(e.target.value)} value={experience}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="1">1 Year</option>
                <option value="2">2 Years</option>
                <option value="3">3 Years</option>
                <option value="4">4 Years</option>
                <option value="5">5 Years</option>
                <option value="6">6 Years</option>
                <option value="7">7 Years</option>
                <option value="8">8 Years</option>
                <option value="9">9 Years</option>
                <option value="10">10+ Years</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Consultation Fees (INR)</label>
              <input onChange={(e)=>setFees(e.target.value)} value={fees}
                type="number"
                placeholder="Consultation fees"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4 w-full lg:w-1/2">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Speciality</label>
              <select onChange={(e)=>setSpeciality(e.target.value)} value={speciality}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="General physician">General Physician</option>
                <option value="Gynecologist">Gynecologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Gastroenterologist">Gastroenterologist</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Education / Degree</label>
              <input onChange={(e)=>setEducation(e.target.value)} value={education}
                type="text"
                placeholder="Degree / Qualification"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Clinic Address</label>
              <input onChange={(e)=>setAddress1(e.target.value)} value={address1}
                type="text"
                placeholder="Address Line 1"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <input onChange={(e)=>setAddress2(e.target.value)} value={address2}
                type="text"
                placeholder="Address Line 2"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Biography / About</label>
              <textarea onChange={(e)=>setAbout(e.target.value)} value={about}
                rows="4"
                placeholder="Write about the doctor..."
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none leading-normal"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 text-center w-full">
          <button
            type="submit"
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-2.5 rounded-lg shadow-sm transition cursor-pointer"
          >
            {loading ? "Adding..." : "Add Doctor"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default AddDoctor;
