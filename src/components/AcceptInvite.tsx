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

  if (loading) return <div className="text-[#64748B] min-h-screen flex items-center justify-center font-medium">Verifying invite...</div>;
  if (error) return <div className="text-red-500 min-h-screen flex items-center justify-center font-medium">{error}</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] text-[#0F172A] px-6">
      <div className="bg-white p-8 md:p-10 rounded-2xl border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] max-w-md w-full text-center">
        <h2 className="text-3xl font-bold mb-6 tracking-tight">You're invited</h2>
        <p className="mb-4 text-[#64748B] font-medium">Email: <strong className="text-[#0F172A]">{inviteInfo?.email}</strong></p>
        <p className="mb-8 text-[#64748B] leading-relaxed">Click Accept to create your account. Use the temporary password from the invite email.</p>
        <button onClick={handleAccept} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium px-5 py-3 rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">Accept Invitation</button>
      </div>
    </div>
  );
};

export default AcceptInvite;
