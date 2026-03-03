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
    <div className="bg-[#1A1C2A] p-4 rounded-lg">
      <div className="flex justify-between items-center">
        <p className="font-semibold">{comment.user.name}</p>

        <button onClick={deleteComment} className="text-red-400 text-xs">
          Delete
        </button>
      </div>

      <p className="text-sm mt-1">{comment.text}</p>

      <button
        onClick={() => setShowReplies(!showReplies)}
        className="text-xs text-purple-400 mt-2"
      >
        {showReplies ? "Hide replies" : "View replies"}
      </button>

      {showReplies && (
        <div className="ml-4 mt-3 space-y-2">
          {comment.replies.map((r: any) => (
            <div
              key={r._id}
              className="bg-[#232536] p-2 rounded-md text-sm"
            >
              <strong>{r.user.name}:</strong> {r.text}
            </div>
          ))}

          <div className="flex gap-2 mt-2">
            <input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Reply..."
              className="flex-1 bg-[#0F1120] px-3 py-1 rounded-md text-sm"
            />
            <button onClick={addReply} className="text-purple-400 text-sm">
              Reply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentItem;