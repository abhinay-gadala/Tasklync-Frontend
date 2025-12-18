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
    <div className="min-h-screen flex items-center justify-center bg-[#0F1120] text-white">
      <form onSubmit={submit} className="bg-[#1A1C2A] p-8 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Set your password</h2>
        <p className="mb-4">Account: {email}</p>
        <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="New password" className="mb-3 w-full"/>
        <input type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} placeholder="Confirm password" className="mb-3 w-full"/>
        {error && <p className="text-red-400">{error}</p>}
        <button type="submit" className="bg-purple-600 p-2 rounded w-full mt-2">Update Password</button>
      </form>
    </div>
  );
};

export default SetPassword;
