import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";

import Navbar from "./Navbar";
import Slide from "./Slide";
import SearchResults from "./SearchResults";

import Dashboard from "../components/Dashboard";
import Tasks from "../components/Tasks";
import Inbox from "../components/Inbox";
import Reporting from "../components/Reporting";
import Portfolios from "../components/Portfolios";
import Goals from "../components/Goals";
import Workspace from "../components/Workspace";
import ProjectView from "../components/ProjectView";



const Home: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { activeView, activeProjectId } = useSelector(
    (state: RootState) => state.viewStore
  );
  const searchQuery = useSelector((state: RootState) => state.searchStore.query);

  const renderContent = () => {
    switch (activeView) {
      case "home":
        return <Dashboard />;

      case "tasks":
        return <Tasks />;

      case "inbox":
        return <Inbox />;

      case "reporting":
        return <Reporting />;

      case "portfolios":
        return <Portfolios />;

      case "goals":
        return <Goals />;

      case "workspace":
        return <Workspace workspaceId={activeProjectId} />;

      case "project":
        return activeProjectId ? (
          <ProjectView projectId={activeProjectId} />
        ) : (
          <Dashboard />
        );

      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-[#E5E7EB] z-50">
        <Navbar />
      </div>

      {/* Body */}
      <div className="flex flex-1 pt-14">
        {/* Sidebar */}
        <aside
          className={`fixed md:sticky top-14 h-[calc(100vh-3.5rem)] bg-white border-r border-[#E5E7EB] shadow-sm z-40 transform transition-all duration-300 w-64 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            }`}
        >
          <Slide onClose={() => setIsSidebarOpen(false)} />
        </aside>

        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 bg-[#F8FAFC] p-4 sm:p-6 relative">
          <div className="max-w-7xl mx-auto">
            {searchQuery ? (
              <SearchResults onClose={() => { }} />
            ) : (
              renderContent()
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden fixed bottom-6 left-4 bg-white hover:bg-gray-50 text-[#0F172A] border border-[#E5E7EB] p-3 rounded-full shadow-lg z-30"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <svg
              className="w-6 h-6 text-[#64748B]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </main>
      </div>
    </div>
  );
};

export default Home;
