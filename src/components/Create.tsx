import React from "react";
import { useSelector, useDispatch } from "react-redux";
import projectSlice from "../redux/projectSlice";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

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
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { names, companyName, companyEmail, companyAddress } = useSelector(
    (store: RootStates) => store.projectStore
  );

  const handlingSuccess = async (): Promise<string> => {
    const id = localStorage.getItem("userId");
    const url = `http://localhost:3005/user/details/${id}`;

    try {
      const response = await fetch(url, { method: "GET" });
      const data = await response.json();

      if (response.ok) {
        return data.user.role;
      } else {
        return "pending";
      }
    } catch (e) {
      console.log("fetch failed", e);
      return "pending";
    }
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = Cookies.get("jwt_Token");
      const formData = {
        name: names,
        companyName,
        companyEmail,
        companyAddress,
      };

      const response = await fetch("http://localhost:3005/project/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
           Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
        // credentials: "include", // uncomment if backend uses cookies
      });

      const data = await response.json();

      if (response.ok) {
        const fetchedRole = await handlingSuccess();
        Cookies.set("role", fetchedRole, { expires: 7 });
        localStorage.setItem("Code", data.projectCode);
        navigate("/", { replace: true });
      }
    } catch (e) {
      console.log("post failed", e);
    }
  };

  return (
    <div className="h-screen w-full bg-[#0F1120] flex items-center justify-center">
      <div className="bg-[#1A1C2A] p-10 rounded-xl shadow-xl w-[90%] max-w-2xl">
        <h2 className="text-4xl font-bold text-white text-center mb-8">
          Create Workspace
        </h2>
        {/* ✅ Fixed form submission */}
        <form
          className="flex flex-col gap-6"
          onSubmit={handleCreatePage}
        >
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

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-500 to-fuchsia-600 text-xl text-white py-3 rounded-lg font-semibold shadow-md hover:opacity-90 transition"
          >
            Create Workspace
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateWorkspace;
