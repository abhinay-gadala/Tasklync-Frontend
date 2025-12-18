import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { LuCircleArrowLeft } from "react-icons/lu";
import { useDispatch } from "react-redux";
import userSlice from "../redux/userSlice";

type Priority = "Low" | "Medium" | "High";

interface Task {
  _id?: string;
  title: string;
  description: string;
  assignedTo?: string;
  assignedEmail?: string;
  priority?: Priority;
  dueDate?: string; // ISO date string
}

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Project {
  _id: string;
  name: string;
}

const actions = userSlice.actions

const ManageTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");

  const [assignMode, setAssignMode] = useState<"existing" | "new">("existing");
  const [newEmail, setNewEmail] = useState("");
  const dispatch = useDispatch();

  const [formData, setFormData] = useState<Task>({
    title: "",
    description: "",
    assignedTo: "",
    priority: "Medium",
    dueDate: "",
  });

  const token = Cookies.get("jwt_Token");

  // Fetch tasks of selected project
  const fetchTasks = async () => {
    if (!selectedProject) return;

    const res = await fetch(`http://localhost:3005/task/project/${selectedProject}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (res.ok) setTasks(data.tasks || []);
  };

  // Fetch team members
  const fetchUsers = async () => {
    const res = await fetch("http://localhost:3005/user/read", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (res.ok) setUsers(data.users);
  };

  // Fetch projects
  const fetchProjects = async () => {
    const res = await fetch("http://localhost:3005/project/get", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (res.ok && data.projects.length > 0) {
      setProjects(data.projects);
      setSelectedProject(data.projects[0]._id);
    }
  };

  // Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    const body = {
      title: formData.title,
      description: formData.description,
      project: selectedProject,
      assignedTo: assignMode === "existing" ? formData.assignedTo : null,
      assignedEmail: assignMode === "new" ? newEmail : null,
      priority: formData.priority,
      // HTML date input gives "YYYY-MM-DD" – backend can new Date(dueDate)
      dueDate: formData.dueDate || null,
    };

    const res = await fetch("http://localhost:3005/task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setFormData({
        title: "",
        description: "",
        assignedTo: "",
        priority: "Medium",
        dueDate: "",
      });
      setNewEmail("");
      fetchTasks();
    }
  };

  // Delete Task
  const handleDeleteTask = async (id: string) => {
    const res = await fetch(`http://localhost:3005/task/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) fetchTasks();
  };

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [selectedProject]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6"><span onClick={() => {dispatch(actions.userShowTask())}}><LuCircleArrowLeft /></span>Manage Tasks</h1>

      {/* Select Project */}
      <select
        className="w-full bg-[#23263A] px-4 py-2 rounded-md mb-6"
        value={selectedProject}
        onChange={(e) => setSelectedProject(e.target.value)}
      >
        {projects.map((p) => (
          <option key={p._id} value={p._id}>
            {p.name}
          </option>
        ))}
      </select>

      {/* Create Task Form */}
      <form
        onSubmit={handleCreateTask}
        className="bg-[#1A1C2A] p-5 rounded-xl space-y-4 mb-8"
      >
        <input
          type="text"
          placeholder="Task Title"
          className="w-full bg-[#23263A] px-4 py-2 rounded-md"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />

        <textarea
          placeholder="Task Description"
          className="w-full bg-[#23263A] px-4 py-2 rounded-md"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
        />

        {/* Priority + Due Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Priority</label>
            <select
              className="w-full bg-[#23263A] px-4 py-2 rounded-md"
              value={formData.priority}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  priority: e.target.value as Priority,
                })
              }
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Due Date</label>
            <input
              type="date"
              className="w-full bg-[#23263A] px-4 py-2 rounded-md"
              value={formData.dueDate || ""}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
            />
          </div>
        </div>

        {/* Assign */}
        <div className="flex gap-4">
          <button
            type="button"
            className={`px-4 py-1 rounded ${
              assignMode === "existing" ? "bg-purple-600" : "bg-gray-700"
            }`}
            onClick={() => setAssignMode("existing")}
          >
            Existing User
          </button>
          <button
            type="button"
            className={`px-4 py-1 rounded ${
              assignMode === "new" ? "bg-purple-600" : "bg-gray-700"
            }`}
            onClick={() => setAssignMode("new")}
          >
            New Email
          </button>
        </div>

        {assignMode === "existing" ? (
          <select
            className="w-full bg-[#23263A] px-4 py-2 rounded-md"
            value={formData.assignedTo}
            onChange={(e) =>
              setFormData({ ...formData, assignedTo: e.target.value })
            }
          >
            <option value="">Select Member</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        ) : (
          <input
            type="email"
            className="w-full bg-[#23263A] px-4 py-2 rounded-md"
            placeholder="Enter new user email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
        )}

        <button
          type="submit"
          className="bg-gradient-to-r from-purple-500 to-fuchsia-600 w-full py-2 rounded-md font-semibold"
        >
          Create Task
        </button>
      </form>

      {/* Task List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map((task) => (
          <div key={task._id} className="bg-[#1A1C2A] p-5 rounded-lg shadow-md">
            <div className="flex justify-between mb-2">
              <h3 className="font-semibold">{task.title}</h3>
              <button
                onClick={() => handleDeleteTask(task._id!)}
                className="text-red-400"
              >
                Delete
              </button>
            </div>
            <p>{task.description}</p>

            <div className="mt-2 text-sm text-gray-400 flex flex-col gap-1">
              <span>
                Assigned To: {task.assignedTo || task.assignedEmail || "N/A"}
              </span>
              {task.priority && (
                <span>
                  Priority: <span className="text-purple-300">{task.priority}</span>
                </span>
              )}
              {task.dueDate && (
                <span>
                  Due:{" "}
                  {new Date(task.dueDate).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageTasks;
