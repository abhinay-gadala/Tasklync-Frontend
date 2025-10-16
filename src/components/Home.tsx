import React from "react";
import Navbar from "./Navbar";


const Home: React.FC = () => {


  return (
    <div className="h-screen w-full flex flex-col bg-gray-900 text-white">
      <Navbar/>
      <div className="w-full h-14 bg-gray-800 flex justify-between items-center px-6 border-b border-gray-700">
        <div className="text-xl font-bold">TASKLYNC</div>
        <div className="w-1/3">
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-gray-700 p-2 rounded-full outline-none"
          />
        </div>
      </div>

      {/* ✅ Body: Sidebar + Main Content */}
      <div className="flex flex-1">
        {/* ✅ Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 p-4">
          <h2 className="text-lg font-semibold mb-4">Sidebar</h2>
          {/* Add sidebar items here */}
        </div>

        {/* ✅ Main Content */}
        <div className="flex-1 bg-gray-900 p-6">
          <p>Your main content goes here...</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
