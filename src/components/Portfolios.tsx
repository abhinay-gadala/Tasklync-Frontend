import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";

interface Project {
  _id: string;
  name: string;
}

interface Task {
  _id: string;
  status: "todo" | "in-progress" | "done" | string;
  dueDate?: string | null;
}

const Portfolios: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const token = Cookies.get("jwt_Token");

  useEffect(() => {
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch("http://localhost:3005/project/get", { headers }).then((r) =>
        r.json()
      ),
      fetch("http://localhost:3005/task", { headers }).then((r) => r.json()),
    ])
      .then(([projectRes, taskRes]) => {
        setProjects(projectRes.projects || []);
        setTasks(taskRes.tasks || []);
      })
      .catch(() => {
        setProjects([]);
        setTasks([]);
      });
  }, [token]);

  /* ---------------- calculations ---------------- */

  const totalProjects = projects.length;
  const totalTasks = tasks.length;

  const completedTasks = tasks.filter((t) => t.status === "done").length;

  const overdueTasks = tasks.filter(
    (t) =>
      t.dueDate &&
      new Date(t.dueDate) < new Date() &&
      t.status !== "done"
  ).length;

  const progress =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Portfolios</h1>

      <div className="max-w-lg">
        <div className="bg-[#1a202c] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">My Portfolio</h2>

          <div className="space-y-2 text-sm">
            <p className="text-gray-400">
              Projects:{" "}
              <span className="text-white font-medium">
                {totalProjects}
              </span>
            </p>

            <p className="text-gray-400">
              Tasks:{" "}
              <span className="text-white font-medium">
                {totalTasks}
              </span>
            </p>

            <p className="text-gray-400">
              Overdue:{" "}
              <span
                className={
                  overdueTasks > 0
                    ? "text-red-400 font-medium"
                    : "text-green-400 font-medium"
                }
              >
                {overdueTasks}
              </span>
            </p>
          </div>

          {/* Progress */}
          <div className="mt-5">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Progress</span>
              <span className="text-white">{progress}%</span>
            </div>

            <div className="w-full h-2 bg-gray-800 rounded">
              <div
                className="h-2 bg-purple-500 rounded transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Empty state */}
          {totalProjects === 0 && (
            <p className="mt-4 text-sm text-gray-500">
              No projects yet. Create a project to see portfolio insights.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Portfolios;
