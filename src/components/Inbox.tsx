import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";

type StatusKey = "todo" | "in-progress" | "done" | string;

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: StatusKey;
  priority?: string;
  dueDate?: string | null;
  createdAt?: string;
  project?: { _id?: string; name?: string } | string | null;
  assignedTo?: { _id: string; name?: string } | null;
}

const Inbox: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const token = Cookies.get("jwt_Token");
  const userId = String(localStorage.getItem("userId") || "");

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3005/task", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Inbox fetch error:", data);
        setTasks([]);
        return;
      }

      const all: Task[] = Array.isArray(data.tasks) ? data.tasks : [];

      // ✅ inbox is only tasks assigned to current user
      const mine = all.filter(
        (t) => t.assignedTo && String(t.assignedTo._id) === userId
      );

      setTasks(mine);
    } catch (err) {
      console.error("Inbox fetch error:", err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // helper: check overdue
  const isOverdue = (task: Task) => {
    if (!task.dueDate) return false;
    if (task.status === "done") return false;
    const due = new Date(task.dueDate);
    const today = new Date();
    // ignore time part – compare dates only
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  // derived lists
  const overdueTasks = tasks.filter(isOverdue);

  // "notifications" = not done tasks sorted by createdAt (newest first)
  const notifications = [...tasks]
    .filter((t) => t.status !== "done")
    .sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    });

  if (loading) {
    return (
      <div className="h-screen bg-[#F8FAFC] text-[#0F172A] flex items-center justify-center">
        Loading inbox...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6 tracking-tight">Inbox</h1>

      {/* --- Assigned to you section (acts like notifications) --- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 tracking-tight">Assigned to you</h2>
        {notifications.length === 0 ? (
          <p className="text-[#64748B] text-sm">No active tasks assigned to you 🎉</p>
        ) : (
          <div className="space-y-4 max-w-5xl">
            {notifications.map((task) => (
              <div
                key={task._id}
                className="bg-white p-5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#E5E7EB] flex justify-between items-start transition-shadow hover:shadow-md"
              >
                <div>
                  <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide">
                    {task.status === "todo"
                      ? "New task assigned"
                      : "Task updated"}
                  </p>
                  <h3 className="font-semibold text-lg text-[#0F172A] mt-1 tracking-tight">{task.title}</h3>
                  {task.description && (
                    <p className="text-sm text-[#64748B] mt-1.5 leading-relaxed">
                      {task.description}
                    </p>
                  )}
                  {task.project && (
                    <p className="text-xs font-medium text-purple-600 mt-2">
                      Project:{" "}
                      {typeof task.project === "string"
                        ? task.project
                        : task.project?.name}
                    </p>
                  )}
                  {task.priority && (
                    <p className="text-xs mt-1.5 font-medium text-[#64748B]">
                      Priority:{" "}
                      <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {task.priority}
                      </span>
                    </p>
                  )}
                </div>

                <div className="text-right text-xs">
                  {task.dueDate && (
                    <p
                      className={
                        isOverdue(task)
                          ? "text-red-500 font-medium"
                          : "text-[#64748B] font-medium"
                      }
                    >
                      {isOverdue(task) ? "Overdue" : "Due"}:{" "}
                      {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}
                  {task.createdAt && (
                    <p className="text-[#94A3B8] mt-1 font-medium">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* --- Overdue section --- */}
      <section>
        <h2 className="text-xl font-semibold mb-4 tracking-tight">Overdue</h2>
        {overdueTasks.length === 0 ? (
          <p className="text-[#64748B] text-sm">You’re all caught up ✨</p>
        ) : (
          <div className="space-y-4 max-w-5xl">
            {overdueTasks.map((task) => (
              <div
                key={task._id}
                className="bg-red-50/50 border border-red-200 p-5 rounded-xl shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className="font-semibold text-red-600 text-lg tracking-tight">{task.title}</h3>
                {task.description && (
                  <p className="text-sm text-[#64748B] mt-1.5 leading-relaxed">
                    {task.description}
                  </p>
                )}
                {task.project && (
                  <p className="text-xs font-medium text-purple-600 mt-2">
                    Project:{" "}
                    {typeof task.project === "string"
                      ? task.project
                      : task.project?.name}
                  </p>
                )}
                <p className="text-xs font-medium text-red-500 mt-1.5">
                  Overdue since:{" "}
                  {task.dueDate &&
                    new Date(task.dueDate).toLocaleDateString()}
                </p>
                {task.priority && (
                  <p className="text-xs font-medium text-amber-600 mt-1.5">
                    Priority:{" "}
                    <span className="bg-amber-50 px-2 py-0.5 rounded border border-amber-200 ml-1">
                      {task.priority}
                    </span>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Inbox;
