import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

interface Task {
  _id: string;
  status: "todo" | "in-progress" | "done" | string;
  priority?: "low" | "medium" | "high" | string;
  dueDate?: string | null;
  project?: { name?: string } | string | null;
}

const COLORS = ["#ef4444", "#facc15", "#22c55e"];

const Reports: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const token = Cookies.get("jwt_Token");

  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:3005/task", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setTasks(data.tasks || []))
      .catch(() => setTasks([]));
  }, [token]);

  /* ---------------- calculations ---------------- */

  const statusData = [
    { name: "Todo", value: tasks.filter((t) => t.status === "todo").length },
    { name: "In Progress", value: tasks.filter((t) => t.status === "in-progress").length },
    { name: "Done", value: tasks.filter((t) => t.status === "done").length },
  ];

  const priorityData = [
    { name: "High", value: tasks.filter((t) => t.priority === "High").length },
    { name: "Medium", value: tasks.filter((t) => t.priority === "Medium").length },
    { name: "Low", value: tasks.filter((t) => t.priority === "Low").length },
  ];

  const projectMap: Record<string, number> = {};
  tasks.forEach((t) => {
    const name =
      typeof t.project === "string"
        ? t.project
        : t.project && "name" in t.project
          ? t.project.name!
          : "Unknown";

    projectMap[name] = (projectMap[name] || 0) + 1;
  });

  const projectData = Object.entries(projectMap).map(([name, value]) => ({
    name,
    value,
  }));

  const overdueCount = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done"
  ).length;

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-8 tracking-tight">Reports</h1>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <Card title="Total Tasks" value={tasks.length} />
        <Card title="Completed" value={statusData[2].value} />
        <Card title="Pending" value={tasks.length - statusData[2].value} />
        <Card title="Overdue" value={overdueCount} danger />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <ChartBox title="Task Status">
          {tasks.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusData}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                    color: "#0F172A",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartBox>

        <ChartBox title="Task Priority">
          {tasks.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={priorityData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                >
                  {priorityData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={COLORS[i]}
                      stroke="rgba(190, 19, 19, 0.15)"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                    color: "#0F172A",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  }}
                />

              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartBox>
      </div>

      <ChartBox title="Project-wise Tasks">
        {projectData.length === 0 ? (
          <Empty />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectData}>
              <XAxis
                dataKey="name"
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartBox>
    </div>
  );
};

/* ---------------- UI helpers ---------------- */

const Card = ({ title, value, danger = false }: any) => (
  <div className="bg-white border border-[#E5E7EB] p-5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow">
    <p className="text-[#64748B] text-sm font-medium tracking-wide uppercase">{title}</p>
    <h2
      className={`text-3xl font-bold mt-2 tracking-tight ${danger ? "text-red-500" : "text-[#0F172A]"
        }`}
    >
      {value}
    </h2>
  </div>
);


const ChartBox = ({ title, children }: any) => (
  <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-xl font-semibold text-[#0F172A] tracking-tight">{title}</h2>
    </div>
    {children}
  </div>
);


const Empty = () => (
  <p className="text-[#64748B] text-sm font-medium">No data available</p>
);

export default Reports;
