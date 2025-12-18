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
import SlideProjects from "./SlideProjects";

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
  const token = Cookies.get("jwt_Token");

  useEffect(() => {
  const fetchProjectDetails = async () => {
    try {
      
      const res = await fetch("http://localhost:3005/project/get", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      // ✅ Correct key: "projects"
      if (res.ok && data.projects) {
        setProjects(data.projects);
      } else {
        console.warn("No projects found or fetch failed:", data);
      }
    } catch (err) {
      console.error("Failed to fetch project details", err);
    }
  };

  fetchProjectDetails();
});

  const onDeleteProject = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3005/project/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // On successful delete, remove the project from state
        setProjects(projects.filter(p => p._id !== id));
        alert(data.message || "Project deleted successfully");
      } else {
        // Show error message from server
        alert(data.message || "Failed to delete project");
      }
    } catch (e) {
      console.error("Failed to Delete Project", e);
      alert("Failed to delete project. Please try again.");
    }
  }

  const onEditProject = async (id: string) => {
  navigate(`/edit/${id}`); // ✅ Just navigate to the edit page
};


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

<SlideProjects
  projects={projects}
  onEditProject={onEditProject}
  onDeleteProject={onDeleteProject}
  onAddMember={(id) => console.log("Add member to", id)}
/>

      
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
