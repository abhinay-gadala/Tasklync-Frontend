import React from "react";

const CreateWorkspace: React.FC = () => {
  return (
    <div className="h-screen w-full bg-[#0F1120] flex items-center justify-center">
      <div className="bg-[#1A1C2A] p-10 rounded-xl shadow-xl w-[90%] max-w-2xl">
        <h2 className="text-4xl font-bold text-white text-center mb-8">
          Create Workspace
        </h2>

        <form className="flex flex-col gap-6">

          {/* Workspace Name */}
          <div className="flex flex-col gap-2">
            <label className="text-white text-lg font-medium">Workspace Name</label>
            <input
              type="text"
              placeholder="e.g., Project Alpha"
              className="bg-[#232536] text-white px-4 py-3 rounded-lg focus:outline-none"
            />
          </div>

          {/* Company Name */}
          <div className="flex flex-col gap-2">
            <label className="text-white text-lg  font-medium">Company Name</label>
            <input
              type="text"
              placeholder="e.g., TechNova Pvt Ltd"
              className="bg-[#232536] text-white px-4 py-3 rounded-lg focus:outline-none"
            />
          </div>

          {/* Company Email */}
          <div className="flex flex-col gap-2">
            <label className="text-white text-lg font-medium">Company Email</label>
            <input
              type="email"
              placeholder="e.g., contact@technova.com"
              className="bg-[#232536] text-white px-4 py-3 rounded-lg focus:outline-none"
            />
          </div>

          {/* Company Address */}
          <div className="flex flex-col gap-2">
            <label className="text-white text-lg font-medium">Company Address</label>
            <input
              type="text"
              placeholder="e.g., Hyderabad, India"
              className="bg-[#232536] text-white px-4 py-3 rounded-lg focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-500 to-fuchsia-600 text-xl text-white py-3 rounded-lg font-semibold shadow-md hover:opacity-90 transition"
          >
            Create Workspace
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateWorkspace;
