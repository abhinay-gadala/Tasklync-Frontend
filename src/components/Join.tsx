import React from "react";
import { useSelector, useDispatch } from "react-redux";
import projectSlice from "../redux/projectSlice";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";


interface RootStates {
  projectStore: {
    code: string;
  };
}


const actions = projectSlice.actions

const JoinWorkspace: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { code } = useSelector((store: RootStates) => store.projectStore)

  const handlingJoinSuccess = async (): Promise<string> => {
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


  const handleJoinPage = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const token = Cookies.get("jwt_Token");
      const formData = {
        code
      };

      const response = await fetch("http://localhost:3005/project/join", {
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
        const fetchedRole = await handlingJoinSuccess();
        Cookies.set("role", fetchedRole, { expires: 7 });
        navigate("/", { replace: true });
        console.log(data)
      }
    } catch (e) {
      console.log("post failed", e);
    }

  }

  return (
    <div className="h-screen w-full bg-[#F8FAFC] flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] w-[90%] max-w-md">
        <h2 className="text-4xl font-bold text-[#0F172A] tracking-tight text-center mb-10">
          Join Workspace
        </h2>

        <form className="flex flex-col gap-6"
          onSubmit={handleJoinPage}>

          {/* Workspace Code */}
          <div className="flex flex-col gap-2">
            <label className="text-[#64748B] text-sm font-medium tracking-wide uppercase">Workspace Code</label>
            <input
              type="text"
              placeholder="e.g., ALPHA123"
              className="bg-white border border-[#E5E7EB] text-[#0F172A] px-4 py-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              value={code}
              onChange={(e) => dispatch(actions.userCode(e.target.value))}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-xl text-white py-3.5 rounded-lg font-semibold shadow-sm transition-all"
          >
            Join Workspace
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinWorkspace;
