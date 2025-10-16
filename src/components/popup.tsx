import React from "react";

const CreateJoinPage: React.FC = () => {
  return (
    <div className="h-screen w-full bg-[#0F1120] flex items-center justify-center">
      <div className="bg-[#1A1C2A] p-14 rounded-2xl shadow-xl w-[90%] max-w-2xl text-center">

        {/* Title / Description */}
        <h2 className="text-3xl font-bold text-white mb-6">
          Start Collaborating
        </h2>
        <p className="text-gray-400 mb-10 text-lg">
          Create a new workspace or join an existing one.
        </p>

        {/* Buttons vertically like a form */}
        <div className="flex flex-col gap-6">
          <button
            className="bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white py-4 rounded-lg font-semibold text-lg shadow-md hover:opacity-90 transition"
          >
            Create Workspace
          </button>

          <button
            className="bg-[#232536] text-white py-4 rounded-lg font-semibold text-lg shadow-md border border-[#2C2F3F] hover:bg-[#2B2D42] transition"
          >
            Join Workspace
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateJoinPage;
