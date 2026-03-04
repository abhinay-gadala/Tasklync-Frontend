import React, { useEffect, useState, useMemo } from "react";
import Cookies from "js-cookie";
import {
  DragDropContext,
  Droppable,
  Draggable
} from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { Link } from "react-router-dom";
import { ClipLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { setTasks as setTasksAction } from "../redux/taskSlice";
import userSlice from "../redux/userSlice";

type StatusKey = "todo" | "in-progress" | "done";

interface TaskRaw {
  _id: string;
  title: string;
  description?: string;
  status: StatusKey | string;
  assignedTo?: { _id: string; name?: string } | null;
  project?: { _id?: string; name?: string } | string | null;
  dueDate?: string | null;
  priority?: string;
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: StatusKey;
  assignedTo?: { _id: string; name?: string } | null;
  project?: { _id?: string; name?: string } | string | null;
  dueDate?: string | null;
  priority?: string;
}

const COLUMNS: StatusKey[] = ["todo", "in-progress", "done"];
const prettyName = (k: StatusKey) =>
  k === "todo" ? "Todo" : k === "in-progress" ? "In Progress" : "Done";

const actions = userSlice.actions;

const MyTasks: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const token = Cookies.get("jwt_Token");
  const role = Cookies.get("role");
  const userId = String(localStorage.getItem("userId") || "");
  const dispatch = useDispatch();

  const tasks = useSelector((state: RootState) => state.taskStore.tasks);
  const searchQuery = useSelector((state: RootState) => state.searchStore.query);

  const filteredTasks = useMemo(() => {
    if (!searchQuery) return tasks;
    return tasks.filter(t => {
      const matchTitle = t.title.toLowerCase().includes(searchQuery.toLowerCase());
      const p = t.project;
      const matchProject = typeof p === "string" ? p.toLowerCase().includes(searchQuery.toLowerCase()) : p?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTitle || matchProject;
    });
  }, [tasks, searchQuery]);

  // normalize server → front
  const normalize = (r: TaskRaw): Task => ({
    _id: String(r._id),
    title: r.title,
    description: r.description,
    status: (r.status as StatusKey) || "todo",
    assignedTo: r.assignedTo
      ? { _id: String(r.assignedTo._id), name: r.assignedTo.name }
      : null,
    project:
      typeof r.project === "string"
        ? r.project
        : r.project
          ? { _id: String((r.project)._id), name: (r.project).name }
          : null,
    dueDate: r.dueDate || null,
    priority: r.priority || "Medium"
  });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/task`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("Failed to fetch tasks", data);
        dispatch(setTasksAction([]));
        return;
      }

      const rawTasks: TaskRaw[] = Array.isArray(data.tasks) ? data.tasks : [];
      const normalized = rawTasks.map(normalize);

      let visible: Task[];

      // 👑 Admin: see ALL tasks (for their projects, as backend already scopes)
      if (role === "admin") {
        visible = normalized;
      } else {
        // 👤 Employee: only tasks assigned to them
        visible = normalized.filter(
          (t) => t.assignedTo && String(t.assignedTo._id) === userId
        );
      }

      dispatch(setTasksAction(visible));
    } catch (err) {
      console.error("Fetch tasks error:", err);
      dispatch(setTasksAction([]));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tasks.length === 0) fetchTasks();
    else setLoading(false);
  }, []);

  // API status update
  const sendStatusUpdate = async (id: string, status: StatusKey) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/task/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      return res.ok;
    } catch { return false; }
  };

  // DRAG-DROP handler
  const onDragEnd = async (r: DropResult) => {
    const { destination, source, draggableId } = r;
    if (!destination) return;

    const from = source.droppableId as StatusKey;
    const to = destination.droppableId as StatusKey;
    if (from === to) return;

    // Optimistic update
    const old = tasks;
    dispatch(setTasksAction(tasks.map(t => (t._id === draggableId ? { ...t, status: to } : t))));

    const ok = await sendStatusUpdate(draggableId, to);
    if (!ok) {
      toast.error("Error updating task!");
      dispatch(setTasksAction(old));
    }
  };

  if (loading) return <div className="h-screen bg-[#F8FAFC] flex justify-center items-center"><ClipLoader color="#9333ea" size={60} /></div>;

  // group tasks
  const groups: Record<StatusKey, any[]> = { todo: [], "in-progress": [], done: [] };
  filteredTasks.forEach(t => {
    const s = t.status as StatusKey;
    if (groups[s]) groups[s].push(t);
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] p-6 lg:p-8">

      {/* 🔥 Header + Admin Add Button */}
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>

        {role === "admin" && (
          <button className="px-5 py-2.5 bg-purple-600 rounded-lg text-white font-medium hover:bg-purple-700 transition-colors shadow-sm"
            onClick={() => { dispatch(actions.userShowTask()) }}>
            + New Task
          </button>
        )}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {COLUMNS.map(col => (
            <Droppable droppableId={col} key={col}>
              {(p, s) => (
                <div ref={p.innerRef} {...p.droppableProps}
                  className={`p-4 rounded-xl min-h-[350px] border border-[#E5E7EB] ${s.isDraggingOver ? "ring-2 ring-purple-500 bg-[#E2E8F0]" : "bg-[#F1F5F9]"}`}
                >
                  <h2 className="text-lg font-semibold mb-4 tracking-tight text-[#0F172A]">{prettyName(col)}</h2>

                  {groups[col].map((task, index) => (
                    <Draggable key={task._id} draggableId={task._id} index={index}>
                      {(pr) => (
                        <div ref={pr.innerRef} {...pr.draggableProps} {...pr.dragHandleProps}
                          className="bg-white p-4 mb-3 rounded-lg border border-[#E5E7EB] shadow-sm relative hover:shadow-md transition-shadow">

                          {/* 👑 Admin 3-dot Menu */}
                          {role === "admin" && <DropdownMenu task={task} onDelete={fetchTasks} />}

                          <h3 className="font-semibold text-[#0F172A]">{task.title}</h3>
                          <p className="text-[#64748B] text-sm mt-1.5 leading-relaxed">{task.description}</p>

                          <p className="text-xs font-medium text-purple-600 mt-2">
                            Project: {typeof task.project === "string" ? task.project : task.project?.name}
                          </p>

                          <p className="text-xs mt-1.5 font-medium text-[#64748B]">
                            Priority: <span className="font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">{task.priority}</span>
                          </p>

                          <p className="text-xs text-[#64748B] font-medium mt-1.5">
                            {task.dueDate && new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </Draggable>
                  ))}

                  {p.placeholder}
                </div>
              )}
            </Droppable>
          ))}

        </div>
      </DragDropContext>
    </div>
  );
};

export default MyTasks;


/* ============================================================ 
   3-DOT ADMIN ACTION MENU COMPONENT
   ============================================================ */
const DropdownMenu: React.FC<{ task: Task, onDelete: () => void }> = ({ task, onDelete }) => {
  const [open, setOpen] = useState(false);
  const token = Cookies.get("jwt_Token");

  const del = async () => {
    if (!confirm("Delete task permanently?")) return;
    await fetch(`${import.meta.env.VITE_API_URL}/task/${task._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    onDelete();
  };

  return (
    <div className="absolute top-2 right-2">
      <button onClick={() => setOpen(!open)} className="text-[#94A3B8] hover:text-[#0F172A] text-lg font-bold px-2 py-0.5 rounded transition-colors hover:bg-slate-100">⋮</button>

      {open && (
        <div className="absolute right-0 bg-white p-2 rounded-lg border border-[#E5E7EB] shadow-lg w-32 text-sm z-10">
          <Link to={`/managetask?edit=${task._id}`} className="block mb-2 font-medium text-[#0F172A] hover:text-purple-600 transition-colors">✏ Edit</Link>
          <button onClick={del} className="text-red-500 font-medium hover:text-red-600 transition-colors">🗑 Delete</button>
        </div>
      )}
    </div>
  );
};
