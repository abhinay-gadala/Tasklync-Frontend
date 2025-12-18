import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const AcceptInvite: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [inviteInfo, setInviteInfo] = useState<{ email?: string; projectId?: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) { setError("Invalid link"); setLoading(false); return; }
    (async () => {
      try {
        const res = await fetch(`http://localhost:3005/invite/verify/${token}`);
        const data = await res.json();
        if (!res.ok) setError(data.message || "Invalid invite");
        else setInviteInfo(data);
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleAccept = async () => {
    try {
      const res = await fetch(`http://localhost:3005/invite/accept/${token}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { alert(data.message || "Failed"); return; }
      // Navigate to login with email prefilled (user must use temp password from email)
      navigate(`/login?email=${encodeURIComponent(data.email)}&id=${data.userId}`);
    } catch {
      alert("Server error");
    }
  };

  if (loading) return <div className="text-white">Verifying invite...</div>;
  if (error) return <div className="text-red-400">{error}</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F1120] text-white">
      <div className="bg-[#1A1C2A] p-8 rounded-lg max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4">You're invited</h2>
        <p className="mb-4">Email: <strong>{inviteInfo?.email}</strong></p>
        <p className="mb-6">Click Accept to create your account. Use the temporary password from the invite email.</p>
        <button onClick={handleAccept} className="bg-purple-600 px-4 py-2 rounded">Accept Invitation</button>
      </div>
    </div>
  );
};

export default AcceptInvite;
