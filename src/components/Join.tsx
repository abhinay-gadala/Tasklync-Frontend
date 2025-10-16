import React from "react";

const JoinWorkspace: React.FC = () => {
  return (
    <div className="h-screen w-full bg-[#0F1120] flex items-center justify-center">
      <div className="bg-[#1A1C2A] p-10 rounded-xl shadow-xl w-[90%] max-w-md">
        <h2 className="text-4xl font-bold text-white text-center mb-8">
          Join Workspace
        </h2>

        <form className="flex flex-col gap-6">

          {/* Workspace Code */}
          <div className="flex flex-col gap-2">
            <label className="text-white text-lg font-medium">Workspace Code</label>
            <input
              type="text"
              placeholder="e.g., ALPHA123"
              className="bg-[#232536] text-white px-4 py-3 rounded-lg focus:outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-500 to-fuchsia-600 text-xl text-white py-3 rounded-lg font-semibold shadow-md hover:opacity-90 transition"
          >
            Join Workspace
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinWorkspace;
