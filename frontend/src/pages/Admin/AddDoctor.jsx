import React from "react";
import { assets } from "../../assets/adminAssets";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";

const AddDoctor = () => {
  const [docImg, setDocImg] = React.useState("");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [experience, setExperience] = React.useState("1");
  const [fees, setFees] = React.useState("");
  const [speciality, setSpeciality] = React.useState("General Physician");
  const [education, setEducation] = React.useState("");
  const [about, setAbout] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [address1, setAddress1] = React.useState("");
  const [address2, setAddress2] = React.useState("");

  const { backendUrl, atoken } = React.useContext(AdminContext);

  const OnSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (!docImg) {
        setLoading(false);
        return toast.error("Please upload doctor's image");
      }

      const formData = new FormData();
      formData.append("image", docImg);
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("speciality", speciality);
      formData.append("experience", experience);
      formData.append("degree", education);
      formData.append("about", about);
      formData.append("fees", Number(fees));
      formData.append("address", JSON.stringify({ line1: address1, line2: address2 }));
      formData.append("date", Date.now());

      const { data } = await axios.post(
        backendUrl + "/api/admin/add-doctor",
        formData,
        { headers: { atoken } }
      );

      if (data.success) {
        toast.success(data.message);
        setName("");
        setEmail("");
        setPassword("");
        setExperience("1");
        setFees("");
        setSpeciality("General Physician");
        setEducation("");
        setAddress1("");
        setAddress2("");
        setAbout("");
        setDocImg("");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Add Doctor</h1>
        <p className="text-sm text-slate-500 font-medium">Create a new medical specialist profile</p>
      </div>

      <form
        onSubmit={OnSubmitHandler}
        className="bg-white border border-slate-200/60 px-6 sm:px-8 py-8 rounded-2xl w-full shadow-sm text-slate-700"
      >
        {/* Upload Image */}
        <div className="flex items-center gap-4 mb-8">
          <label htmlFor="doc-img" className="cursor-pointer group">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border border-slate-200 shadow-sm bg-slate-50 flex items-center justify-center">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
                alt="upload"
              />
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center" />
            </div>
          </label>
          <input
            onChange={(e) => setDocImg(e.target.files[0])}
            type="file"
            id="doc-img"
            className="hidden"
          />
          <p className="text-xs font-bold text-slate-500 leading-normal">
            Upload Doctor
            <br />
            Profile Picture
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-10">
          {/* Left Column */}
          <div className="flex flex-col gap-5 w-full lg:w-1/2">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Doctor Name
              </label>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                type="text"
                placeholder="Enter full name"
                required
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white font-semibold text-slate-700 placeholder-slate-400 transition duration-150"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Doctor Email
              </label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="Email"
                required
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white font-semibold text-slate-700 placeholder-slate-400 transition duration-150"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Doctor Password
              </label>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type="password"
                placeholder="Password"
                required
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white font-semibold text-slate-700 placeholder-slate-400 transition duration-150"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Experience
              </label>
              <select
                onChange={(e) => setExperience(e.target.value)}
                value={experience}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white font-semibold text-slate-700 transition duration-150 cursor-pointer"
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
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Consultation Fees (INR)
              </label>
              <input
                onChange={(e) => setFees(e.target.value)}
                value={fees}
                type="number"
                placeholder="Consultation fees"
                required
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white font-semibold text-slate-700 placeholder-slate-400 transition duration-150"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-5 w-full lg:w-1/2">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Speciality
              </label>
              <select
                onChange={(e) => setSpeciality(e.target.value)}
                value={speciality}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white font-semibold text-slate-700 transition duration-150 cursor-pointer"
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
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Education / Degree
              </label>
              <input
                onChange={(e) => setEducation(e.target.value)}
                value={education}
                type="text"
                placeholder="Degree / Qualification"
                required
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white font-semibold text-slate-700 placeholder-slate-400 transition duration-150"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Clinic Address
              </label>
              <input
                onChange={(e) => setAddress1(e.target.value)}
                value={address1}
                type="text"
                placeholder="Address Line 1"
                required
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white font-semibold text-slate-700 placeholder-slate-400 transition duration-150"
              />
              <input
                onChange={(e) => setAddress2(e.target.value)}
                value={address2}
                type="text"
                placeholder="Address Line 2"
                required
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs mt-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white font-semibold text-slate-700 placeholder-slate-400 transition duration-150"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Biography / About
              </label>
              <textarea
                onChange={(e) => setAbout(e.target.value)}
                value={about}
                rows="4"
                placeholder="Write about the doctor..."
                required
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white font-semibold text-slate-700 resize-none leading-normal transition duration-150"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 text-center w-full">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 bg-teal-600 text-white text-xs font-bold tracking-wider rounded-full hover:bg-teal-700 active:scale-95 hover:scale-105 transition-all duration-200 cursor-pointer shadow-md shadow-teal-700/10 hover:shadow-lg border border-teal-500/20"
          >
            {loading ? "Adding..." : "Add Doctor Profile"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDoctor;
