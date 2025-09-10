import { useState, useEffect, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  FaHome, FaUserMd, FaCalendarAlt, FaFileMedical, FaClipboardList, FaUserFriends, FaChartLine, FaBell,
  FaCog, FaSignOutAlt, FaBars, FaTimes, FaChevronLeft, FaChevronRight, FaSearch, FaComments, FaPodcast,
  FaCreditCard, FaBlog, FaPlus, FaUsers, FaInfoCircle
} from "react-icons/fa";
import { BiSolidAnalyse } from "react-icons/bi";
import applogoBlue from "../../assets/applogoblue.png";
import ConfirmModal from "../../sharedComponents/ConfirmModal";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../redux/slices/userSlices";
import { logoutUser as logout, getNotifications } from "../../api/user/userApi";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { message } from "antd";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { IUserData } from "../../interfaces/user";

interface Notification {
  _id:string;
  userId:string;
  date: Date;
  message: string;
  isRead: boolean;
  mention?: string;
  link?: string;
  type: "appointment" | "payment" | "blog" | "add" | "newConnection" | "common" | "reportAnalysis";
  createdAt: Date;
}

interface NavbarProps {
  children: React.ReactNode;
}

const Layout: React.FC<NavbarProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const notificationRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const limit = 10;
  const [notificationSet, setNotificationSet] = useState(1);

  const user = useSelector((state: IUserData) => state.user.user);



      const fetchNotifications = async () => {
      if (!user?._id) return;
      try {
        const response = await getNotifications(user._id, limit, notificationSet);

        if(response.notifications.length){
        console.log("noti respionse are",response);
        setNotifications((prev) => {
            const existingIds = new Set(prev.map((n) => n._id));
            const newNotifications = response.notifications
              .map((n: Notification) => ({
                ...n,
                date: new Date(n.createdAt),
                createdAt: new Date(n.createdAt),
              }))
              .filter((n: Notification) => !existingIds.has(n._id));
            return [...newNotifications, ...prev].sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });

        const unreadCount = response.notifications.filter((n: Notification) => !n.isRead).length;
        setNotificationCount(unreadCount);
        } else {
        setNotificationCount(0);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        message.error("Failed to load notifications.");
      }
    };



  const getAccessToken = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/user/refreshToken",
        {},
        { withCredentials: true }
      );
      return response.data.accessToken;
    } catch (error) {
      console.error("Failed to fetch access token:", error);
      message.error("Session expired. Please log in again.");
      throw error;
    }
  };

  useEffect(() => {
    const setupSocket = async () => {
      if (!user?._id) return;

      let token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("userAccessToken="))
        ?.split("=")[1];

      if (!token) {
        token = await getAccessToken();
      }

      const socket = io(import.meta.env.VITE_REACT_APP_SOCKET_URL || "http://localhost:3000", {
        transports: ["websocket"],
        reconnection: true,
        auth: { token },
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log(`Socket connected for user ${user._id}`);
        socket.emit("join", user._id);
      });

      socket.on("connect_error", async (err) => {
        console.error("Socket connection error:", err.message);
        if (err.message.includes("Invalid or expired token")) {
          try {
            const newToken = await getAccessToken();
            socket.auth = { token: newToken };
            socket.connect();
          } catch {
            message.error("Failed to reconnect. Please log in again.");
          }
        } else {
          // message.error("Failed to connect to notification server: " + err.message);
        }
      });

      socket.on("notification", (notification: Notification) => {

        fetchNotifications();
        // setNotifications((prev) => {
        //   // Prevent duplicate notifications by checking _id
        //   if (prev.some((n) => n._id === notification._id)) {
        //     return prev;
        //   }
        //   const newNotification = {
        //     ...notification,
        //     date: new Date(notification.createdAt),
        //     createdAt: new Date(notification.createdAt),
        //   };
        //   return [newNotification, ...prev];
        // });
        // if (!notification.isRead) {
        //   setNotificationCount((prev) => prev + 1);
        // }
      });

      socket.on("error", ({ message }) => {
        console.error("Socket error:", message);
        message.error(message);
      });
    };

    setupSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.off("connect");
        socketRef.current.off("connect_error");
        socketRef.current.off("notification");
        socketRef.current.off("error");
        socketRef.current.disconnect();
      }
    };
  }, [user?._id]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      } else {
        setMobileOpen(false);
      }
    };

    fetchNotifications();
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [user?._id, notificationSet]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotificationDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    logout();
    navigate("/");
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <FaCalendarAlt className="text-blue-500" />;
      case "payment":
        return <FaCreditCard className="text-green-500" />;
      case "blog":
        return <FaBlog className="text-purple-500" />;
      case "add":
        return <FaPlus className="text-orange-500" />;
      case "newConnection":
        return <FaUsers className="text-indigo-500" />;
      case "reportAnalysis":
        return <BiSolidAnalyse className="text-teal-500" />;
      case "common":
      default:
        return <FaInfoCircle className="text-gray-500" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notification._id ? { ...n, isRead: true } : n
        )
      );
      setNotificationCount((prev) => prev - 1);

      try {
        // await axios.put(
        //   `http://localhost:3000/api/user/notifications/${notification._id}/read`,
        //   {},
        //   { withCredentials: true }
        // );
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
        message.error("Failed to mark notification as read.");
      }
    }

    if (notification.link) {
      navigate(notification.link);
    }

    setShowNotificationDropdown(false);
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(
        `http://localhost:3000/api/user/notifications/read-all`,
        { userId: user._id },
        { withCredentials: true }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setNotificationCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      message.error("Failed to mark all notifications as read.");
    }
  };

  const handleNextPage = () => {
    setNotificationSet((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (notificationSet > 1) {
      setNotificationSet((prev) => prev - 1);
    }
  };

  const menuItems = [
    { name: "Dashboard", path: "/user/dashboard", icon: <FaHome /> },
    { name: "Doctors", path: "/user/doctors", icon: <FaUserMd /> },
    { name: "Appointments", path: "/user/appointments", icon: <FaCalendarAlt /> },
    { name: "Report Analysis", path: "/user/report-analysis", icon: <BiSolidAnalyse /> },
    { name: "Chat", path: "/user/chat", icon: <FaComments /> },
    { name: "MyHealth-Ai", path: "/user/ai", icon: <FaPodcast /> },
    { name: "Blogs", path: "/user/blogs", icon: <FaBlog /> },
    { name: "Transactions", path: "/user/transactions", icon: <FaMoneyBillTransfer /> },
    // { name: "Prescriptions", path: "/user/prescriptions", icon: <FaClipboardList /> },
    { name: "My Profile", path: "/user/profile", icon: <FaUserFriends /> },
  ];

  const secondaryMenuItems = [
    // { name: "Analytics", path: "/user/analytics", icon: <FaChartLine /> },
    // { name: "Notifications", path: "/user/notifications", icon: <FaBell /> },
    { name: "Settings", path: "/user/settings", icon: <FaCog /> },
  ];

  const renderMenuItems = (items: {name:string;path:string;icon:React.ReactNode}[]) => {
    return items.map((item: {name:string;path:string;icon:React.ReactNode}, index: number) => {
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
            <div className="px-1 cursor-pointer" onClick={() => { handleMobileLinkClick(); setShowConfirm(true); }}>
              <p
                className="flex items-center px-4 py-3 rounded-lg transition-all duration-200 text-gray-700 hover:bg-red-50 hover:text-red-600"
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
              <div className="relative" ref={notificationRef}>
                <button
                  className="p-2 rounded-full hover:bg-blue-50 text-blue-800 transition-colors"
                  onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                >
                  <FaBell />
                  {notificationCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </span>
                  )}
                </button>

                {showNotificationDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-300 z-50">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                      {notificationCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                          <FaBell className="mx-auto mb-2 text-2xl" />
                          <p>No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
                              !notification.isRead ? "bg-blue-50" : ""
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 mt-1">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${!notification.isRead ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                                  {notification.message}
                                </p>
                                {notification.mention && (
                                  <p className="text-xs text-blue-600 mt-1">
                                    {notification.mention}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatTimeAgo(notification.createdAt)}
                                </p>
                              </div>
                              {!notification.isRead && (
                                <div className="flex-shrink-0">
                                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-gray-100 flex justify-between">
                        <button
                          onClick={handlePrevPage}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400"
                          disabled={notificationSet === 1}
                        >
                          Previous
                        </button>
                        <Link
                          to="/user/notifications"
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          onClick={() => setShowNotificationDropdown(false)}
                        >
                          View all notifications
                        </Link>
                        <button
                          onClick={handleNextPage}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="relative group">
                <button className="flex items-center focus:outline-none">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-600">
                    <img src={user.profile || "https://myhealth-app-storage.s3.ap-south-1.amazonaws.com/users/profile-images/avatar.png"} alt="User profile" className="w-full h-full object-cover" />
                  </div>
                </button>
                <div className="absolute right-0 mt-0.5 w-48 bg-gray-200 rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
                  <Link to="/user/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">
                    Your Profile
                  </Link>
                  <Link to="/user/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">
                    Settings
                  </Link>
                  <div className="border-t border-gray-100"></div>
                  <p onClick={() => setShowConfirm(true)} className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer">
                    Sign out
                  </p>
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
    </div>
  );
};

export default Layout;