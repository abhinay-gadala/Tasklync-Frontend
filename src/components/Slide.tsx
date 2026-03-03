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

  /* ---------------- Fetch Projects ---------------- */
  useEffect(() => {
    if (!token) return;

    const fetchProjectDetails = async () => {
      try {
        const res = await fetch("http://localhost:3005/project/get", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok && data.projects) {
          setProjects(data.projects);
        }
      } catch (err) {
        console.error("Failed to fetch projects", err);
      }
    };

    fetchProjectDetails();
  }, [token]);

  /* ---------------- Actions ---------------- */
  const onDeleteProject = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3005/project/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p._id !== id));
        alert(data.message || "Project deleted");
      } else {
        alert(data.message || "Delete failed");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to delete project");
    }
  };

  const onEditProject = (id: string) => {
    navigate(`/edit/${id}`);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-white text-[#0F172A] p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-2xl font-bold cursor-pointer"
          onClick={() => dispatch(setActiveView("home"))}
        >
          TaskFlow
        </h2>
        {onClose && (
          <button onClick={onClose} className="md:hidden">✕</button>
        )}
      </div>

      {/* Navigation */}
      <p className="space-y-1"></p>
      <NavItem icon={<Home size={20} />} label="Home" onClick={() => dispatch(setActiveView("home"))} />
      <NavItem icon={<CheckCircle size={20} />} label="My Tasks" onClick={() => dispatch(setActiveView("tasks"))} />
      <NavItem icon={<Bell size={20} />} label="Inbox" onClick={() => dispatch(setActiveView("inbox"))} />


      <hr className="my-6 border-[#E5E7EB]" />

      {/* Admin Insights */}
      {role === "admin" && (
        <>
          <p className="text-xs text-[#64748B] mb-2 uppercase font-medium tracking-wide">Insights</p>
          <NavItem icon={<BarChart size={20} />} label="Reporting" onClick={() => dispatch(setActiveView("reporting"))} />
          <NavItem icon={<Folder size={20} />} label="Portfolios" onClick={() => dispatch(setActiveView("portfolios"))} />
          <NavItem icon={<Target size={20} />} label="Goals" onClick={() => dispatch(setActiveView("goals"))} />
          <hr className="my-6 border-[#E5E7EB]" />
        </>
      )}

      {/* Projects */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-[#64748B] uppercase font-medium tracking-wide">Projects</p>
        {role === "admin" && (
          <button onClick={() => navigate("/create")}>
            <Plus size={16} className="text-[#64748B] hover:text-[#0F172A]" />
          </button>
        )}
      </div>

      <SlideProjects
        projects={projects}
        onEditProject={onEditProject}
        onDeleteProject={onDeleteProject}
      />

      <hr className="my-6 border-[#E5E7EB]" />

      {/* Team */}
      <NavItem
        icon={<Users size={20} />}
        label="My Workspace"
        onClick={() => dispatch(setActiveView("workspace"))}
      />
    </div>
  );
};

export default Slide;

/* ---------------- Small helper ---------------- */
const NavItem = ({ icon, label, onClick }: any) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 p-2 rounded text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
  >
    {React.cloneElement(icon, { className: "text-[#64748B]" })}
    <span className="font-medium">{label}</span>
  </button>
);
