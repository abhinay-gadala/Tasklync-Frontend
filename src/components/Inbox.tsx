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
      <div className="h-screen bg-[#07112a] text-white flex items-center justify-center">
        Loading inbox...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Inbox</h1>

      {/* --- Assigned to you section (acts like notifications) --- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Assigned to you</h2>
        {notifications.length === 0 ? (
          <p className="text-gray-400 text-sm">No active tasks assigned to you 🎉</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((task) => (
              <div
                key={task._id}
                className="bg-[#121218] p-4 rounded-lg shadow flex justify-between items-start"
              >
                <div>
                  <p className="text-sm text-gray-400">
                    {task.status === "todo"
                      ? "New task assigned"
                      : "Task updated"}
                  </p>
                  <h3 className="font-semibold mt-1">{task.title}</h3>
                  {task.description && (
                    <p className="text-sm text-gray-400 mt-1">
                      {task.description}
                    </p>
                  )}
                  {task.project && (
                    <p className="text-xs text-purple-300 mt-1">
                      Project:{" "}
                      {typeof task.project === "string"
                        ? task.project
                        : task.project?.name}
                    </p>
                  )}
                  {task.priority && (
                    <p className="text-xs mt-1">
                      Priority:{" "}
                      <span className="text-yellow-300 font-semibold">
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
                          ? "text-red-400 font-semibold"
                          : "text-gray-400"
                      }
                    >
                      {isOverdue(task) ? "Overdue" : "Due"}:{" "}
                      {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}
                  {task.createdAt && (
                    <p className="text-gray-500 mt-1">
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
        <h2 className="text-xl font-semibold mb-3">Overdue</h2>
        {overdueTasks.length === 0 ? (
          <p className="text-gray-400 text-sm">You’re all caught up ✨</p>
        ) : (
          <div className="space-y-3">
            {overdueTasks.map((task) => (
              <div
                key={task._id}
                className="bg-[#1a1414] border border-red-500/60 p-4 rounded-lg shadow"
              >
                <h3 className="font-semibold text-red-300">{task.title}</h3>
                {task.description && (
                  <p className="text-sm text-gray-300 mt-1">
                    {task.description}
                  </p>
                )}
                {task.project && (
                  <p className="text-xs text-purple-300 mt-1">
                    Project:{" "}
                    {typeof task.project === "string"
                      ? task.project
                      : task.project?.name}
                  </p>
                )}
                <p className="text-xs text-red-400 mt-1">
                  Overdue since:{" "}
                  {task.dueDate &&
                    new Date(task.dueDate).toLocaleDateString()}
                </p>
                {task.priority && (
                  <p className="text-xs text-yellow-300 mt-1">
                    Priority: {task.priority}
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
