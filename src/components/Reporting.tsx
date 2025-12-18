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
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Reports</h1>

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
                    background: "#020617",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
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
                    {priorityData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i]}
                        stroke="rgba(190, 19, 19, 0.15)"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#a4abcaff",
                      borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
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
  <div className="bg-[#1a202c] border border-white/5 p-5 rounded-xl shadow-md hover:shadow-lg transition">
    <p className="text-gray-400 text-sm">{title}</p>
    <h2
      className={`text-3xl font-bold mt-1 ${
        danger ? "text-red-400" : "text-white"
      }`}
    >
      {value}
    </h2>
  </div>
);


const ChartBox = ({ title, children }: any) => (
  <div className="bg-[#1a202c] border border-white/5 rounded-xl p-5 shadow-md">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-200">{title}</h2>
    </div>
    {children}
  </div>
);


const Empty = () => (
  <p className="text-gray-500 text-sm">No data available</p>
);

export default Reports;
  