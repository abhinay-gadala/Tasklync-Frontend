import { useEffect, useState } from "react";
import Cookie from "js-cookie";
import { useNavigate } from "react-router-dom";


const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const customerName = localStorage.getItem("customerName")

  // Compute a single-letter avatar from the user's first name (safe fallback)
  const avatarLetter = (() => {
    if (!customerName) return '?';
    const first = String(customerName).trim().split(/\s+/)[0];
    return first && first.length > 0 ? first[0].toUpperCase() : '?';
  })();


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
    <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-[#E5E7EB]">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Logo and Mobile Menu Button */}
        <div className="flex items-center space-x-2">
          {/* Mobile menu is toggled via the profile image on small screens.
              Removed the separate hamburger button to simplify UI. */}
          <a href="/" className="flex items-center space-x-2">
            <img src="https://res.cloudinary.com/dy21aey3k/image/upload/v1758796031/Screenshot_2025-09-25_155207_lt0qzz.png" alt="tasklync" className="w-20" />
            {/* <span className="text-xl font-bold text-gray-200">Tasklync</span> */}
          </a>
        </div>

        {/* Centered Search Bar */}
        <div className="flex-1 max-w-lg mx-auto hidden md:flex items-center bg-[#F8FAFC] rounded-full px-4 py-2 ring-1 ring-[#E5E7EB]">
          <svg
            className="w-5 h-5 text-[#64748B]"
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
            className="flex-1 bg-transparent focus:outline-none ml-2 text-[#0F172A] placeholder-[#64748B]"
          />
        </div>

        {/* Desktop Nav Links and User Profile */}
        <div className="flex items-center space-x-4">
          <button
            className="text-[#64748B] hover:text-[#0F172A] font-medium hidden md:block transition-colors"
            onClick={onClickSubmit}
          >
            Logout
          </button>
          <div className="relative">
            <div
              className="w-8 h-8 bg-purple-600 text-white rounded-full cursor-pointer ring-2 ring-asana-logo flex items-center justify-center font-semibold text-base uppercase"
              role="button"
              tabIndex={0}
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              onClick={() => {
                // toggle mobile menu on small screens only
                if (window.innerWidth < 768) setIsMobileMenuOpen(!isMobileMenuOpen);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  if (window.innerWidth < 768) setIsMobileMenuOpen(!isMobileMenuOpen);
                }
              }}
            >
              {avatarLetter}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-60' : 'max-h-0'
          }`}
      >
        <div className="px-4 py-2 space-y-2 border-t border-[#E5E7EB] bg-white">
          <button
            className="block text-[#64748B] hover:text-[#0F172A] font-medium py-2 rounded-md transition-colors"
            onClick={onClickSubmit}
          >
            Logout
          </button>
          {/* Centered Search Bar for mobile */}
          <div className="flex items-center bg-[#F8FAFC] rounded-full px-4 py-2 ring-1 ring-[#E5E7EB]">
            <svg
              className="w-5 h-5 text-[#64748B]"
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
              className="flex-1 bg-transparent focus:outline-none ml-2 text-[#0F172A] placeholder-[#64748B]"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};


export default Navbar