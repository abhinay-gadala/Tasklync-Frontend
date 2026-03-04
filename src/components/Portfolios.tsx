import React, { useEffect, useMemo } from "react";
import Cookies from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import { setProjects } from "../redux/projectSlice";
import { setTasks } from "../redux/taskSlice";

const Portfolios: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const projects = useSelector((state: RootState) => state.projectStore.projects);
  const tasks = useSelector((state: RootState) => state.taskStore.tasks);
  const searchQuery = useSelector((state: RootState) => state.searchStore.query);
  const token = Cookies.get("jwt_Token");

  useEffect(() => {
    if (!token) return;

    if (projects.length === 0 && tasks.length === 0) {
      const headers = { Authorization: `Bearer ${token}` };

      Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/project/get`, { headers }).then((r) =>
          r.json()
        ),
        fetch(`${import.meta.env.VITE_API_URL}/task`, { headers }).then((r) => r.json()),
      ])
        .then(([projectRes, taskRes]) => {
          dispatch(setProjects(projectRes.projects || []));
          dispatch(setTasks(taskRes.tasks || []));
        })
        .catch(() => {
          dispatch(setProjects([]));
          dispatch(setTasks([]));
        });
    }
  }, [token, dispatch, projects.length, tasks.length]);


  /* ---------------- calculations ---------------- */

  const filteredProjects = useMemo(() => {
    if (!searchQuery) return projects;
    return projects.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [projects, searchQuery]);

  const projectMap = useMemo(() => {
    const m = new Map<string, any>();
    projects.forEach((p) => m.set(p._id, p));
    return m;
  }, [projects]);

  const filteredTasks = useMemo(() => {
    if (!searchQuery) return tasks;
    return tasks.filter(t => {
      const proj = t.projectId ? projectMap.get(t.projectId) : undefined;
      const matchTitle = t.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchProject = proj ? proj.name.toLowerCase().includes(searchQuery.toLowerCase()) : false;
      return matchTitle || matchProject;
    });
  }, [tasks, searchQuery, projectMap]);

  const totalProjects = filteredProjects.length;
  const totalTasks = filteredTasks.length;

  const completedTasks = filteredTasks.filter((t) => t.status === "done").length;

  const overdueTasks = filteredTasks.filter(
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
