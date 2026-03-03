import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { TbTargetArrow } from "react-icons/tb";
import { CiWarning } from "react-icons/ci";
import { MdOutlinePriorityHigh } from "react-icons/md";
import { TiPinOutline } from "react-icons/ti";

interface Task {
  _id: string;
  title: string;
  status: "todo" | "in-progress" | "done" | string;
  priority?: "High" | "Medium" | "Low" | string;
  dueDate?: string | null;
  project?: { name?: string } | string | null;
  assignedTo?: { _id: string; name?: string } | null;
}

const Goals: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const token = Cookies.get("jwt_Token");
  const role = Cookies.get("role");
  const userId = String(localStorage.getItem("userId") || "");

  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:3005/task", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const allTasks: Task[] = data.tasks || [];

        if (role === "employee") {
          setTasks(
            allTasks.filter(
              (t) => t.assignedTo && String(t.assignedTo._id) === userId
            )
          );
        } else {
          setTasks(allTasks);
        }
      })
      .catch(() => setTasks([]));
  }, [token, role, userId]);

  /* ---------------- derived focus data ---------------- */

  const today = new Date().toDateString();

  const overdueTasks = tasks.filter(
    (t) =>
      t.dueDate &&
      new Date(t.dueDate) < new Date() &&
      t.status !== "done"
  );

  const dueTodayTasks = tasks.filter(
    (t) =>
      t.dueDate &&
      new Date(t.dueDate).toDateString() === today &&
      t.status !== "done"
  );

  const highPriorityTasks = tasks.filter(
    (t) => t.priority === "High" && t.status !== "done"
  );

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Goals</h1>

      {/* Today Focus */}
      
      <Section icon={<TbTargetArrow />} title="Today's Focus">
      {dueTodayTasks.length === 0 ? (
        <Positive text="No tasks due today. You're on track 🎉" />
      ) : (
        dueTodayTasks.slice(0, 3).map((t) => (
          <GoalItem
            key={t._id}
            text={t.title}
            meta="Due today"
          />
        ))
      )}
    </Section>

      {/* Overdue */}
      <Section icon={<CiWarning />} title="Needs Attention">
        {overdueTasks.length === 0 ? (
          <Positive text="No overdue tasks. Great job 👏" />
        ) : (
          overdueTasks.slice(0, 3).map((t) => (
            <GoalItem
              key={t._id}
              text={t.title}
              meta="Overdue"
              danger
            />
          ))
        )}
      </Section>

      {/* Priority */}
      <Section icon={<MdOutlinePriorityHigh />} title="High Priority">
        {highPriorityTasks.length === 0 ? (
          <Positive text="No high-priority tasks pending 👍" />
        ) : (
          highPriorityTasks.slice(0, 3).map((t) => (
            <GoalItem
              key={t._id}
              text={t.title}
              meta="High priority"
            />
          ))
        )}
      </Section>

      {/* Admin specific */}
      {role === "admin" && (
        <Section icon={<TiPinOutline />} title="Admin Focus">
          {overdueTasks.length === 0 ? (
            <Positive text="All projects are on track ✅" />
          ) : (
            overdueTasks.slice(0, 3).map((t) => (
              <GoalItem
                key={t._id}
                text={t.title}
                meta={
                  typeof t.project === "string"
                    ? t.project
                    : t.project?.name || "Project"
                }
                danger
              />
            ))
          )}
        </Section>
      )}
    </div>
  );
};

export default Goals;

/* ---------------- helpers ---------------- */

const Section = ({ title, icon, children }: any) => {
  return (
    <div className="bg-[#1a202c] border border-white/10 rounded-xl p-5 mb-6">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        {icon && (
          <div className="bg-purple-500/20 text-purple-400 p-2 rounded-lg text-lg">
            {icon}
          </div>
        )}
        <h2 className="text-lg font-semibold text-white">
          {title}
        </h2>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10 mb-3" />

      {/* Content */}
      <div className="space-y-2 text-sm">
        {children}
      </div>
    </div>
  );
};


const GoalItem = ({ text, meta, danger = false }: any) => (
  <div className="flex justify-between items-center bg-[#020617] p-3 rounded-lg">
    <p className="text-gray-200">{text}</p>
    <span
      className={`text-xs px-3 py-1 rounded-full ${
        danger
          ? "bg-red-500/20 text-red-400"
          : "bg-purple-500/20 text-purple-300"
      }`}
    >
      {meta}
    </span>
  </div>
);

const Positive = ({ text }: {text: string}) => (
  <p className="text-sm text-green-400">{text}</p>
);
