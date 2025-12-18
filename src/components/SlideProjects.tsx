import React, { useState } from "react";
import { MoreVertical, Edit2, Trash2, UserPlus, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

interface Project {
  _id: string;
  name: string;
}

interface SlideProjectsProps {
  projects: Project[];
  onEditProject?: (id: string) => void;
  onDeleteProject?: (id: string) => void;
  onAddMember?: (id: string) => void;
  onLeaveProject?: (id: string) => void; // ✅ new optional callback for employees
}

const SlideProjects: React.FC<SlideProjectsProps> = ({
  projects,
  onEditProject,
  onDeleteProject,
  onAddMember,
  onLeaveProject,
}) => {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const role = Cookies.get("role"); // ✅ get role from cookies (admin or employee)

  const toggleMenu = (projectId: string) => {
    setOpenMenu((prev) => (prev === projectId ? null : projectId));
  };

  return (
    <div className="mt-2 space-y-2">
      {projects.length > 0 ? (
        projects.map((item) => (
          <div
            key={item._id}
            className="relative group flex items-center justify-between p-2 hover:bg-[#2A3444] rounded-md cursor-pointer"
          >
            {/* Project name — click to navigate */}
            <div
              onClick={() => navigate(`/project/${item._id}`)}
              className="flex items-center gap-2 flex-1"
            >
              <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
              <span className="text-sm">{item.name}</span>
            </div>

            {/* 3-dots icon */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMenu(item._id);
              }}
              className="p-1 rounded hover:bg-[#353F52] transition"
            >
              <MoreVertical size={18} />
            </button>

            {/* Dropdown Menu — Role-based logic */}
            {openMenu === item._id && (
              <div className="absolute right-0 top-8 bg-[#23273A] text-sm rounded-md shadow-md py-1 w-44 z-50 border border-[#353F52]">
                {role === "admin" ? (
                  <>
                    {/* Admin-only options */}
                    <button
                      onClick={() => {
                        onEditProject?.(item._id);
                        setOpenMenu(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#2A3444] text-left"
                    >
                      <Edit2 size={16} /> Edit Project
                    </button>

                    <button
                      onClick={() => {
                        onAddMember?.(item._id);
                        setOpenMenu(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#2A3444] text-left"
                    >
                      <UserPlus size={16} /> Add Member
                    </button>

                    <button
                      onClick={() => {
                        onDeleteProject?.(item._id);
                        setOpenMenu(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#422b2b] text-left text-red-400"
                    >
                      <Trash2 size={16} /> Delete Project
                    </button>
                  </>
                ) : (
                  <>
                    {/* Employee-only options */}
                    <button
                      onClick={() => {
                        onLeaveProject?.(item._id);
                        setOpenMenu(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#2A3444] text-left text-red-400"
                    >
                      <LogOut size={16} /> Leave Project
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-sm">No projects found</p>
      )}
    </div>
  );
};

export default SlideProjects;
