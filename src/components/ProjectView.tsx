import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";

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

  useEffect(() => {
    if (!projectId) return;

    const fetchProject = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:3005/project/details/${projectId}`,
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

  if (loading) {
    return <p className="text-gray-400">Loading project...</p>;
  }

  if (!project) {
    return <p className="text-red-400">Project not found or access denied</p>;
  }

  return (
    <div className="space-y-6">
      {/* ---------------- Header ---------------- */}
      <div>
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <p className="text-gray-400">
          {project.members.length} members • {project.tasks.length} tasks
        </p>
      </div>

      {/* ---------------- Members ---------------- */}
      <section className="bg-[#121218] p-5 rounded-lg">
        <h2 className="font-semibold mb-3">Members</h2>

        <div className="flex flex-wrap gap-3">
          {project.members.map((m) => (
            <div
              key={m._id}
              className="px-3 py-1 bg-[#1f2937] rounded-full text-sm"
            >
              {m.name}
              {m.role === "admin" && (
                <span className="ml-2 text-xs text-purple-400">(Admin)</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Tasks ---------------- */}
      <section className="bg-[#121218] p-5 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">Tasks</h2>

          {project.userRole === "admin" && (
            <button className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm">
              + New Task
            </button>
          )}
        </div>

        {project.tasks.length === 0 ? (
          <p className="text-gray-400">No tasks in this project</p>
        ) : (
          <div className="space-y-3">
            {project.tasks.map((task) => (
              <div
                key={task._id}
                className="bg-[#1A1C2A] p-4 rounded-md flex justify-between items-start"
              >
                {/* Left */}
                <div>
                  <h3 className="font-medium">{task.title}</h3>

                  {task.description && (
                    <p className="text-sm text-gray-400 mt-1">
                      {task.description}
                    </p>
                  )}

                  <p className="text-xs text-gray-400 mt-2">
                    Priority:{" "}
                    <span className="text-gray-200">
                      {task.priority || "—"}
                    </span>
                    {" • "}
                    Due:{" "}
                    <span className="text-gray-200">
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : "—"}
                    </span>
                  </p>

                  {task.assignedTo && (
                    <p className="text-xs text-purple-300 mt-1">
                      Assigned to: {task.assignedTo.name}
                    </p>
                  )}
                </div>

                {/* Right - Status */}
                <span
                  className={`text-xs px-2 py-1 rounded capitalize ${
                    task.status === "done"
                      ? "bg-green-600"
                      : task.status === "in-progress"
                      ? "bg-yellow-600"
                      : "bg-gray-600"
                  }`}
                >
                  {task.status}
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

