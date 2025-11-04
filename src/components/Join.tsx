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

  const {code} = useSelector((store: RootStates) => store.projectStore )

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
        localStorage.setItem("ProjectId", data.projectId)
        navigate("/", { replace: true });
        console.log(data)
      }
    } catch (e) {
      console.log("post failed", e);
    }

  }

  return (
    <div className="h-screen w-full bg-[#0F1120] flex items-center justify-center">
      <div className="bg-[#1A1C2A] p-10 rounded-xl shadow-xl w-[90%] max-w-md">
        <h2 className="text-4xl font-bold text-white text-center mb-8">
          Join Workspace
        </h2>

        <form className="flex flex-col gap-6"
        onSubmit={handleJoinPage}>

          {/* Workspace Code */}
          <div className="flex flex-col gap-2">
            <label className="text-white text-lg font-medium">Workspace Code</label>
            <input
              type="text"
              placeholder="e.g., ALPHA123"
              className="bg-[#232536] text-white px-4 py-3 rounded-lg focus:outline-none"
              value={code}
              onChange={(e) => dispatch(actions.userCode(e.target.value))}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-500 to-fuchsia-600 text-xl text-white py-3 rounded-lg font-semibold shadow-md hover:opacity-90 transition"
          >
            Join Workspace
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinWorkspace;
