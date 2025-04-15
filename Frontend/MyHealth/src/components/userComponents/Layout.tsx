import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {FaHome,FaUserMd, FaCalendarAlt, FaFileMedical, FaClipboardList, FaUserFriends,FaChartLine, FaBell,
  FaCog, FaSignOutAlt, FaBars, FaTimes,FaChevronLeft,FaChevronRight, FaSearch, FaEnvelope,
} from "react-icons/fa";
import applogoBlue from "../../assets/applogoblue.png";
import defaultAvatar from "../../assets/avatar.png";
import ConfirmModal from "../../sharedComponents/ConfirmModal";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/slices/userSlices";

interface NavbarProps {
  children: React.ReactNode;
}

const Layout: React.FC<NavbarProps> = ({ children }) => {

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [notificationCount, setNotificationCount] = useState(3);
  const [messageCount, setMessageCount] = useState(2);
  const [showConfirm, setShowConfirm] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();



  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      } else {
        setMobileOpen(false);
      }
    };

    setNotificationCount(3);
    setMessageCount(2);

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);


  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };


  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const handleMobileLinkClick = () => {
    if (window.innerWidth < 768 && mobileOpen) {
      setMobileOpen(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchInput);
  };

  const menuItems = [
    { name: "Dashboard", path: "/user/dashboard", icon: <FaHome /> },
    { name: "Doctors", path: "/user/doctors", icon: <FaUserMd /> },
    { name: "Appointments", path: "/user/appointments", icon: <FaCalendarAlt /> },
    { name: "Medical Records", path: "/user/records", icon: <FaFileMedical /> },
    { name: "Prescriptions", path: "/user/prescriptions", icon: <FaClipboardList /> },
    { name: "My Profile", path: "/user/profile", icon: <FaUserFriends /> },
  ];

  const secondaryMenuItems = [
    { name: "Analytics", path: "/user/analytics", icon: <FaChartLine /> },
    { name: "Notifications", path: "/user/notifications", icon: <FaBell /> },
    { name: "Settings", path: "/user/settings", icon: <FaCog /> },
  ];

  const renderMenuItems = (items: any) => {
    return items.map((item: any, index: number) => {
      const isActive = location.pathname === item.path;

      return (
        <Link
          to={item.path}
          key={index}
          className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-all duration-200 ${
            isActive
              ? "bg-gradient-to-r from-blue-800 to-blue-600 text-white shadow-md"
              : "text-gray-700 hover:bg-blue-50"
          }`}
          onClick={handleMobileLinkClick}
        >
          <span className={`text-xl ${isActive ? "text-white" : "text-blue-800"}`}>{item.icon}</span>
          {!collapsed && (
            <span className="ml-3 font-medium whitespace-nowrap">{item.name}</span>
          )}
          {collapsed && isActive && (
            <div className="absolute left-0 w-1 h-8 bg-cyan-400 rounded-r-full"></div>
          )}
        </Link>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-transparent bg-opacity-50 z-20"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      <button
        className="fixed top-2 left-1 z-30 p-1 rounded-md bg-blue-700 text-white md:hidden shadow-lg"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar (keep as is) */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white z-20 shadow-xl transition-all duration-300 ${
          collapsed ? "w-20" : "w-56"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex items-center justify-between px-2 py-2 border-b border-gray-100">
          <div className={collapsed ? "mx-auto" : "flex items-center"}>
            <img
              src={applogoBlue}
              alt="MyHealth"
              className="h-10 w-auto object-contain"
            />
          </div>
        </div>

        <div className="h-[calc(100%-64px)] overflow-y-auto py-4 px-3">
          <div className="space-y-6">
            <div className="space-y-1">{renderMenuItems(menuItems)}</div>
            <div>
              {!collapsed && (
                <h3 className="px-3 mb-2 text-xs uppercase font-semibold text-gray-500">More</h3>
              )}
              <div className="space-y-1">{renderMenuItems(secondaryMenuItems)}</div>
            </div>
            <div className="border-t border-gray-200 my-2"></div>
            <div className="px-1 cursor-pointer" onClick={()=>{handleMobileLinkClick (); setShowConfirm(true);}}>
              <p
                className="flex items-center px-4 py-3  rounded-lg transition-all duration-200 text-gray-700 hover:bg-red-50 hover:text-red-600"
                
                aria-label="Logout"
              >
                <span className="text-xl text-red-500">
                  <FaSignOutAlt />
                </span>
                {!collapsed && <span className="ml-3 font-medium">Logout</span>}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={toggleSidebar}
          className="absolute bottom-4 -right-3 hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white text-blue-800 border border-blue-200 hover:bg-blue-50 transition-colors shadow-md"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
        </button>
      </aside>

      {/* Main area (keep top nav, update content area) */}
      <div
        className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ${
          collapsed ? "md:ml-20" : "md:ml-56"
        }`}
      >
        {/* Top bar (keep as is) */}
        <header className="fixed top-0 right-0 left-0 z-10 h-16 bg-white shadow-md">
          <div className="flex items-center justify-between h-full px-4">
            
            <div className="flex-1 max-w-xl mx-auto px-4">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={handleSearchChange}
                  placeholder="Search for doctors, appointments..."
                  className="w-full py-2 pl-10 pr-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
                <button
                  type="submit"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-800"
                >
                  <FaSearch />
                </button>
              </form>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="p-2 rounded-full hover:bg-blue-50 text-blue-800 transition-colors">
                  <FaBell />
                  {notificationCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </span>
                  )}
                </button>
              </div>
              <div className="relative hidden md:block">
                <button className="p-2 rounded-full hover:bg-blue-50 text-blue-800 transition-colors">
                  <FaEnvelope />
                  {messageCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {messageCount > 9 ? "9+" : messageCount}
                    </span>
                  )}
                </button>
              </div>
              <div className="relative group">
                <button className="flex items-center focus:outline-none">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-600">
                    <img src={defaultAvatar} alt="User profile" className="w-full h-full object-cover" />
                  </div>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
                  <Link to="/user/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">
                    Your Profile
                  </Link>
                  <Link to="/user/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">
                    Settings
                  </Link>
                  <div className="border-t border-gray-100"></div>
                  <p  onClick={() => setShowConfirm(true)}  className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer">
                    Sign out
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content - Updated to center content properly */}
        <main className="flex-1 pt-20 pb-8 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>

      {showConfirm && (
        <ConfirmModal
          message="Are you sure you want to log out?"
          onConfirm={handleLogout}
          onCancel={() => setShowConfirm(false)}
        />
      )}


    </div>
    
  );
};

export default Layout;