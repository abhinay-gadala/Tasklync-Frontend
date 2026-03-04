import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  priority?: string;
  dueDate?: string;
  assignedTo?: User | null;
  createdBy?: User | null;
}

interface Project {
  _id: string;
  name: string;
  members: User[];
  tasks: Task[];
  userRole: "admin" | "member";
  adminId?: string;
}

interface Props {
  projectId?: string;
}

const ProjectView: React.FC<Props> = ({ projectId: propProjectId }) => {
  const { projectId: paramProjectId } = useParams<{ projectId: string }>();
  const projectId = propProjectId || paramProjectId;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const token = Cookies.get("jwt_Token");
  const currentUserId = localStorage.getItem("userId");
  const currentUserRole = Cookies.get("role");

  useEffect(() => {
    if (!projectId) return;

    const fetchProject = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/project/details/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
          }
        );

        const data = await res.json();

        if (res.ok) {
          setProject(data.project);
        } else {
          console.error(data.message);
          setProject(null);
        }
      } catch (err) {
        console.error("Failed to load project", err);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, token]);

  const handleDeleteMember = async (targetUserId: string) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/${targetUserId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setProject((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            members: prev.members.filter((m) => m._id !== targetUserId),
          };
        });
        toast.success("Member removed successfully");
      } else {
        toast.error(data.message || "Failed to remove member");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error removing member");
    }
  };

  if (loading) {
    return <p className="text-[#64748B] mt-8 text-center font-medium">Loading project...</p>;
  }

  if (!project) {
    return <p className="text-red-500 mt-8 text-center font-medium">Project not found or access denied</p>;
  }

  return (
    <div className="space-y-6 lg:space-y-8 p-6 lg:p-8 bg-[#F8FAFC] min-h-screen text-[#0F172A]">
      {/* ---------------- Header ---------------- */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">{project.name}</h1>
        <p className="text-[#64748B] font-medium">
          {project.members.length} members • {project.tasks.length} tasks
        </p>
      </div>

      {/* ---------------- Members ---------------- */}
      <section className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <h2 className="font-semibold text-lg tracking-tight mb-4">Members</h2>

        <div className="flex flex-wrap gap-3">
          {project.members.map((m) => (
            <div
              key={m._id}
              className="px-4 py-1.5 bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm rounded-full text-sm font-medium flex items-center gap-2"
            >
              <span>{m.name}</span>
              {m.role === "admin" && (
                <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">Admin</span>
              )}

              {/* Delete Member Button */}
              {currentUserRole === "admin" && m._id !== currentUserId && project.adminId === currentUserId && (
                <button
                  onClick={() => handleDeleteMember(m._id)}
                  className="ml-2 text-slate-400 hover:text-red-500 transition-colors focus:outline-none"
                  title="Remove member"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Tasks ---------------- */}
      <section className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-semibold text-lg tracking-tight">Tasks</h2>

          {(project.userRole === "admin" || currentUserRole === "admin") && (
            <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-colors text-sm">
              + New Task
            </button>
          )}
        </div>

        {project.tasks.length === 0 ? (
          <p className="text-[#64748B] text-center py-4">No tasks in this project</p>
        ) : (
          <div className="space-y-4">
            {project.tasks.map((task) => (
              <div
                key={task._id}
                className="bg-[#F8FAFC] p-5 rounded-xl border border-[#E5E7EB] shadow-sm flex flex-col md:flex-row md:justify-between md:items-start gap-4 transition-all hover:bg-white hover:shadow-md"
              >
                {/* Left */}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg tracking-tight text-[#0F172A]">{task.title}</h3>

                  {task.description && (
                    <p className="text-sm text-[#64748B] mt-1.5 leading-relaxed">
                      {task.description}
                    </p>
                  )}

                  <div className="text-xs text-[#64748B] mt-4 flex flex-wrap gap-2 items-center">
                    <span className="bg-white border border-[#E5E7EB] px-2 py-1 rounded shadow-sm">
                      Priority: <span className="text-[#0F172A] font-semibold">{task.priority || "—"}</span>
                    </span>
                    <span className="bg-white border border-[#E5E7EB] px-2 py-1 rounded shadow-sm">
                      Due:{" "}
                      <span className="text-[#0F172A] font-semibold">
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                          : "—"}
                      </span>
                    </span>
                  </div>

                  {task.assignedTo && (
                    <p className="text-xs font-semibold text-purple-600 mt-3 inline-block bg-purple-50 px-2 py-1 rounded border border-purple-100">
                      Assigned to: {task.assignedTo.name}
                    </p>
                  )}
                </div>

                {/* Right - Status */}
                <span
                  className={`text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded-full border ${task.status === "done"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                    : task.status === "in-progress"
                      ? "bg-amber-50 text-amber-600 border-amber-200"
                      : "bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                >
                  {task.status.replace("-", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProjectView;

