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
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-8 tracking-tight">Portfolios</h1>

      <div className="max-w-lg">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-5 tracking-tight">My Portfolio</h2>

          <div className="space-y-2 text-sm">
            <p className="text-[#64748B]">
              Projects:{" "}
              <span className="text-[#0F172A] font-medium text-base ml-1">
                {totalProjects}
              </span>
            </p>

            <p className="text-[#64748B] mt-3">
              Tasks:{" "}
              <span className="text-[#0F172A] font-medium text-base ml-1">
                {totalTasks}
              </span>
            </p>

            <p className="text-[#64748B] mt-3">
              Overdue:{" "}
              <span
                className={
                  overdueTasks > 0
                    ? "text-red-500 font-semibold text-base ml-1"
                    : "text-emerald-500 font-semibold text-base ml-1"
                }
              >
                {overdueTasks}
              </span>
            </p>
          </div>

          {/* Progress */}
          <div className="mt-6 pt-5 border-t border-[#E5E7EB]">
            <div className="flex justify-between text-sm mb-2 font-medium">
              <span className="text-[#64748B] uppercase tracking-wider text-xs">Progress</span>
              <span className="text-[#0F172A]">{progress}%</span>
            </div>

            <div className="w-full h-2.5 bg-[#E5E7EB] rounded-full overflow-hidden">
              <div
                className="h-2 bg-purple-500 rounded transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Empty state */}
          {totalProjects === 0 && (
            <p className="mt-5 text-sm font-medium text-[#64748B] bg-slate-50 p-3 rounded border border-[#E5E7EB]">
              No projects yet. Create a project to see portfolio insights.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Portfolios;
