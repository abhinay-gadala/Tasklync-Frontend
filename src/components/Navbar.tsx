import { useEffect, useState } from "react";
import Cookie from "js-cookie";
import {  useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();


  const onClickSubmit = () => {
    Cookie.remove("jwt_Token");
    navigate("/login", { replace: true })
  }

  // Close mobile menu on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gray-800 border-b border-gray-700">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Logo and Mobile Menu Button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-asana-blue"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <svg
              className="w-6 h-6 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              )}
            </svg>
          </button>
          <a href="/" className="flex items-center space-x-2">
            <img src="https://res.cloudinary.com/dy21aey3k/image/upload/v1758796031/Screenshot_2025-09-25_155207_lt0qzz.png" alt="tasklync" className="w-20"/>
            {/* <span className="text-xl font-bold text-gray-200">Tasklync</span> */}
          </a>
        </div>

        {/* Centered Search Bar */}
        <div className="flex-1 max-w-lg mx-auto hidden md:flex items-center bg-gray-700 rounded-full px-4 py-2 ring-1 ring-gray-600">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search"
            className="flex-1 bg-transparent focus:outline-none ml-2 text-gray-200"
          />
        </div>

        {/* Desktop Nav Links and User Profile */}
        <div className="flex items-center space-x-4">
          <button
            className="text-gray-300 hover:text-asana-blue font-medium hidden md:block"
          >
            My Tasks
          </button>
          <button
            className="text-gray-300 hover:text-asana-blue font-medium hidden md:block"
            onClick={onClickSubmit}
          >
            Logout
          </button>
          <div className="relative">
            <img
              src="https://i.pravatar.cc/300?u=a042581f4e29026704d"
              alt="User Avatar"
              className="w-8 h-8 rounded-full cursor-pointer ring-2 ring-asana-logo"
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-60' : 'max-h-0'
        }`}
      >
        <div className="px-4 py-2 space-y-2 border-t border-gray-700">
          <button
            className="block text-gray-300 hover:text-asana-blue font-medium py-2 rounded-md"
          >
            My Tasks
          </button>
          <button
            className="block text-gray-300 hover:text-asana-blue font-medium py-2 rounded-md"
            onClick={onClickSubmit}
          >
            Logout
          </button>
          {/* Centered Search Bar for mobile */}
          <div className="flex items-center bg-gray-700 rounded-full px-4 py-2 ring-1 ring-gray-600">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search"
              className="flex-1 bg-transparent focus:outline-none ml-2 text-gray-200"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};


export default Navbar