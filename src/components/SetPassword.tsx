import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const SetPassword: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const userId = params.get("id");
  const email = params.get("email");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return setError("Missing user ID");
    if (password.length < 6) return setError("Password must be at least 6 chars");
    if (password !== confirm) return setError("Passwords do not match");

    try {
      const res = await fetch(`http://localhost:3005/user/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Failed to set password");
      alert("Password updated. Please login.");
      navigate("/login");
    } catch {
      setError("Network error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] text-[#0F172A] px-6">
      <form onSubmit={submit} className="bg-white p-8 md:p-10 rounded-2xl border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] w-full max-w-md">
        <h2 className="text-3xl font-bold mb-4 tracking-tight">Set your password</h2>
        <p className="mb-6 text-[#64748B] font-medium">Account: <span className="text-[#0F172A]">{email}</span></p>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" className="w-full bg-white border border-[#E5E7EB] text-[#0F172A] p-3 rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" className="w-full bg-white border border-[#E5E7EB] text-[#0F172A] p-3 rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
        {error && <p className="text-red-500 font-medium text-sm mb-4">* {error}</p>}
        <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-medium p-3 rounded-lg w-full mt-2 shadow-sm transition-all focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">Update Password</button>
      </form>
    </div>
  );
};

export default SetPassword;
