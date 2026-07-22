import "../Navbar/Navbar.css";
import { useEffect, useState, useRef } from "react";
import { Bell, Menu, X, LogOut, LayoutDashboard, Sun, Moon } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Logout } from "../../apicalls/auth";
import Cookies from "js-cookie";
import { Domain } from "../../utels/const";
function Navbar() {
  const token = Cookies.get("token");
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || "");
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("")
  const [userPicture, setUserPicture] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [notifications, setNotifications] = useState(false);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || (document.documentElement.classList.contains("dark") ? "dark" : "light");
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);



  const getProfileImageUrl = (picture) => {
    if (!picture) return "https://www.w3schools.com/howto/img_avatar.png";
    if (picture.startsWith("http")) return picture;
    return `${Domain}/uploads/users/${picture}`;
  };

  useEffect(() => {
    async function fetchUserProfile() {
      if (!token) return;
      try {
        const response = await fetch(`${Domain}/users/me`);
        if (response.ok) {
          const data = await response.json();
          setUserName(data.fullname || "");
          setUserEmail(data.email || "");
          setUserPicture(data.profileImage || "");
          setUserRole(data.role || "");
          localStorage.setItem("userRole", data.role || "");
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
    }
    fetchUserProfile();
  }, [token]);

  // تصفية المستخدمين بناءً على البحث
  const filteredUsers = users.filter((user) =>
    user.displayname && user.displayname.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className=" bg-gray-100 dark:bg-gray-900">
      <ToastContainer />
      <nav className="bg-white dark:bg-gray-800 shadow-md">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Desktop Navigation */}
            <div className="flex items-center">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <div className="text-indigo-600 font-bold text-2xl flex items-center">
                  <div className="logo font-aclonica tracking-wider ">
                    <Link to={"/"}><img src="/لقطة شاشة 2025-07-26 184513.png" className="h-12" alt="Logo" /></Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side icons */}
            <div className="hidden md:flex items-center space-x-4">
              {token ? (
                <>
                  {userRole === "laundry_owner" && (
                    <NavLink
                      to="/laundries/owner"
                      className={({ isActive }) =>
                        `text-sm font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 ${isActive
                          ? "bg-indigo-600 text-white shadow-md"
                          : "text-indigo-600 hover:bg-indigo-50"
                        }`
                      }
                    >
                      🏪 My Laundry
                    </NavLink>
                  )}
                  {userRole?.toLowerCase() === "admin" && (
                    <NavLink
                      to="/admin/laundries/inactive"
                      className={({ isActive }) =>
                        `text-sm font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 ${isActive
                          ? "bg-red-600 text-white shadow-md"
                          : "text-red-600 hover:bg-red-50"
                        }`
                      }
                    >
                      🚫 Inactive Laundries
                    </NavLink>
                  )}
                  <div className="relative"> {/* جعل العنصر الأب نسبيًا */}
                    <button onClick={() => setNotifications(!notifications)} className="p-1 rounded-full  text-gray-500 hover:text-gray-700 focus:outline-none relative">
                      <Bell className="h-6 w-6" />
                    </button>
                    {/* {notifications && <Notification />} */}
                  </div>
                  <div className="relative flex items-center" ref={dropdownRef}>
                    <button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-indigo-50/50 transition duration-200 focus:outline-none"
                    >

                      <img
                        className="h-9 w-9 rounded-full object-cover border-2 border-indigo-500 hover:border-indigo-600 transition-all duration-200"
                        src={getProfileImageUrl(userPicture)}
                        alt="User profile"
                      />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 select-none">
                        {userName || "My Account"}
                      </span>
                    </button>

                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-150 dark:border-gray-700 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50/55 dark:hover:bg-gray-700 transition font-semibold"
                        >
                          👤 Profile
                        </Link>
                        {userRole?.toLowerCase() === "admin" && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/70 dark:hover:bg-gray-700 transition font-bold"
                          >
                            <LayoutDashboard size={16} /> <span>Admin Dashboard</span>
                          </Link>
                        )}
                        <hr className="my-1 border-gray-100 dark:border-gray-700" />
                        <button
                          onClick={toggleTheme}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50/55 dark:hover:bg-gray-700 transition font-semibold cursor-pointer"
                        >
                          {theme === "dark" ? (
                            <Sun size={18} className="text-amber-500" />
                          ) : (
                            <Moon size={18} className="text-indigo-600" />
                          )}
                          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                        </button>
                        <hr className="my-1 border-gray-100 dark:border-gray-700" />
                        <button
                          onClick={(e) => {
                            setIsProfileDropdownOpen(false);
                            Logout(e, () => {}, () => {}, navigate);
                          }}
                          style={{ display: 'flex', alignItems: 'center' }}
                          className="w-full text-left block px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition font-semibold cursor-pointer"
                        >
                          <LogOut size={18} /> <span className="pl-2">Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white focus:outline-none transition cursor-pointer"
                    title="Toggle Dark/Light Mode"
                  >
                    {theme === "dark" ? (
                      <Sun className="h-5 w-5 text-amber-500" />
                    ) : (
                      <Moon className="h-5 w-5 text-indigo-600" />
                    )}
                  </button>
                  <div className="auth-buttons">
                    <button className="login-btn py-[4px] px-[18px]">
                      <Link to={"/login"}>Log in</Link>
                    </button>
                    <button className="signup-btn py-[4px] px-[18px]">
                      <Link to={"/signup"}>Sign Up</Link>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#3362C8]"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state */}
        <div className={`md:hidden ${isMenuOpen ? "block" : "hidden"}`}>
          <div className="pt-2 pb-3 space-y-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `border-l-4 block pl-3 pr-4 py-2 text-base font-medium ${isActive ? "border-l-[#3362C8] text-[#3362C8]" : "border-l-transparent"}`
              }
            >
              Home
            </NavLink>

            {userRole === "laundry_owner" && (
              <NavLink
                to="/laundries/owner"
                className={({ isActive }) =>
                  `border-l-4 block pl-3 pr-4 py-2 text-base font-medium ${isActive ? "border-l-indigo-600 text-indigo-600 bg-indigo-50" : "border-l-transparent text-indigo-600 hover:bg-indigo-50"}`
                }
              >
                🏪 My Laundry
              </NavLink>
            )}

            {userRole?.toLowerCase() === "admin" && (
              <NavLink
                to="/admin/laundries/inactive"
                className={({ isActive }) =>
                  `border-l-4 block pl-3 pr-4 py-2 text-base font-medium ${isActive ? "border-l-red-650 text-red-650 bg-red-50" : "border-l-transparent text-red-650 hover:bg-red-50"}`
                }
              >
                🚫 Inactive Laundries
              </NavLink>
            )}
          </div>

          {/* Mobile action buttons */}

          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            {token ? (
              <div className="px-4 space-y-4">
                {/* User Info Card */}
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 transition duration-200"
                >
                  <img
                    className="h-12 w-12 rounded-full object-cover border-2 border-indigo-500"
                    src={getProfileImageUrl(userPicture)}
                    alt="User profile"
                  />
                  <div className="overflow-hidden">
                    <div className="text-base font-bold text-gray-800 dark:text-gray-100 truncate">{userName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{userEmail}</div>
                  </div>
                </Link>

                {/* Mobile Menu Links for logged in users */}
                <div className="space-y-1">
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-indigo-50/50 dark:hover:bg-gray-700 transition"
                  >
                    <span>👤</span> Profile
                  </Link>

                  {userRole?.toLowerCase() === "admin" && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/70 dark:hover:bg-gray-700 transition"
                    >
                      <LayoutDashboard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Admin Dashboard
                    </Link>
                  )}

                  <button
                    onClick={() => setNotifications(!notifications)}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-indigo-50/55 dark:hover:bg-gray-700 transition text-left focus:outline-none"
                  >
                    <span className="flex items-center gap-3">
                      <Bell className="w-4 h-4 text-gray-500" /> Notifications
                    </span>
                  </button>

                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-indigo-50/55 dark:hover:bg-gray-700 transition text-left focus:outline-none cursor-pointer"
                  >
                    {theme === "dark" ? (
                      <Sun className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Moon className="w-4 h-4 text-indigo-600" />
                    )}
                    <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      setIsMenuOpen(false);
                      Logout(e, () => {}, () => {}, navigate);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition text-left focus:outline-none cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 space-y-3">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-indigo-50/55 dark:hover:bg-gray-700 transition text-left focus:outline-none cursor-pointer"
                >
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Moon className="w-4 h-4 text-indigo-600" />
                  )}
                  <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                </button>

                <div className="auth-buttons flex flex-col gap-2">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full">
                    <button className="login-btn w-full py-2.5 font-bold text-sm rounded-xl">Log in</button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="w-full">
                    <button className="signup-btn w-full py-2.5 font-bold text-sm rounded-xl">Sign Up</button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;