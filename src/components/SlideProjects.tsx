import React, { useState } from "react";
import { MoreVertical, Edit2, Trash2, LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
import { openProject } from "../redux/viewSlice";
import Cookies from "js-cookie";

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
      const res = await fetch(
        `http://localhost:3005/project/leave/${projectId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("You left the project");
        window.location.reload();
      } else {
        alert(data.message || "Failed to leave project");
      }
    } catch (err) {
      console.error("Leave project error:", err);
      alert("Something went wrong");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-2 mt-2">
      {projects.length === 0 && (
        <p className="text-gray-500 text-sm">No projects found</p>
      )}

      {projects.map((project) => (
        <div
          key={project._id}
          className="relative flex items-center justify-between px-3 py-2 rounded-md hover:bg-[#2A3444]"
        >
          {/* Project click */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => dispatch(openProject(project._id))}
          >
            <div className="w-3 h-3 bg-cyan-400 rounded-full" />
            <span className="text-sm">{project.name}</span>
          </div>

          {/* 3 dots */}
          <button
            className="p-1 rounded hover:bg-[#353F52]"
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu(openMenu === project._id ? null : project._id);
            }}
          >
            <MoreVertical size={16} />
          </button>

          {/* Dropdown */}
          {openMenu === project._id && (
            <div className="absolute right-2 top-10 w-40 bg-[#23273A] rounded-md shadow-lg border border-[#353F52] z-50">
              {role === "admin" ? (
                <>
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#2A3444]"
                    onClick={() => {
                      onEditProject(project._id);
                      setOpenMenu(null);
                    }}
                  >
                    <Edit2 size={14} /> Edit Project
                  </button>

                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-[#422b2b]"
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
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-[#422b2b]"
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
