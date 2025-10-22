import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import { useNavigate, Navigate } from "react-router-dom";
import userSlice from "../redux/userSlice";

interface LoginFormProps {
  onToggle: () => void;
}

interface RootState {
  userStore: {
    email: string;
    password: string;
    error: string;
    showError: boolean;
  };
}

const actions = userSlice.actions;

const LoginForm: React.FC<LoginFormProps> = ({ onToggle }) => {
  const dispatch = useDispatch();

  const { email, password, error, showError } = useSelector((store: RootState) => store.userStore)

  const navigate = useNavigate()


  async function fetchData(id: string) {
  const url = `http://localhost:3005/user/details/${id}`;
  try {
    const response = await fetch(url, { method: "GET" });
    const data = await response.json();

    if (response.ok) {
      return data.user.role; // ✅ return role
    } else {
      return "pending";
    }
  } catch (e) {
    console.log("fetch failed", e);
    return "pending";
  }
}

const onSubmitsuccessForm = async (jwtToken: string, userId: string) => {
  Cookies.set("jwt_Token", jwtToken, { expires: 30 });
  localStorage.setItem("userId", userId)

  const userRole = await fetchData(userId); // ✅ store result

  if (userRole === "pending") {
    navigate("/select", { replace: true });
  } else {
    navigate("/", { replace: true });
  }
};


  const onsubmitFailed = (err: string) => {
    dispatch(actions.userError(err));
    dispatch(actions.userShowError());
  } 

  const onSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = "http://localhost:3005/user/login";

    try{
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({email, password})
      })
      const data = await response.json()
      if(response.ok){
        onSubmitsuccessForm(data.token, data.userId)
      }
      else{
        onsubmitFailed(data.error_msg || "login Failed")
      }
    }
    catch(err){
       console.error("Signup failed", err);
    }
  } 

  const jwtToken = Cookies.get("jwt_Token")
  if(jwtToken !== undefined){
    return <Navigate to="/" />
  }


  return (
    <div className="w-full max-w-sm">
     <h1 className="text-3xl font-semibold text-white mb-6">
        TaskLync
     </h1>
      <h2 className="text-3xl font-semibold text-white mb-6">Welcome back</h2>
      <form className="space-y-4" onSubmit={onSubmitForm}>
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white 
                     focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={email}
          onChange={(e) => {dispatch(actions.userEmail(e.target.value))}}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white 
                     focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={password}
          onChange={(e) => {dispatch(actions.userPassword(e.target.value))}}
        />
        {showError && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg 
                     text-white font-medium transition"
        >
          Log In
        </button>
      </form>

      <p className="text-sm text-gray-400 text-center mt-6">
        Don’t have an account?{" "}
        <button
          onClick={onToggle}
          className="text-purple-400 hover:underline font-medium"
        >
          Sign up
        </button>
      </p>
    </div>
  );
};

export default LoginForm;
