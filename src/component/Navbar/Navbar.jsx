import "../Navbar/Navbar.css";
import { useEffect, useState, useRef } from "react";
import { Search, Bell, Menu, X, LogOut } from "lucide-react";
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
      <nav className="bg-white shadow-md md:mb-1">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Desktop Navigation */}
            <div className="flex items-center">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <div className="text-indigo-600 font-bold text-2xl flex items-center">
                  <div className="logo font-aclonica tracking-wider ">
                    <Link to={"/"}><img src="/لقطة شاشة 2025-07-26 184513.png" className="w-12 h-12" alt="Logo" /></Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Bar - Desktop */}

            {/* <div className=" flex items-center flex-1 max-w-md mx-4">
              <div className="w-full">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>

                  <input
                    type="text"
                    className=" block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-gray-50 focus:outline-none  focus:ring-1 focus:ring-[#3362C8] focus:border-[#3362C8] sm:text-sm"
                    placeholder="Search..."
                  value={search}
                 onChange={(e) => setSearch(e.target.value)}
                  />
{search && (
  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
    {filteredUsers.length > 0 ? (
      filteredUsers.map((user) => (
        <Link
          key={user.id}
          to={`/profileusers/${user.id}`}
          className="flex items-center p-2 hover:bg-gray-100 transition-colors"
          onClick={() => setSearch("")} // لإخفاء النتائج عند الضغط
        >
          <img
            src={`${Domain}/${user.pictureUrl}` || "/default-profile.png"}
            alt={user.displayname}
            className="w-8 h-8 rounded-full object-cover mr-2"
          />
          <span className="text-sm">{user.displayname}</span>
        </Link>
      ))
    ) : (
      <div className="p-2 text-sm text-gray-500">No users found</div>
    )}
  </div>
)}
                </div>
              </div>
            </div> */}

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
                      <span className="text-sm font-semibold text-gray-700 select-none">
                        {userName || "My Account"}
                      </span>
                    </button>

                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-150 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50/55 transition font-semibold"
                        >
                          👤 Profile
                        </Link>
                        <hr className="my-1 border-gray-100" />
                        <button
                          onClick={(e) => {
                            setIsProfileDropdownOpen(false);
                            Logout(e, setError, setLoading, navigate);
                          }}
                          style={{ display: 'flex', alignItems: 'center' }}
                          className="w-full text-left block px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition font-semibold"
                        >
                          <LogOut /> <span className="pl-2">Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="auth-buttons">
                  <button className="login-btn py-[4px] px-[18px]">
                    <Link to={"/login"}>Log in</Link>
                  </button>
                  <button className="signup-btn py-[4px] px-[18px]">
                    <Link to={"/signup"}>Sign Up</Link>
                  </button>
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
                  className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition duration-200"
                >
                  <img
                    className="h-12 w-12 rounded-full object-cover border-2 border-indigo-500"
                    src={getProfileImageUrl(userPicture)}
                    alt="User profile"
                  />
                  <div className="overflow-hidden">
                    <div className="text-base font-bold text-gray-800 truncate">{userName}</div>
                    <div className="text-xs text-gray-500 truncate">{userEmail}</div>
                  </div>
                </Link>

                {/* Mobile Menu Links for logged in users */}
                <div className="space-y-1">
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-indigo-50/50 transition"
                  >
                    <span>👤</span> Profile
                  </Link>

                  <button
                    onClick={() => setNotifications(!notifications)}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-indigo-50/55 transition text-left focus:outline-none"
                  >
                    <span className="flex items-center gap-3">
                      <Bell className="w-4 h-4 text-gray-500" /> Notifications
                    </span>
                  </button>

                  <button
                    onClick={(e) => {
                      setIsMenuOpen(false);
                      Logout(e, setError, setLoading, navigate);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition text-left focus:outline-none"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4">
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