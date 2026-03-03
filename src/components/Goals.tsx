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
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-8 tracking-tight">Goals</h1>

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
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 mb-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        {icon && (
          <div className="bg-purple-100 text-purple-600 p-2.5 rounded-xl text-xl shadow-sm">
            {icon}
          </div>
        )}
        <h2 className="text-xl font-semibold text-[#0F172A] tracking-tight">
          {title}
        </h2>
      </div>

      {/* Divider */}
      <div className="border-t border-[#E5E7EB] mb-4" />

      {/* Content */}
      <div className="space-y-2 text-sm">
        {children}
      </div>
    </div>
  );
};


const GoalItem = ({ text, meta, danger = false }: any) => (
  <div className="flex justify-between items-center bg-[#F8FAFC] p-4 rounded-xl border border-[#E5E7EB] shadow-sm mb-3">
    <p className="text-[#0F172A] font-medium">{text}</p>
    <span
      className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${danger
          ? "bg-red-50 text-red-600 border-red-200"
          : "bg-purple-50 text-purple-600 border-purple-200"
        }`}
    >
      {meta}
    </span>
  </div>
);

const Positive = ({ text }: { text: string }) => (
  <p className="text-sm font-medium text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100">{text}</p>
);
