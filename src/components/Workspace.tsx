import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";
import CommentItem from "./CommentItem";

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

interface Project {
  _id: string;
  name: string;
}

interface Props {
  workspaceId?: string;
}

const Workspace: React.FC<Props> = ({ workspaceId: propWorkspaceId }) => {
  const { workspaceId: paramWorkspaceId } =
    useParams<{ workspaceId: string }>();

  const workspaceId = propWorkspaceId || paramWorkspaceId;
  const token = Cookies.get("jwt_Token");

  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const effectiveWorkspaceId = workspaceId || selectedProject;

  /* ---------------- FETCH PROJECTS ---------------- */
  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:3005/project/get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.projects) {
        setProjects(data.projects);
      }
    } catch (err) {
      console.error("Failed to fetch projects", err);
    }
  }, [token]);

  /* ---------------- FETCH COMMENTS ---------------- */
  const fetchComments = useCallback(async () => {
    if (!effectiveWorkspaceId) return;

    try {
      const res = await fetch(
        `http://localhost:3005/comment/comments/workspace/${effectiveWorkspaceId}`,
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
    if (!effectiveWorkspaceId && token) {
      fetchProjects();
    }
  }, [effectiveWorkspaceId, token, fetchProjects]);

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
          const res = await fetch(
            "http://localhost:3005/comment/comments",
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
    <div className="bg-[#0F1120] rounded-xl p-6 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4">Workspace Chat</h2>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {!effectiveWorkspaceId ? (
          <div>
            <p className="text-gray-400 text-sm mb-4">
              Select a project to join the group chat:
            </p>

            {projects.length === 0 ? (
              <p className="text-gray-400 text-sm">
                No projects available.
              </p>
            ) : (
              <div className="space-y-2">
                {projects.map((project) => (
                  <button
                    key={project._id}
                    onClick={() => setSelectedProject(project._id)}
                    className="w-full text-left bg-[#1A1C2A] p-3 rounded-lg hover:bg-[#2A2C3A] transition"
                  >
                    {project.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : comments.length === 0 ? (
          <p className="text-gray-400 text-sm">No messages yet</p>
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
            className="flex-1 bg-[#1A1C2A] px-4 py-2 rounded-lg outline-none"
          />
          <button
            onClick={addComment}
            disabled={loading || !text.trim()}
            className="bg-purple-600 px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
};

export default Workspace;