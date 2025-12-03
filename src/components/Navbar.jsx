import { useNavigate } from "react-router-dom";

export default function NavBar({ userName, setUserName }) {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(userName);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    setUserName(null);
    navigate("/admin/login");
  };

  const handleNavigateHome = () => {
    navigate("/");
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          
          {/* Logo + Admin on same line + Username below */}
          <button
            type="button"
            onClick={handleNavigateHome}
            className="flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg transition-colors duration-200"
          >
            {/* Row: Logo + Admin Panel */}
            <div className="flex items-center gap-1">
              {/* Logo */}
              <div className="w-16 h-10 sm:w-20 sm:h-10 rounded-xl overflow-hidden">
                <img
                  src="https://res.cloudinary.com/dlnyzjn5e/image/upload/v1764753429/ChatGPT_Image_Nov_10_2025_08_57_35_PM_2_1_lldkzn.svg"
                  alt="ReSpare Logo"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Admin */}
              <span className="text-xs sm:text-sm font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">
                Admin Panel
              </span>
            </div>

            {/* Username below */}
            {isLoggedIn && (
              <div className="flex items-center gap-1.5 mt-1 ml-1">
                <svg
                  className="w-3 h-3 text-black"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-xs text-blue-700 font-medium">{userName}</p>
              </div>
            )}
          </button>

          {/* Logout Section */}
          <div className="flex items-center gap-3">
            {isLoggedIn && (
              <>
                {/* Desktop Logout */}
                <button
                  className="hidden sm:flex items-center gap-2 text-white font-semibold text-sm transition-all duration-200 
                             border border-red-500/50 px-4 py-2 rounded-lg 
                             bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 
                             shadow hover:shadow-md hover:scale-105"
                  onClick={handleLogout}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>

                {/* Mobile Logout */}
                <button
                  className="sm:hidden flex items-center justify-center w-9 h-9 text-white transition-all duration-200 
                             border border-red-500/50 rounded-lg 
                             bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 
                             shadow hover:shadow-md"
                  onClick={handleLogout}
                  aria-label="Logout"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
