import React from "react";
import { useNavigate } from "react-router-dom";

const CreateJoinPage: React.FC = () => {
  const navigate = useNavigate();


  const handleCreate = () => {
    navigate("/create", { replace: true })


  }

  const handleJoin = () => {
    navigate("/join", { replace: true })

  }

  return (
    <div className="h-screen w-full bg-[#F8FAFC] flex items-center justify-center">
      <div className="bg-white p-14 rounded-2xl border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] w-[90%] max-w-2xl text-center">

        {/* Title / Description */}
        <h2 className="text-4xl font-bold tracking-tight text-[#0F172A] mb-4">
          Start Collaborating
        </h2>
        <p className="text-[#64748B] font-medium mb-12 text-lg">
          Create a new workspace or join an existing one.
        </p>

        {/* Buttons vertically like a form */}
        <div className="flex flex-col gap-5">
          <button
            className="bg-purple-600 text-white py-4 rounded-xl font-medium text-lg shadow-sm hover:bg-purple-700 hover:shadow-md transition-all"
            onClick={handleCreate}
          >
            Create Workspace
          </button>

          <button
            className="bg-[#F8FAFC] text-[#0F172A] py-4 rounded-xl font-medium text-lg border border-[#E5E7EB] shadow-sm hover:bg-white hover:shadow-md transition-all"
            onClick={handleJoin}
          >
            Join Workspace
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateJoinPage;
