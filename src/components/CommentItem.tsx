import React, { useState, useCallback } from "react";
import Cookies from "js-cookie";
import { throttle } from "../utils/throttle";

interface Props {
  comment: any;
  refresh: () => void;
}

const CommentItem: React.FC<Props> = ({ comment, refresh }) => {
  const token = Cookies.get("jwt_Token");

  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(false);

  /* ---------------- ADD REPLY ---------------- */
  const addReply = useCallback(
    throttle(async () => {
      if (!replyText.trim()) return;

      await fetch("http://localhost:3005/comment/replies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          commentId: comment._id,
          text: replyText,
        }),
      });

      setReplyText("");
      refresh();
    }, 1500),
    [replyText, token, comment._id, refresh]
  );

  /* ---------------- DELETE COMMENT ---------------- */
  const deleteComment = async () => {
    await fetch(
      `http://localhost:3005/comment/comments/${comment._id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    refresh();
  };

  return (
    <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-3">
      <div className="flex justify-between items-center mb-1">
        <p className="font-semibold text-[#0F172A]">{comment.user.name}</p>

        <button onClick={deleteComment} className="text-red-500 hover:text-red-600 font-medium transition-colors text-xs bg-red-50 px-2 py-1 rounded hover:bg-red-100">
          Delete
        </button>
      </div>

      <p className="text-sm mt-2 text-[#64748B] leading-relaxed">{comment.text}</p>

      <button
        onClick={() => setShowReplies(!showReplies)}
        className="text-xs text-purple-600 font-medium hover:text-purple-700 mt-3 transition-colors underline-offset-2 hover:underline"
      >
        {showReplies ? "Hide replies" : "View replies"}
      </button>

      {showReplies && (
        <div className="ml-4 mt-3 space-y-2">
          {comment.replies.map((r: any) => (
            <div
              key={r._id}
              className="bg-white p-3 rounded-lg border border-[#E5E7EB] text-sm shadow-sm"
            >
              <strong className="text-[#0F172A]">{r.user.name}:</strong> <span className="text-[#64748B]">{r.text}</span>
            </div>
          ))}

          <div className="flex gap-2 mt-2">
            <input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Reply..."
              className="flex-1 bg-white border border-[#E5E7EB] px-3 py-2 rounded-lg text-sm text-[#0F172A] focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all shadow-sm"
            />
            <button onClick={addReply} className="text-white bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
              Reply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentItem;