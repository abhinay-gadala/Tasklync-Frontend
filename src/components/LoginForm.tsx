import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import { useNavigate, Navigate, useSearchParams } from "react-router-dom";
import userSlice from "../redux/userSlice";
import type { RootState } from "../redux/store";

interface LoginFormProps {
  onToggle: () => void;
}

interface userData {
  _id: string;
  name: string;
  role: string;
  needsPasswordReset?: boolean;
}

const actions = userSlice.actions;

const LoginForm: React.FC<LoginFormProps> = ({ onToggle }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const inviteEmail = params.get("email") || "";

  const { email, password, error, showError } = useSelector(
    (store: RootState) => store.userStore
  );

  useEffect(() => {
    if (inviteEmail) {
      dispatch(actions.userEmail(inviteEmail));
    }
  }, [inviteEmail]);

  const onSubmitsuccessForm = (jwtToken: string, user: userData, needsReset: boolean) => {
    Cookies.set("jwt_Token", jwtToken, { expires: 30 });
    Cookies.set("role", user.role, { expires: 30 });

    localStorage.setItem("userId", user._id);
    localStorage.setItem("customerName", user.name);

    // 🔥 FORCE NEW PASSWORD
    if (needsReset) {
      navigate(`/set-password?id=${user._id}&email=${user.name}`, {
        replace: true,
      });
      return;
    }

    // Normal redirect
    navigate("/", { replace: true });
  };

  const onsubmitFailed = (err: string) => {
    dispatch(actions.userError(err));
    dispatch(actions.userShowError());
  };

  const onSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = `${import.meta.env.VITE_API_URL}/user/login`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        onSubmitsuccessForm(data.token, data.user, data.needsPasswordReset);
      } else {
        onsubmitFailed(data.error_msg || "Login Failed");
      }
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  const jwtToken = Cookies.get("jwt_Token");
  if (jwtToken !== undefined) {
    return <Navigate to="/" />;
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-3xl font-bold text-[#0F172A] mb-2 tracking-tight">Taskync</h1>
      <h2 className="text-2xl font-semibold text-[#64748B] mb-8 tracking-tight">
        Welcome back
      </h2>

      {inviteEmail && (
        <p className="text-purple-600 font-medium text-sm mb-4 bg-purple-50 p-3 rounded-lg border border-purple-100">
          You were invited. Use your temporary password from email.
        </p>
      )}

      <form className="space-y-4" onSubmit={onSubmitForm}>
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-3 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-[#0F172A] 
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          value={email}
          onChange={(e) => {
            dispatch(actions.userEmail(e.target.value));
          }}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-3 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-[#0F172A] 
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          value={password}
          onChange={(e) => {
            dispatch(actions.userPassword(e.target.value));
          }}
        />

        {showError && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full py-3 mt-2 bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm 
                     text-white font-medium transition-all"
        >
          Log In
        </button>
      </form>

      <p className="text-sm text-[#64748B] text-center mt-8 font-medium">
        Don’t have an account?{" "}
        <button
          onClick={onToggle}
          className="text-purple-600 hover:text-purple-700 hover:underline font-semibold transition-colors"
        >
          Sign up
        </button>
      </p>
    </div>
  );
};

export default LoginForm;
