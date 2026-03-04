import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";

const CreateWorkspace: React.FC = () => {
  const { id } = useParams(); // ✅ Detect if we're editing
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [names, setNames] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");

  const [isEditing, setIsEditing] = useState(false);

  // ✅ Fetch project data if in edit mode
  useEffect(() => {
    if (id) {
      setIsEditing(true);

      const fetchProjectData = async () => {
        try {
          const token = Cookies.get("jwt_Token");
          const response = await fetch(`${import.meta.env.VITE_API_URL}/project/details/${id}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();

          if (response.ok) {
            const projects = data.project;

            // ✅ Dispatch Redux actions with correct values
            setNames(projects.name || "");
            setCompanyName(projects.companyName || "");
            setCompanyEmail(projects.companyEmail || "");
            setCompanyAddress(projects.companyAddress || "");
          } else {
            console.error("Invalid data structure from backend:", data);
          }
        } catch (err) {
          console.error("Failed to fetch project for editing", err);
        }
      };

      fetchProjectData();
    }
  }, [id, dispatch]);


  // ✅ Handle Create / Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get("jwt_Token");

    const payload = {
      name: names,
      companyName,
      companyEmail,
      companyAddress,
    };

    try {
      const url = isEditing
        ? `${import.meta.env.VITE_API_URL}/project/${id}` // update route
        : `${import.meta.env.VITE_API_URL}/project/create`;

      const method = isEditing ? "PUT" : "POST";

      console.log("Submitting project payload:", payload);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(isEditing ? "Project updated successfully" : "Project created successfully");

        if (!isEditing && data.token && data.user) {
          // Store upgraded token with 'admin' role privileges
          Cookies.set("jwt_Token", data.token, { expires: 7 });
          Cookies.set("role", data.user.role, { expires: 7 });
        }

        navigate("/", { replace: true });
      } else {
        console.error("Failed to submit project:", data);
      }
    } catch (err) {
      console.error("Request failed:", err);
    }
  };

  return (
    <div className="h-screen w-full bg-[#F8FAFC] flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] w-[90%] max-w-2xl">
        <h2 className="text-4xl font-bold text-[#0F172A] tracking-tight text-center mb-10">
          {isEditing ? "Edit Workspace" : "Create Workspace"}
        </h2>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          {/* Workspace Name */}
          <div className="flex flex-col gap-2">
            <label className="text-[#64748B] text-sm font-medium tracking-wide uppercase">Workspace Name</label>
            <input
              type="text"
              placeholder="e.g., Project Alpha"
              className="bg-white border border-[#E5E7EB] text-[#0F172A] px-4 py-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              value={names}
              onChange={(e) => setNames(e.target.value)}
            />
          </div>

          {/* Company Name */}
          <div className="flex flex-col gap-2">
            <label className="text-[#64748B] text-sm font-medium tracking-wide uppercase">Company Name</label>
            <input
              type="text"
              placeholder="e.g., TechNova Pvt Ltd"
              className="bg-white border border-[#E5E7EB] text-[#0F172A] px-4 py-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          {/* Company Email */}
          <div className="flex flex-col gap-2">
            <label className="text-[#64748B] text-sm font-medium tracking-wide uppercase">Company Email</label>
            <input
              type="email"
              placeholder="e.g., contact@technova.com"
              className="bg-white border border-[#E5E7EB] text-[#0F172A] px-4 py-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              value={companyEmail}
              onChange={(e) => setCompanyEmail(e.target.value)}
            />
          </div>

          {/* Company Address */}
          <div className="flex flex-col gap-2">
            <label className="text-[#64748B] text-sm font-medium tracking-wide uppercase">Company Address</label>
            <input
              type="text"
              placeholder="e.g., Hyderabad, India"
              className="bg-white border border-[#E5E7EB] text-[#0F172A] px-4 py-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-xl text-white py-3.5 rounded-lg font-semibold shadow-sm transition-all"
          >
            {isEditing ? "Save Changes" : "Create Workspace"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateWorkspace;
