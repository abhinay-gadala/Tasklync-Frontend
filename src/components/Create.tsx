import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import projectSlice from "../redux/projectSlice";
import Cookies from "js-cookie";

interface RootStates {
  projectStore: {
    names: string;
    companyName: string;
    companyEmail: string;
    companyAddress: string;
  };
}

const actions = projectSlice.actions;

const CreateWorkspace: React.FC = () => {
  const { id } = useParams(); // ✅ Detect if we're editing
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { names, companyName, companyEmail, companyAddress } = useSelector(
    (store: RootStates) => store.projectStore
  );

  const [isEditing, setIsEditing] = useState(false);

  // ✅ Fetch project data if in edit mode
 useEffect(() => {
  if (id) {
    setIsEditing(true);

    const fetchProjectData = async () => {
      try {
        const token = Cookies.get("jwt_Token");
        const response = await fetch(`http://localhost:3005/project/details/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.data && data.data.project) {
          const project = data.data.project;

          // ✅ Dispatch Redux actions with correct values
          dispatch(actions.userNames(project.name));
          dispatch(actions.userCompany(project.companyName));
          dispatch(actions.userEmail(project.companyEmail || ""));
          dispatch(actions.userAddress(project.companyAddress || ""));
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
        ? `http://localhost:3005/project/${id}` // update route
        : `http://localhost:3005/project/create`;

      const method = isEditing ? "PUT" : "POST";

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
        navigate("/", { replace: true });
      } else {
        console.error("Failed to submit project:", data);
      }
    } catch (err) {
      console.error("Request failed:", err);
    }
  };

  return (
    <div className="h-screen w-full bg-[#0F1120] flex items-center justify-center">
      <div className="bg-[#1A1C2A] p-10 rounded-xl shadow-xl w-[90%] max-w-2xl">
        <h2 className="text-4xl font-bold text-white text-center mb-8">
          {isEditing ? "Edit Workspace" : "Create Workspace"}
        </h2>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          {/* Workspace Name */}
          <div className="flex flex-col gap-2">
            <label className="text-white text-lg font-medium">Workspace Name</label>
            <input
              type="text"
              placeholder="e.g., Project Alpha"
              className="bg-[#232536] text-white px-4 py-3 rounded-lg focus:outline-none"
              value={names}
              onChange={(e) => dispatch(actions.userNames(e.target.value))}
            />
          </div>

          {/* Company Name */}
          <div className="flex flex-col gap-2">
            <label className="text-white text-lg font-medium">Company Name</label>
            <input
              type="text"
              placeholder="e.g., TechNova Pvt Ltd"
              className="bg-[#232536] text-white px-4 py-3 rounded-lg focus:outline-none"
              value={companyName}
              onChange={(e) => dispatch(actions.userCompany(e.target.value))}
            />
          </div>

          {/* Company Email */}
          <div className="flex flex-col gap-2">
            <label className="text-white text-lg font-medium">Company Email</label>
            <input
              type="email"
              placeholder="e.g., contact@technova.com"
              className="bg-[#232536] text-white px-4 py-3 rounded-lg focus:outline-none"
              value={companyEmail}
              onChange={(e) => dispatch(actions.userEmail(e.target.value))}
            />
          </div>

          {/* Company Address */}
          <div className="flex flex-col gap-2">
            <label className="text-white text-lg font-medium">Company Address</label>
            <input
              type="text"
              placeholder="e.g., Hyderabad, India"
              className="bg-[#232536] text-white px-4 py-3 rounded-lg focus:outline-none"
              value={companyAddress}
              onChange={(e) => dispatch(actions.userAddress(e.target.value))}
            />
          </div>

          <button
            type="submit"
            className="bg-gradient-to-r from-purple-500 to-fuchsia-600 text-xl text-white py-3 rounded-lg font-semibold shadow-md hover:opacity-90 transition"
          >
            {isEditing ? "Save Changes" : "Create Workspace"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateWorkspace;
