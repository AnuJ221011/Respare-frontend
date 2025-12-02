import { useNavigate } from "react-router-dom";

export default function NavBar({ userName, setUserName }) {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(userName);

  console.log("UserName in NavBar:", userName);

  const handleLogout = () => {
    // Clear stored token
    localStorage.removeItem("token");
    // Clear stored username
    localStorage.removeItem("userName");

    // Update user state to logged out (empty or null)
    setUserName(null);

    // Navigate to login page
    navigate("/admin/login");
  };

  return (
    <header className="w-full border-b border-gray-200">
      <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-[22px] font-semibold text-gray-800 leading-none">
            ReSpare Admin
          </h1>

          {isLoggedIn && (
            <p className="text-sm text-blue-500 mt-0.5">{userName}</p>
          )}
        </div>

        {isLoggedIn && (
          <button
            className="text-white font-medium text-sm transition-colors duration-200 cursor-pointer border border-gray-400 px-2 py-1 rounded-lg bg-red-500 hover:bg-red-600"
            onClick={handleLogout}
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
