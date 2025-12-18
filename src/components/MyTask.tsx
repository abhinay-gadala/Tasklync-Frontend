import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import {
  DragDropContext,
  Droppable,
  Draggable
} from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { Link } from "react-router-dom";
import { ClipLoader } from 'react-spinners'
import { useDispatch } from "react-redux";
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const token = Cookies.get("jwt_Token");
  const role = Cookies.get("role");
  const userId = String(localStorage.getItem("userId") || "");
  const dispatch = useDispatch();

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
    const res = await fetch("http://localhost:3005/task", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("Failed to fetch tasks", data);
      setTasks([]);
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

    setTasks(visible);
  } catch (err) {
    console.error("Fetch tasks error:", err);
    setTasks([]);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => { fetchTasks(); }, []);

  // API status update
  const sendStatusUpdate = async (id: string, status: StatusKey) => {
    try {
      const res = await fetch(`http://localhost:3005/task/${id}`, {
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
    setTasks(prev => prev.map(t => (t._id === draggableId ? { ...t, status: to } : t)));

    const ok = await sendStatusUpdate(draggableId, to);
    if (!ok) {
      alert("Error updating task!");
      setTasks(old);
    }
  };

  if (loading) return <div className="h-screen text-white flex justify-center items-center"><ClipLoader color="#e72be4" size={60} /></div>;

  // group tasks
  const groups: Record<StatusKey, Task[]> = { todo: [], "in-progress": [], done: [] };
  tasks.forEach(t => groups[t.status].push(t));

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">

      {/* 🔥 Header + Admin Add Button */}
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">My Tasks</h1>

        {role === "admin" && (
          <button className="px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700"
          onClick={() => {dispatch(actions.userShowTask())}}>
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
                  className={`p-4 rounded min-h-[350px] ${s.isDraggingOver ? "ring-2 ring-purple-500" : ""}`}
                  style={{ background:"#1a202c" }}
                >
                  <h2 className="text-xl mb-3">{prettyName(col)}</h2>

                  {groups[col].map((task, index) => (
                    <Draggable key={task._id} draggableId={task._id} index={index}>
                      {(pr) => (
                        <div ref={pr.innerRef} {...pr.draggableProps} {...pr.dragHandleProps}
                          className="bg-gray-800 p-3 mb-3 rounded-md shadow relative">

                          {/* 👑 Admin 3-dot Menu */}
                          {role === "admin" && <DropdownMenu task={task} onDelete={fetchTasks}/>}

                          <h3 className="font-semibold">{task.title}</h3>
                          <p className="text-gray-400 text-sm">{task.description}</p>

                          <p className="text-xs text-purple-300 mt-1">
                            Project: {typeof task.project==="string"?task.project:task.project?.name}
                          </p>

                          <p className="text-xs mt-1 text-yellow-300">
                            Priority: <span className="font-bold">{task.priority}</span>
                          </p>

                          <p className="text-xs text-gray-400">
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
const DropdownMenu: React.FC<{task:Task,onDelete:()=>void}> = ({task,onDelete}) => {
  const [open,setOpen]=useState(false);
  const token = Cookies.get("jwt_Token");

  const del = async () => {
    if(!confirm("Delete task permanently?")) return;
    await fetch(`http://localhost:3005/task/${task._id}`,{
      method:"DELETE",
      headers:{Authorization:`Bearer ${token}`}
    });
    onDelete();
  };

  return (
    <div className="absolute top-2 right-2">
      <button onClick={()=>setOpen(!open)} className="text-gray-300 text-lg">⋮</button>

      {open && (
        <div className="absolute right-0 bg-[#1a1c2a] p-2 rounded-md border border-gray-700 w-32 text-sm">
          <Link to={`/managetask?edit=${task._id}`} className="block mb-2 hover:text-purple-400">✏ Edit</Link>
          <button onClick={del} className="text-red-400 hover:text-red-300">🗑 Delete</button>
        </div>
      )}
    </div>
  );
};
