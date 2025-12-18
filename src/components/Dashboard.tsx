// Dashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { FiLock } from "react-icons/fi";
import { AiOutlinePlus, AiOutlineCalendar } from "react-icons/ai";
import { MdOutlineCheckCircle } from "react-icons/md";

interface Project {
  _id: string;
  name: string;
  tasks?: { status: string }[];
}

interface Task {
  _id: string;
  title: string;
  status: string;
  projectId?: string;
  dueDate?: string | null;
  assignedTo?: string | null;
}

const formatDateShort = (iso?: string | null) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
};

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "overdue" | "completed">(
    "upcoming"
  );

  const navigate = useNavigate();
  // const role = Cookies.get("role");
  const name = localStorage.getItem("customerName");
  const token = Cookies.get("jwt_Token");

  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [projRes, taskRes] = await Promise.all([
          fetch("http://localhost:3005/project/get", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:3005/task", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (projRes.ok) {
          const projData = await projRes.json();
          if (mounted) setProjects(projData.projects || []);
        } else {
          console.error("Failed to fetch projects");
        }

        if (taskRes.ok) {
          const taskData = await taskRes.json();
          if (mounted) setTasks(taskData.tasks || []);
        } else {
          console.error("Failed to fetch tasks");
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      mounted = false;
    };
  }, [token]);

  const projectMap = useMemo(() => {
    const m = new Map<string, Project>();
    projects.forEach((p) => m.set(p._id, p));
    return m;
  }, [projects]);

  const filteredTasks = useMemo(() => {
    const now = new Date();
    const upcoming: Task[] = [];
    const overdue: Task[] = [];
    const completed: Task[] = [];

    for (const t of tasks) {
      if (t.status === "done") {
        completed.push(t);
      } else {
        if (t.dueDate) {
          const due = new Date(t.dueDate);
          if (due < now) overdue.push(t);
          else upcoming.push(t);
        } else {
          upcoming.push(t);
        }
      }
    }

    if (activeTab === "upcoming") return upcoming;
    if (activeTab === "overdue") return overdue;
    return completed;
  }, [tasks, activeTab]);

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center" style={{ background: "#07112a" }}>
        <ClipLoader color="#e72be4" size={60} />
      </div>
    );
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const pendingTasks = tasks.filter((t) => t.status !== "done").length;

  return (
    <div className="min-h-screen text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-semibold">Good afternoon, {name || "unknown"}</h1>
        <p className="text-gray-400 mt-2">Welcome back — here's what's happening in your workspace</p>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1a202c] p-6 rounded-xl shadow-inner">
          <p className="text-gray-400 text-sm">Projects</p>
          <p className="text-2xl font-bold mt-2">{projects.length}</p>
        </div>
        <div className="bg-[#1a202c] p-6 rounded-xl shadow-inner">
          <p className="text-gray-400 text-sm">Total Tasks</p>
          <p className="text-2xl font-bold mt-2">{totalTasks}</p>
        </div>
        <div className="bg-[#1a202c] p-6 rounded-xl shadow-inner">
          <p className="text-gray-400 text-sm">Completed</p>
          <p className="text-2xl font-bold mt-2 text-green-400">{completedTasks}</p>
        </div>
        <div className="bg-[#1a202c] p-6 rounded-xl shadow-inner">
          <p className="text-gray-400 text-sm">Pending</p>
          <p className="text-2xl font-bold mt-2 text-yellow-400">{pendingTasks}</p>
        </div>
      </div>

      {/* My tasks (wide) */}
      <div className="bg-[#0b0f17] rounded-xl p-6 max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center text-black font-semibold">
              {name ? name.charAt(0).toLowerCase() : "un"}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">My tasks</h2>
                <span className="text-gray-400 flex items-center gap-1 text-sm"><FiLock /></span>
              </div>
              <p className="text-gray-400 text-sm mt-1">Upcoming • Overdue • Completed</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-gray-400 text-sm">My week</p>
            <p className="text-gray-500 text-xs mt-1">0 tasks completed • 0 collaborators</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 border-b border-gray-800">
          <nav className="flex gap-6">
            <button
              className={`pb-3 ${activeTab === "upcoming" ? "text-white border-b-2 border-purple-500" : "text-gray-400"}`}
              onClick={() => setActiveTab("upcoming")}
            >
              Upcoming
            </button>
            <button
              className={`pb-3 ${activeTab === "overdue" ? "text-white border-b-2 border-purple-500" : "text-gray-400"}`}
              onClick={() => setActiveTab("overdue")}
            >
              Overdue
            </button>
            <button
              className={`pb-3 ${activeTab === "completed" ? "text-white border-b-2 border-purple-500" : "text-gray-400"}`}
              onClick={() => setActiveTab("completed")}
            >
              Completed
            </button>
          </nav>
        </div>

        {/* Create task row */}
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/create-task")}
            className="flex items-center gap-2 text-sm text-purple-300 hover:text-white"
          >
            <AiOutlinePlus /> Create task
          </button>

          <div className="text-xs text-gray-500 flex items-center gap-2">
            <AiOutlineCalendar /> <span>Today</span>
          </div>
        </div>

        {/* Task list */}
        <div className="mt-6 space-y-3">
          {filteredTasks.length === 0 ? (
            <p className="text-gray-400">No tasks — enjoy your day 😌</p>
          ) : (
            filteredTasks.map((t) => {
              const proj = t.projectId ? projectMap.get(t.projectId) : undefined;
              return (
                <div
                  key={t._id}
                  className="bg-gray-900 p-4 rounded-lg flex justify-between items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-green-400"><MdOutlineCheckCircle size={20} /></div>
                    <div>
                      <h3 className="text-base font-medium">{t.title}</h3>
                      <p className="text-sm text-gray-400">{t.status}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {proj ? (
                      <div className="text-xs px-3 py-1 rounded-full bg-[#1b2430] text-gray-200">
                        {proj.name.length > 12 ? proj.name.slice(0, 12) + "…" : proj.name}
                      </div>
                    ) : (
                      <div className="text-xs px-3 py-1 rounded-full bg-[#1b2430] text-gray-200">No project</div>
                    )}

                    <div className="text-xs text-gray-400">{formatDateShort(t.dueDate)}</div>

                    <button
                      onClick={() => navigate(`/task/${t._id}`)}
                      className="text-purple-400 hover:text-purple-300 text-sm"
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
