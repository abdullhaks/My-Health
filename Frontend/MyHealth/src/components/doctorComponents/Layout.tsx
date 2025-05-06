import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  FaHome, FaUserFriends, FaCalendarCheck, FaComments, FaChartBar,
  FaSignOutAlt, FaBars, FaTimes, FaChevronLeft, FaChevronRight,
  FaSearch, FaBell, FaEnvelope
} from "react-icons/fa";
import { GiRoyalLove } from "react-icons/gi"; 
import applogoBlue from "../../assets/applogoblue.png";
import defaultAvatar from "../../assets/avatar.png";
import ConfirmModal from "../../sharedComponents/ConfirmModal";
import { useDispatch, useSelector } from "react-redux";
import { logoutDoctor } from "../../redux/slices/doctorSlices";
import { RootState } from "../../redux/store/store";
import SubscriptionModal from "../doctorComponents/DoctorSubscription";

interface DoctorLayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<DoctorLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const doctor = useSelector((state: RootState) => state.doctor.doctor);
  const isPremium = doctor?.premiumMembership;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setCollapsed(true);
      else setMobileOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    dispatch(logoutDoctor());
    navigate("/doctor/login");
  };

  const toggleSidebar = () => {
    if (window.innerWidth < 768) setMobileOpen(!mobileOpen);
    else setCollapsed(!collapsed);
  };

  const handleMobileLinkClick = () => {
    if (window.innerWidth < 768 && mobileOpen) setMobileOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching:", searchInput);
  };

  const menuItems = [
    { name: "Dashboard", path: "/doctor/dashboard", icon: <FaHome /> },
    { name: "Patients", path: "/doctor/patients", icon: <FaUserFriends /> },
    {
      name: "Appointments",
      path: "/doctor/appointments",
      icon: <FaCalendarCheck />,
      premium: true
    },
    {
      name: "Chat",
      path: "/doctor/chat",
      icon: <FaComments />
    },
    {
      name: "Report Analyses",
      path: "/doctor/reports",
      icon: <FaChartBar />,
      premium: true
    }
  ];

  const renderMenuItems = () => {
    return menuItems.map((item, index) => {
      const isActive = location.pathname === item.path;
      const isPremiumOnly = item.premium && !isPremium;
      return (
        <Link
            to={isPremiumOnly ? "#" : item.path}
            key={index}
            onClick={(e) => {
                handleMobileLinkClick();
                if (isPremiumOnly) {
                e.preventDefault();
                setShowSubscription(true);
                }
            }}
            className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-all duration-200 relative ${
                isActive
                ? "bg-gradient-to-r from-purple-700 to-pink-500 text-white shadow-md"
                : isPremiumOnly
                ? "text-gray-400 cursor-pointer hover:bg-purple-50"
                : "text-gray-700 hover:bg-purple-50"
            }`}
            >

          <span className={`text-xl ${isActive ? "text-white" : "text-purple-700"}`}>
            {isPremiumOnly ? <GiRoyalLove className="text-yellow-500" /> : item.icon}
          </span>
          {!collapsed && (
            <span
              className={`ml-3 font-medium whitespace-nowrap ${
                isPremiumOnly ? "text-gray-400" : ""
              }`}
            >
              {item.name}
            </span>
          )}
          {collapsed && isActive && (
            <div className="absolute left-0 w-1 h-8 bg-purple-500 rounded-r-full"></div>
          )}
        </Link>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-20"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      <button
        className="fixed top-2 left-1 z-30 p-1 rounded-md bg-purple-700 text-white md:hidden shadow-lg"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <FaTimes /> : <FaBars />}
      </button>

      <aside
        className={`fixed top-0 left-0 h-full bg-white z-20 shadow-xl transition-all duration-300 ${
          collapsed ? "w-20" : "w-56"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex items-center justify-between px-2 py-2 border-b border-gray-100">
          <div className={collapsed ? "mx-auto" : "flex items-center"}>
            <img src={applogoBlue} alt="Doctor Logo" className="h-10 w-auto object-contain" />
          </div>
        </div>

        <div className="h-[calc(100%-64px)] overflow-y-auto py-4 px-3">
          <div className="space-y-6">
            <div className="space-y-1">{renderMenuItems()}</div>
            <div className="border-t border-gray-200 my-2"></div>
            <div
              className="px-1 cursor-pointer"
              onClick={() => {
                handleMobileLinkClick();
                setShowConfirm(true);
              }}
            >
              <p className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600">
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
          className="absolute bottom-4 -right-3 hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white text-purple-700 border border-purple-300 hover:bg-purple-50 transition-colors shadow-md"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
        </button>
      </aside>

      <div
        className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ${
          collapsed ? "md:ml-20" : "md:ml-56"
        }`}
      >
        <header className="fixed top-0 right-0 left-0 z-10 h-16 bg-white shadow-md">
          <div className="flex items-center justify-between h-full px-4">
            <div className="flex-1 max-w-xl mx-auto px-4">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={handleSearchChange}
                  placeholder="Search..."
                  className="w-full py-2 pl-10 pr-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                />
                <button
                  type="submit"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-700"
                >
                  <FaSearch />
                </button>
              </form>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 rounded-full hover:bg-purple-50 text-purple-700">
                <FaBell />
              </button>
              <button className="relative p-2 rounded-full hover:bg-purple-50 text-purple-700 hidden md:block">
                <FaEnvelope />
              </button>
              <div className="relative group">
                <button className="flex items-center focus:outline-none">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-600">
                    <img src={defaultAvatar} alt="Doctor Profile" className="w-full h-full object-cover" />
                  </div>
                </button>
                <div className="absolute right-0 mt-0.5 w-48 bg-gray-200 rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
                  <Link to="/doctor/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50">Profile</Link>
                  <Link to="/doctor/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50">Settings</Link>
                  <div className="border-t border-gray-100"></div>
                  <p onClick={() => setShowConfirm(true)} className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer">Sign out</p>
                </div>
              </div>
            </div>
          </div>
        </header>

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




    {showSubscription && (
    <SubscriptionModal onClose={() => setShowSubscription(false)} />
    )}

    </div>
  );
};

export default Layout;
