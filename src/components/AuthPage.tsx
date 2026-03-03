import React, { useState } from "react";
import LoginForm from "../components/LoginForm";
import SignupForm from "../components/SignupForm";

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Left side - Image / Branding */}
      <div className="hidden md:flex flex-col justify-between w-1/2 bg-[#F8FAFC] border-r border-[#E5E7EB] text-[#0F172A] p-10">
        <div className="flex justify-end">

        </div>

        <div className="flex flex-col items-center justify-center text-center h-full">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
            alt="Auth Visual"
            className="rounded-2xl shadow-lg mb-8"
          />
          <h2 className="text-3xl font-semibold leading-snug tracking-tight text-[#0F172A]">
            Alone we can do so little, <br />  together we can do so much.
          </h2>
        </div>

      </div>

      {/* Right side - Form */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white px-10 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-10">
        {isLogin ? (
          <LoginForm onToggle={() => setIsLogin(false)} />
        ) : (
          <SignupForm onToggle={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
};

export default AuthPage;
