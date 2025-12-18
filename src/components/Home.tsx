import { useState, Suspense, lazy } from "react";
import Navbar from "./Navbar";
import Slide from "./Slide";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import ErrorBoundary from "./ErrorBoundary";
import { ClipLoader } from 'react-spinners'

// Lazy load view components for better performance
const Dashboard = lazy(() => import("../components/Dashboard"));
const Tasks = lazy(() => import("../components/Tasks"));
const Inbox = lazy(() => import("../components/Inbox"));
const Reporting = lazy(() => import("../components/Reporting"));
const Portfolios = lazy(() => import("../components/Portfolios"));
const Goals = lazy(() => import("../components/Goals"));
const Workspace = lazy(() => import("../components/Workspace"));
const ProjectView = lazy(() => import("../components/ProjectView"));

const Home: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const activeView = useSelector((state: RootState) => state.viewStore.activeView);

  // Loading fallback component
  const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-[200px]">
<ClipLoader color="#e72be4" size={60} />
    </div>
  );

  const renderContent = () => {
    const content = (
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          {(() => {
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
                return <Workspace />;
              default:
                if (activeView.startsWith("project-")) {
                  return <ProjectView/>;
                }
                return <Dashboard />;
            }
          })()}
        </Suspense>
      </ErrorBoundary>
    );
    return content;
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-900 text-white">
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-gray-800 border-b border-gray-700 z-50">
        <Navbar />
      </div>

      {/* Body Container: Starts below navbar */}
      <div className="flex flex-1 pt-14">
        {/* Sidebar */}
        <aside
          className={`fixed md:sticky top-14 h-[calc(100vh-3.5rem)] bg-gray-800 border-r border-gray-700 w-64 transform transition-transform duration-300 ease-in-out z-40 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <Slide onClose={() => setIsSidebarOpen(false)} />
        </aside>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar overlay"
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 bg-gray-900 p-4 sm:p-6 relative">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden fixed bottom-6 left-4 bg-gray-800 hover:bg-gray-700 p-3 rounded-full shadow-lg z-30 transition-colors"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </main>
      </div>
    </div>
  );
};

export default Home;
