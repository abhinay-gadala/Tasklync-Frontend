import React, { useState } from "react";
import { MoreVertical, Edit2, Trash2, LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
import { openProject } from "../redux/viewSlice";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

interface Project {
  _id: string;
  name: string;
}

interface Props {
  projects: Project[];
  onEditProject: (id: string) => void;
  onDeleteProject: (id: string) => Promise<void>;
}

const SlideProjects: React.FC<Props> = ({ projects, onEditProject, onDeleteProject }) => {
  const dispatch = useDispatch();

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const role = Cookies.get("role");
  const token = Cookies.get("jwt_Token");

  /* ---------------- handlers ---------------- */

  const handleLeaveProject = async (projectId: string) => {
    if (!window.confirm("Leave this project?")) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/project/leave/${projectId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("You left the project");
        window.location.reload();
      } else {
        toast.error(data.message || "Failed to leave project");
      }
    } catch (err) {
      console.error("Leave project error:", err);
      toast.error("Something went wrong");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-1 mt-2">
      {projects.length === 0 && (
        <p className="text-[#64748B] text-sm px-3">No projects found</p>
      )}

      {projects.map((project) => (
        <div
          key={project._id}
          className="relative flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#F1F5F9] text-[#0F172A] transition-colors group"
        >
          {/* Project click */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => dispatch(openProject(project._id))}
          >
            <div className="w-2.5 h-2.5 bg-purple-500 rounded-full" />
            <span className="text-sm font-medium">{project.name}</span>
          </div>

          {/* 3 dots */}
          <button
            className="p-1.5 rounded-md text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] opacity-0 group-hover:opacity-100 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu(openMenu === project._id ? null : project._id);
            }}
          >
            <MoreVertical size={16} />
          </button>

          {/* Dropdown */}
          {openMenu === project._id && (
            <div className="absolute right-2 top-10 w-40 bg-white rounded-lg shadow-lg border border-[#E5E7EB] z-50 overflow-hidden">
              {role === "admin" ? (
                <>
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
                    onClick={() => {
                      onEditProject(project._id);
                      setOpenMenu(null);
                    }}
                  >
                    <Edit2 size={14} /> Edit Project
                  </button>

                  <button
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    onClick={() => {
                      onDeleteProject(project._id);
                      setOpenMenu(null);
                    }}
                  >
                    <Trash2 size={14} /> Delete Project
                  </button>
                </>
              ) : (
                <button
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  onClick={() => {
                    handleLeaveProject(project._id);
                    setOpenMenu(null);
                  }}
                >
                  <LogOut size={14} /> Leave Project
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SlideProjects;
