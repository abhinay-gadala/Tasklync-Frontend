import React, { useEffect, useState } from "react";
import {
  Home,
  CheckCircle,
  Bell,
  BarChart,
  Folder,
  Target,
  Users,
  Plus,
} from "lucide-react";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { setActiveView } from "../redux/viewSlice";
import { useNavigate } from "react-router-dom";

interface Project {
  _id: string;
  name: string;
}

type SlideProps = {
  onClose?: () => void;
};

const Slide: React.FC<SlideProps> = ({ onClose }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const role = Cookies.get("role");

  useEffect(() => {
    const id = localStorage.getItem("ProjectId");
    const fetchProjectDetails = async () => {
      try {
        const token = Cookies.get("jwt_Token");
        const res = await fetch(`http://localhost:3005/project/details/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok && data.project) {
          setProjects([data.project]);
        }
      } catch (err) {
        console.error("Failed to fetch project details", err);
      }
    };
    if (id) fetchProjectDetails();
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-[#1B2432] text-white p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-2xl font-bold hidden md:block cursor-pointer"
          onClick={() => dispatch(setActiveView("home"))}
        >
          TaskFlow
        </h2>
        <button
          onClick={() => onClose && onClose()}
          className="md:hidden ml-auto text-white bg-gray-700 px-2 py-1 rounded"
          aria-label="Close sidebar"
        >
          ✕
        </button>
      </div>

      <nav className="flex flex-col mt-10">
        <button
          onClick={() => dispatch(setActiveView("home"))}
          className="flex items-center gap-2 hover:bg-[#2A3444] p-2 rounded justify-center md:justify-start"
        >
          <Home size={20} />
          <span className="md:inline">Home</span>
        </button>

        <button
          onClick={() => dispatch(setActiveView("tasks"))}
          className="flex items-center gap-2 hover:bg-[#2A3444] p-2 rounded justify-center md:justify-start"
        >
          <CheckCircle size={20} />
          <span className="md:inline">My Tasks</span>
        </button>

        <button
          onClick={() => dispatch(setActiveView("inbox"))}
          className="flex items-center gap-2 hover:bg-[#2A3444] p-2 rounded justify-center md:justify-start"
        >
          <Bell size={20} />
          <span className="md:inline">Inbox</span>
        </button>
      </nav>

      <hr className="my-6 border-[#2A3444]" />

      {role === "admin" && (
        <>
          <p className="uppercase text-gray-400 text-xs mb-2">Insights</p>

          <button
            onClick={() => dispatch(setActiveView("reporting"))}
            className="flex items-center gap-2 hover:bg-[#2A3444] p-2 rounded justify-center md:justify-start"
          >
            <BarChart size={20} />
            <span className="md:inline">Reporting</span>
          </button>

          <button
            onClick={() => dispatch(setActiveView("portfolios"))}
            className="flex items-center gap-2 hover:bg-[#2A3444] p-2 rounded justify-center md:justify-start"
          >
            <Folder size={20} />
            <span className="md:inline">Portfolios</span>
          </button>

          <button
            onClick={() => dispatch(setActiveView("goals"))}
            className="flex items-center gap-2 hover:bg-[#2A3444] p-2 rounded justify-center md:justify-start"
          >
            <Target size={20} />
            <span className="md:inline">Goals</span>
          </button>

          <hr className="my-6 border-[#2A3444]" />
        </>
      )}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <p className="uppercase text-gray-400 text-xs mb-2">Projects</p>
          {role === "admin" && (
            <button
              onClick={() => navigate("/create")}
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white px-2 py-1 rounded-lg bg-transparent hover:bg-[#2A3444] transition rounded-xl"
              title="Create Project"
            >
              <Plus size={16} />
            </button>
          )}
        </div>
      </div>
    {projects.map((item) => (
        <button
          key={item._id}
          onClick={() => dispatch(setActiveView(`project-${item.name}`))}
          className="flex items-center gap-2 p-2 hover:bg-[#2A3444] rounded justify-center md:justify-start"
        >
          <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
          <span className="md:inline">{item.name}</span>
        </button>
      ))}

      
      <hr className="my-6 border-[#2A3444]" />
      <p className="uppercase text-gray-400 text-xs mb-2">Team</p>
      <button
        onClick={() => dispatch(setActiveView("workspace"))}
        className="flex items-center gap-2 hover:bg-[#2A3444] p-2 rounded justify-center md:justify-start"
      >
        <Users size={20} />
        <span className="md:inline">My Workspace</span>
      </button>

      {role === "pending" && (
        <div className="flex flex-col gap-3 mt-8">
          <button
            onClick={() => navigate("/join")}
            className="bg-gradient-to-r from-purple-500 to-fuchsia-600 py-2 rounded-lg font-semibold text-xs md:text-sm"
          >
            Join Workspace
          </button>

          <button
            onClick={() => navigate("/create")}
            className="bg-[#2A3444] py-2 rounded-lg font-semibold hover:bg-[#353F52] text-xs md:text-sm"
          >
            Create Workspace
          </button>
        </div>
      )}
    </div>
  );
};

export default Slide;
