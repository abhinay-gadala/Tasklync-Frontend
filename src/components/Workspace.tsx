import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";
import CommentItem from "./CommentItem";
import { ArrowLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import { setProjects } from "../redux/projectSlice";

/* ---------------- SIMPLE THROTTLE ---------------- */
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
) {
  let inThrottle = false;

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

interface Props {
  workspaceId?: string;
}

const Workspace: React.FC<Props> = ({ workspaceId: propWorkspaceId }) => {
  const { workspaceId: paramWorkspaceId } =
    useParams<{ workspaceId: string }>();

  const workspaceId = propWorkspaceId || paramWorkspaceId;
  const token = Cookies.get("jwt_Token");
  const dispatch = useDispatch<AppDispatch>();

  const projects = useSelector((state: RootState) => state.projectStore.projects);
  const searchQuery = useSelector((state: RootState) => state.searchStore.query);
  const filteredProjects = useMemo(() => {
    if (!searchQuery) return projects;
    return projects.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [projects, searchQuery]);

  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const effectiveWorkspaceId = workspaceId || selectedProject;

  /* ---------------- FETCH PROJECTS ---------------- */
  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/project/get`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.projects) {
        dispatch(setProjects(data.projects));
      }
    } catch (err) {
      console.error("Failed to fetch projects", err);
    }
  }, [token, dispatch]);

  /* ---------------- FETCH COMMENTS ---------------- */
  const fetchComments = useCallback(async () => {
    if (!effectiveWorkspaceId) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/comment/comments/workspace/${effectiveWorkspaceId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok && data.comments) {
        setComments(data.comments);
      } else if (res.ok && Array.isArray(data)) {
        setComments(data);
      }
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  }, [effectiveWorkspaceId, token]);

  /* ---------------- THROTTLED FETCH (STABLE) ---------------- */
  const throttledFetchComments = useMemo(
    () => throttle(fetchComments, 2000),
    [fetchComments]
  );

  /* ---------------- INITIAL PROJECT LOAD ---------------- */
  useEffect(() => {
    if (!effectiveWorkspaceId && token && projects.length === 0) {
      fetchProjects();
    }
  }, [effectiveWorkspaceId, token, fetchProjects, projects.length]);

  /* ---------------- FETCH ON WORKSPACE CHANGE ---------------- */
  useEffect(() => {
    if (effectiveWorkspaceId) {
      fetchComments(); // immediate load
    }
  }, [effectiveWorkspaceId, fetchComments]);

  /* ---------------- AUTO REFRESH POLLING (FIXED) ---------------- */
  useEffect(() => {
    if (!effectiveWorkspaceId) return;

    const interval = setInterval(() => {
      throttledFetchComments();
    }, 3000); // every 3 seconds

    return () => clearInterval(interval);
  }, [effectiveWorkspaceId, throttledFetchComments]);

  /* ---------------- ADD COMMENT (ANTI-SPAM) ---------------- */
  const addComment = useMemo(
    () =>
      throttle(async () => {
        if (!effectiveWorkspaceId) return;
        if (!text.trim()) return;

        setLoading(true);

        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/comment/comments`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                workspaceId: effectiveWorkspaceId,
                text,
              }),
            }
          );

          if (res.ok) {
            setText("");
            fetchComments(); // instant refresh after send
          }
        } catch (err) {
          console.error("Failed to add comment", err);
        }

        setLoading(false);
      }, 1500),
    [effectiveWorkspaceId, text, token, fetchComments]
  );

  return (
    <div className="bg-white border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center mb-4">
        {selectedProject && (
          <button
            onClick={() => setSelectedProject(null)}
            className="mr-3 p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg transition-colors"
            title="Back to Projects"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">Workspace Chat</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {!effectiveWorkspaceId ? (
          <div>
            <p className="text-[#64748B] text-sm mb-4">
              Select a project to join the group chat:
            </p>

            {filteredProjects.length === 0 ? (
              <p className="text-[#64748B] text-sm font-medium bg-slate-50 p-3 rounded border border-[#E5E7EB]">
                No projects available matching your search.
              </p>
            ) : (
              <div className="space-y-2">
                {filteredProjects.map((project) => (
                  <button
                    key={project._id}
                    onClick={() => setSelectedProject(project._id)}
                    className="w-full text-left bg-[#F8FAFC] p-4 rounded-lg hover:bg-[#F1F5F9] border border-[#E5E7EB] text-[#0F172A] font-medium shadow-sm transition-all"
                  >
                    {project.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : comments.length === 0 ? (
          <p className="text-[#64748B] text-sm text-center py-4">No messages yet</p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              refresh={fetchComments}
            />
          ))
        )}
      </div>

      {/* Input */}
      {effectiveWorkspaceId && (
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-[#F8FAFC] px-4 py-2 rounded-lg border border-[#E5E7EB] text-[#0F172A] placeholder-[#94A3B8] focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all shadow-sm"
          />
          <button
            onClick={addComment}
            disabled={loading || !text.trim()}
            className="bg-purple-600 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
};

export default Workspace;