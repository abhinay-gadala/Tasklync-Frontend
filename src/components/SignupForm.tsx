import  React from "react";
import Cookies from "js-cookie";
import { useNavigate, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import userSlice from "../redux/userSlice";

interface SignupFormProps {
  onToggle: () => void;
}

interface RootState {
  userStore: {
    name: string;
    email: string;
    password: string;
    error: string;
    showError: boolean;
    customerName: string
  };
}

interface userData {
  _id: string,
  name: string,
  role: string
}

const actions = userSlice.actions;

const SignupForm: React.FC<SignupFormProps> = ({ onToggle }) => {
  const dispatch = useDispatch();
  const {name, email, password, error, showError} = useSelector((store: RootState) => store.userStore);


  const navigate = useNavigate();

  const onSubmitSuccess = (jwtToken: string, user: userData) => {
    Cookies.set("jwt_Token", jwtToken, { expires: 7 });
    localStorage.setItem("userId", user._id)
    // store display name and update redux before navigating so UI reads it immediately
    localStorage.setItem("customerName", user.name);
    navigate("/select", { replace: true });
  }

  const onSubmitFailed = (error_msg: string) => {
    dispatch(actions.userError(error_msg));
    dispatch(actions.userShowError());
    

  }

  const submitForm = async (e: React.FormEvent) => {
      e.preventDefault();
      const url = "http://localhost:3005/user/signup";
      const fetchData = {name, email, password};
      try{
        const option = {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(fetchData)
        }

        const response = await fetch(url, option);
        const data = await response.json();
        if(response.ok){
          onSubmitSuccess(data.token, data.user);
        }
        else{
          onSubmitFailed(data.error_msg || "Signup failed");
        }

      }
      catch(err){
        console.error("Signup failed", err);
      }
    
    }

  const jwtToken = Cookies.get("jwt_Token");
  if (jwtToken !== undefined) {
    return <Navigate to="/select" />;
  } 


  return (
    <div className="w-full max-w-sm">
     <h1 className="text-3xl font-semibold text-white mb-6">
        TaskLync
     </h1>
      <h2 className="text-3xl font-semibold text-white mb-6">
        Create an account
      </h2>
      <form className="space-y-4" onSubmit={submitForm}>
          <input
            type="text"
            placeholder="Full name"
            className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white 
                     focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={name}
            onChange={(e) => dispatch(actions.userName(e.target.value)) }
          
          />
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white 
                     focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={email}
          onChange={(e) => dispatch(actions.userEmail(e.target.value))}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white 
                     focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={password}
          onChange={(e) => dispatch(actions.userPassword(e.target.value))}
        />
        {showError && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg 
                     text-white font-medium transition"
        >
          Sign Up
        </button>
      </form>

      <p className="text-sm text-gray-400 text-center mt-6">
        Already have an account?{" "}
        <button
          onClick={onToggle}
          className="text-purple-400 hover:underline font-medium"
        >
          Log in
        </button>
      </p>
    </div>
  );
};

export default SignupForm;

