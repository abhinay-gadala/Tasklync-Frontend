import React, { useState, useEffect, useMemo } from "react";
import Cookies from "js-cookie";
import { LuCircleArrowLeft } from "react-icons/lu";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import type { RootState, AppDispatch } from "../redux/store";
import { setProjects } from "../redux/projectSlice";
import { setTasks } from "../redux/taskSlice";
import userSlice from "../redux/userSlice";


type Priority = "Low" | "Medium" | "High";

interface TaskFormData {
  title: string;
  description: string;
  assignedTo?: string;
  assignedEmail?: string;
  priority?: Priority;
  dueDate?: string; // ISO date string
}

const actions = userSlice.actions

const ManageTasks: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const projects = useSelector((state: RootState) => state.projectStore.projects);
  const tasks = useSelector((state: RootState) => state.taskStore.tasks);
  const searchQuery = useSelector((state: RootState) => state.searchStore.query);
  const filteredTasks = useMemo(() => {
    if (!searchQuery) return tasks;
    return tasks.filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [tasks, searchQuery]);

  const [searchParams, setSearchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const [selectedProject, setSelectedProject] = useState<string>("");
  const [assignMode, setAssignMode] = useState<"existing" | "new">("existing");
  const [newEmail, setNewEmail] = useState("");
  // Users will be dynamically selected from the active project

  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    assignedTo: "",
    priority: "Medium",
    dueDate: "",
  });

  const token = Cookies.get("jwt_Token");

  // Fetch tasks of selected project
  const fetchTasks = async (projectId: string) => {
    if (!projectId) return;

    const res = await fetch(`${import.meta.env.VITE_API_URL}/task/project/${projectId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (res.ok) dispatch(setTasks(data.tasks || []));
  };

  // Fetch projects
  const fetchProjects = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/project/get`, {
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
      assignedTo: assignMode === "existing" ? formData.assignedTo : "",
      assignedEmail: assignMode === "new" ? newEmail : "",
      priority: formData.priority,
      // HTML date input gives "YYYY-MM-DD" – backend can new Date(dueDate)
      dueDate: formData.dueDate || "",
    };

    const url = editId ? `${import.meta.env.VITE_API_URL}/task/${editId}` : `${import.meta.env.VITE_API_URL}/task`;
    const method = editId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
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
      if (editId) {
        setSearchParams(new URLSearchParams());
      }
      fetchTasks(selectedProject);
    }
  };

  // Populate form if Edit mode
  useEffect(() => {
    if (editId && tasks.length > 0) {
      const taskToEdit = tasks.find(t => t._id === editId);
      if (taskToEdit) {
        setFormData({
          title: taskToEdit.title,
          description: taskToEdit.description || "",
          assignedTo: typeof taskToEdit.assignedTo === 'object' && taskToEdit.assignedTo ? taskToEdit.assignedTo._id : taskToEdit.assignedTo || "",
          priority: (taskToEdit.priority as Priority) || "Medium",
          dueDate: taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : "",
        });
        if (taskToEdit.assignedEmail) {
          setAssignMode("new");
          setNewEmail(taskToEdit.assignedEmail);
        } else {
          setAssignMode("existing");
          setNewEmail("");
        }

        const projId = typeof taskToEdit.project === 'object' && taskToEdit.project ? taskToEdit.project._id : taskToEdit.project;
        if (projId) setSelectedProject(projId);
      }
    } else if (!editId) {
      setFormData({
        title: "",
        description: "",
        assignedTo: "",
        priority: "Medium",
        dueDate: "",
      });
      setNewEmail("");
    }
  }, [editId, tasks]);

  // Delete Task
  const handleDeleteTask = async (id: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/task/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) fetchTasks(selectedProject);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchTasks(selectedProject);
  }, [selectedProject]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] p-6 lg:p-8">
      <h1 className="text-3xl font-bold flex items-center gap-3 mb-8 tracking-tight"><span className="cursor-pointer text-[#64748B] hover:text-[#0F172A] transition-colors" onClick={() => { dispatch(actions.userShowTask()) }}><LuCircleArrowLeft /></span>Manage Tasks</h1>

      {/* Select Project */}
      <select
        className="w-full bg-white border border-[#E5E7EB] text-[#0F172A] shadow-sm px-4 py-2.5 rounded-lg mb-8 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
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
        className="bg-white p-6 md:p-8 rounded-xl border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-5 mb-10"
      >
        <input
          type="text"
          placeholder="Task Title"
          className="w-full bg-white border border-[#E5E7EB] text-[#0F172A] shadow-sm px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />

        <textarea
          placeholder="Task Description"
          className="w-full min-h-[100px] bg-white border border-[#E5E7EB] text-[#0F172A] shadow-sm px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
        />

        {/* Priority + Due Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#64748B] mb-1.5 uppercase tracking-wider">Priority</label>
            <select
              className="w-full bg-white border border-[#E5E7EB] text-[#0F172A] shadow-sm px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
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
            <label className="block text-sm font-medium text-[#64748B] mb-1.5 uppercase tracking-wider">Due Date</label>
            <input
              type="date"
              className="w-full bg-white border border-[#E5E7EB] text-[#0F172A] shadow-sm px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
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
            className={`px-5 py-2 rounded-lg font-medium transition-colors ${assignMode === "existing" ? "bg-purple-600 text-white shadow-sm" : "bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]"
              }`}
            onClick={() => setAssignMode("existing")}
          >
            Existing User
          </button>
          <button
            type="button"
            className={`px-5 py-2 rounded-lg font-medium transition-colors ${assignMode === "new" ? "bg-purple-600 text-white shadow-sm" : "bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]"
              }`}
            onClick={() => setAssignMode("new")}
          >
            New Email
          </button>
        </div>

        {assignMode === "existing" ? (
          <select
            className="w-full bg-white border border-[#E5E7EB] text-[#0F172A] shadow-sm px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            value={formData.assignedTo}
            onChange={(e) =>
              setFormData({ ...formData, assignedTo: e.target.value })
            }
          >
            <option value="">Select Member</option>
            {projects.find((p) => p._id === selectedProject)?.members?.map((u: any) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.email || u.role})
              </option>
            ))}
          </select>
        ) : (
          <input
            type="email"
            className="w-full bg-white border border-[#E5E7EB] text-[#0F172A] shadow-sm px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            placeholder="Enter new user email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
        )}

        <button
          type="submit"
          className="bg-purple-600 text-white w-full py-3 rounded-lg font-semibold shadow-sm hover:bg-purple-700 hover:shadow-md transition-all mt-4"
        >
          {editId ? "Save Edit" : "Create Task"}
        </button>
      </form>

      {/* Task List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTasks.map((task) => (
          <div key={task._id} className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-md">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-lg text-[#0F172A] tracking-tight">{task.title}</h3>
              <button
                onClick={() => handleDeleteTask(task._id!)}
                className="text-red-500 font-medium hover:text-red-700 transition-colors text-sm bg-red-50 hover:bg-red-100 px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>
            <p className="text-[#64748B] text-sm leading-relaxed mb-4">{task.description}</p>

            <div className="mt-4 pt-4 border-t border-[#E5E7EB] text-sm text-[#64748B] flex flex-col gap-2 font-medium">
              <span>
                Assigned To: <span className="text-[#0F172A]">{typeof task.assignedTo === 'object' && task.assignedTo !== null ? task.assignedTo.name : task.assignedTo || task.assignedEmail || "N/A"}</span>
              </span>
              {task.priority && (
                <span>
                  Priority: <span className="text-purple-600">{task.priority}</span>
                </span>
              )}
              {task.dueDate && (
                <span>
                  Due:{" "}
                  <span className="text-[#0F172A]">
                    {new Date(task.dueDate).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
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
