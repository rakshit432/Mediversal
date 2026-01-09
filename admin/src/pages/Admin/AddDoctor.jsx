import React from "react";
import { assets } from "../../assets/assets";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";

const AddDoctor = () => {

   const [docImg,setDocImg]=React.useState("");
   const [name,setName]=React.useState("");
   const [email,setEmail]=React.useState("");
   const [password,setPassword]=React.useState("");
   const [experience,setExperience]=React.useState("");
   const [fees,setFees]=React.useState("");
    const [speciality,setSpeciality]=React.useState("");
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

        //console log formdata

        formData.forEach((value,key)=>{
          console.log(key,value);
        })
       
        const {data} = await axios.post(backendUrl + '/api/admin/add-doctor', formData, { headers: { atoken: atoken } })  
        if(data.success){
          toast.success(data.message);
            setName("");
            setEmail("");
            setPassword("");
            setExperience("");
            setFees("");
            setSpeciality("");
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
      <p className="mb-3 text-lg font-medium text-gray-700">Add Doctor</p>

      <div className="bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll shadow-sm">
        {/* Upload Image */}
        <div className="flex items-center gap-4 mb-8 text-gray-600">
          <label htmlFor="doc-img" className="cursor-pointer">
            <img
              className="w-16 h-16 bg-gray-100 rounded-full object-cover"
              src={docImg ?URL.createObjectURL(docImg) :assets.upload_area}
              alt="upload"
            />
          </label>
          <input onChange={(e)=>setDocImg(e.target.files[0])} type="file" id="doc-img" className="hidden" />
          <p>
            Upload Image
            <br />
            Picture
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-10 text-gray-600">
          {/* Left Column */}
          <div className="flex flex-col gap-4">
            <div>
              <p>Doctor Name</p>
              <input onChange={(e)=>setName(e.target.value)} value={name} 
                type="text"
                placeholder="Enter full name"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <p>Doctor Email</p>
              <input onChange={(e)=>setEmail(e.target.value)} value={email}
                type="text"
                placeholder="Email"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <p>Doctor Password</p>
              <input onChange={(e)=>setPassword(e.target.value)} value={password}
                type="text"
                placeholder="Password"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <p>Experience</p>
              <select onChange={(e)=>setExperience(e.target.value)} value={experience}
                name=""
                id=""
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <option value="10">10 Years</option>
              </select>
            </div>

            <div>
              <p>Fees</p>
              <input onChange={(e)=>setFees(e.target.value)} value={fees}
                type="number"
                placeholder="fees"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4">
            <div>
              <p>Speciality</p>
              <select onChange={(e)=>setSpeciality(e.target.value)} value={speciality}
                name=""
                id=""
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="General Physician">General Physician</option>
                <option value="Gynecologist">Gynecologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Gastroenterologist">Gastroenterologist</option>
              </select>
            </div>

            <div>
              <p>Education</p>
              <input onChange={(e)=>setEducation(e.target.value)} value={education}
                type="text"
                placeholder="Education"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <p>Address</p>
              <input onChange={(e)=>setAddress1(e.target.value)} value={address1}
                type="text"
                placeholder="address 1"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input onChange={(e)=>setAddress2(e.target.value)} value={address2}
                type="text"
                placeholder="address 2"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <p>About Doctor</p>
              <textarea onChange={(e)=>setAbout(e.target.value)} value={about}
                name=""
                rows="5"
                placeholder="Write about doctor..."
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              ></textarea>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 text-center w-full">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md shadow-sm transition"
            >
              Add doctor
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default AddDoctor;
