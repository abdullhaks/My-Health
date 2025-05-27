
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { FiSend, FiCheck, FiCheckCircle } from "react-icons/fi";
import { BsEmojiSmile } from "react-icons/bs";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { getUserConversations, getUserMessages } from "../../api/user/userApi";
import { message } from "antd";
import axios from "axios";
import doodle from "../../assets/bg_print.png";
import { useLocation, useNavigate } from "react-router-dom";

interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  readBy: string[];
  status: "sent" | "delivered" | "read";
}

interface User {
  _id: string;
  fullName: string;
  profile?: string;
}

interface Conversation {
  _id: string;
  members: [any]; 
  lastMessage?: string;
}

const UserChat = () => {
  const user = useSelector((state: any) => state.user.user);
  const userId = user?._id;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentChat, setCurrentChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const hasInitializedConversation = useRef(false);

  const getAccessToken = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/user/refreshToken",
        {},
        { withCredentials: true }
      );
      console.log("Token response:", response.data);
      return response.data.accessToken;
    } catch (error) {
      console.error("Failed to fetch access token:", error);
      message.error("Session expired. Please log in again.");
      throw error;
    }
  };


  useEffect(() => {
    const doctorId = location.state?.doctorId;
    if (doctorId && userId && !hasInitializedConversation.current) {
      const initializeConversation = async () => {
        try {
          setLoading(true);
          // Fetch conversations to ensure we have the latest list
          const res = await getUserConversations(userId, "Doctor");
          setConversations(res);

          // Check if a conversation with this doctor already exists
          const existingConversation = res.find((c: Conversation) =>
            c.members.some((m) => m._id === doctorId)
          );

          if (existingConversation) {
            setCurrentChat(existingConversation);
          } else {
            // Create a new conversation
            const response = await axios.post(
              "http://localhost:3000/api/user/conversation",
              { userIds: [userId, doctorId] },
              { withCredentials: true }
            );
            const newConversation = response.data;
            setConversations((prev) => [...prev, newConversation]);
            setCurrentChat(newConversation);
          }
          hasInitializedConversation.current = true; // Mark as initialized
          // Clear navigation state to prevent re-triggering
          navigate("/chat", { replace: true, state: {} });
        } catch (error) {
          console.error("Failed to initialize conversation:", error);
          message.error("Failed to start chat with doctor.");
        } finally {
          setLoading(false);
        }
      };

      initializeConversation();
    }
  }, [location.state?.doctorId, userId, navigate]);



  useEffect(() => {
    const setupSocket = async () => {
      if (!userId) return;

      let token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("userAccessToken="))
        ?.split("=")[1];

      if (!token) {
        token = await getAccessToken();
      }

      console.log("Token in frontend:", token);

      const socket = io("http://localhost:3000", {
        transports: ["websocket"],
        reconnection: true,
        auth: { token },
      });

      socketRef.current = socket;

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
          message.error("Failed to connect to chat server: " + err.message);
        }
      });

      socket.on("error", ({ message }) => {
        console.error("Socket error:", message);
        message.error(message);
      });

      socket.emit("join", userId);

      return () => {
        socket.disconnect();
      };
    };

    setupSocket();
    return () => {
      socketRef.current?.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const res = await getUserConversations(userId,"Doctor");
        console.log("Fetched conversations:", res);
        setConversations(res);
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
        message.error("Failed to load conversations. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    // Temporarily hardcoded users until /api/user/all is implemented
    setUsers([
      { _id: "682d8d5e69828e1965f9b086", fullName: "FATHIMA KS" },
    ]);

    if (userId) {
      fetchConversations();
    }
  }, [userId]);

  useEffect(() => {
  if (!currentChat || !socketRef.current) return;

  socketRef.current.emit("join", currentChat._id); // Join conversation room

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await getUserMessages(currentChat._id);
      setMessages(res);
      socketRef.current?.emit("markSeen", { conversationId: currentChat._id });
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      message.error("Failed to fetch messages. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  fetchMessages();

  return () => {
    socketRef.current?.emit("leave", currentChat._id); // Leave conversation room on cleanup
  };
}, [currentChat]);



  useEffect(() => {
    if (!currentChat || !socketRef.current) return;

    const socket = socketRef.current;

    const handleMessage = (msg: Message) => {
    if (msg.conversationId === currentChat._id) {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      socket.emit("markSeen", { conversationId: msg.conversationId });
    }
  };

    const handleSeen = ({ conversationId, userId }: { conversationId: string; userId: string }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.conversationId === conversationId && !msg.readBy.includes(userId)
            ? { ...msg, readBy: [...msg.readBy, userId], status: "read" }
            : msg
        )
      );
    };

    const handleTyping = ({ userId, role, conversationId }: { userId: string; role: string; conversationId: string }) => {
      if (currentChat._id === conversationId) {
        const user = users.find((u) => u._id === userId);
        setTypingUser(`${user?.fullName || role} is typing...`);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
      }
    };

    const handleStopTyping = ({ conversationId }: { conversationId: string }) => {
      if (currentChat._id === conversationId) {
        setTypingUser(null);
      }
    };

    socket.on("message", handleMessage);
    socket.on("messageSeen", handleSeen);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("message", handleMessage);
      socket.off("messageSeen", handleSeen);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [currentChat, users]);

 const handleSendMessage = async () => {
  if (!newMessage.trim() || !currentChat) return;

  const messageData = {
    senderId: userId,
    conversationId: currentChat._id,
    content: newMessage,
  };

  const tempMessage: Message = {
    _id: uuidv4(),
    conversationId: currentChat._id,
    senderId: userId,
    content: newMessage,
    timestamp: new Date().toISOString(),
    readBy: [userId],
    status: "sent",
  };

  // setMessages((prev) => [...prev, tempMessage]);
  setNewMessage("");

  try {
    // const response = await sendDoctorMessage(messageData);
    // Update the temp message with server response
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === tempMessage._id ? { ...tempMessage, readBy: [userId], status: "sent" } : msg
      )
    );
    socketRef.current?.emit("sendMessage", { ...messageData, _id: tempMessage._id });
  } catch (error: any) {
    console.error("Message send failed:", error);
    message.error(error.response?.data?.message || "Failed to send message.");
    setMessages((prev) => prev.filter((msg) => msg._id !== tempMessage._id));
  }
};

  const handleCreateConversation = async () => {
    if (!selectedUser) {
      message.error("Please select a user to start a conversation");
      return;
    }

    try {
      console.log("userId and selected user:", userId, selectedUser);
      const response = await axios.post(
        "http://localhost:3000/api/user/conversation",
        { userIds: [userId, selectedUser] },
        { withCredentials: true }
      );
      const newConversation = response.data;
      console.log("New conversation:", newConversation);
      setConversations((prev) => [...prev, newConversation]);
      setCurrentChat(newConversation);
      setSelectedUser("");
    } catch (error) {
      console.error("Failed to create conversation:", error);
      message.error("Failed to create conversation. Please try again.");
    }
  };

  const handleTyping = () => {
    if (!currentChat || !socketRef.current) return;
    socketRef.current.emit("typing", { conversationId: currentChat._id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("stopTyping", { conversationId: currentChat._id });
    }, 3000);
  };

  // const getUserDetails = (userId: string) => {
  //   const user = users.find((u) => u._id === userId);
  //   return {
  //     name: user?.fullName || "Unknown User",
  //     avatar: user?.profile || "https://myhealth-app-storage.s3.ap-south-1.amazonaws.com/users/profile-images/avatar.png",
  //   };
  // };

  // const filteredConversations = conversations.filter((c) => {
  //   console.log("Conversation:", c); // Debug log
  //   if (!c.members || !Array.isArray(c.members)) {
  //     console.warn("Invalid conversation, missing or invalid members:", c);
  //     return false;
  //   }
  //   const otherUserId = c.members.find((id) => id !== userId);
  //   if (!otherUserId) {
  //     console.warn("No other user found in conversation:", c);
  //     return false;
  //   }
  //   const { name } = getUserDetails(otherUserId);
  //   return name.toLowerCase().includes(searchTerm.toLowerCase());
  // });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-gray-100">
      {/* Conversation Sidebar */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 flex flex-col">
        {/* Search and New Chat Section */}
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2.5 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          />
          <div className="mt-4">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select a user to start a conversation</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.fullName}
                </option>
              ))}
            </select>
            <button
              onClick={handleCreateConversation}
              className="mt-2 w-full py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Starting..." : "Start Conversation"}
            </button>
          </div>
        </div>
        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-gray-500 text-sm">Loading conversations...</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {conversations.map((c) => {
                
                return c.members.map((m)=>{
                const { name, avatar } =m
                return (
                  <li
                    key={c._id}
                    className={`p-4 flex items-center space-x-3 cursor-pointer hover:bg-gray-100 transition-colors ${
                      currentChat?._id === c._id ? "bg-green-50" : ""
                    }`}
                    onClick={() => setCurrentChat(c)}
                  >
                    <img
                      src={avatar}
                      alt={name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                      {/* <p className="text-xs text-gray-500 truncate">{c.lastMessage || "No messages yet"}</p> */}
                    </div>
                  </li>
                );

                })
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center space-x-3 sticky top-0 z-5 shadow-sm">
              <img
                src={currentChat.members[0].avatar|| "Unknown User"}
                alt={currentChat.members[0].name}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {currentChat.members[0].name}
                </p>
                {typingUser && <p className="text-xs text-green-600">{typingUser}</p>}
              </div>
            </div>

            {/* Message Container */}
            <div
              className="flex-1 overflow-y-auto p-4"
              style={{
                backgroundImage: `url(${doodle})`,
                backgroundSize: "400px",
                backgroundRepeat: "repeat",
                backgroundColor: "rgba(245, 245, 245, 0.9)",
              }}
            >
              {loading ? (
                <div className="text-center text-gray-500 text-sm">Loading messages...</div>
              ) : (
                <div className="space-y-2">
                  {messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex ${
                        msg.senderId === userId ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`relative max-w-xs p-3 rounded-lg shadow-sm ${
                          msg.senderId === userId
                            ? "bg-green-500 text-white"
                            : "bg-white text-gray-900"
                        }`}
                      >
                        {/* Message Tail */}
                        <div
                          className={`absolute top-2 ${
                            msg.senderId === userId ? "-right-2" : "-left-2"
                          } w-0 h-0 border-t-8 border-t-transparent ${
                            msg.senderId === userId
                              ? "border-l-8 border-l-green-500"
                              : "border-r-8 border-r-white"
                          } border-b-8 border-b-transparent`}
                        />
                        <p className="text-sm">{msg.content}</p>
                        {msg.senderId === userId && (
                          <span className="absolute bottom-1 right-2 text-xs flex items-center space-x-1">
                            {msg.status === "read" ? (
                              <FiCheckCircle className="text-blue-300" size={14} />
                            ) : msg.status === "delivered" ? (
                              <FiCheck className="text-gray-300" size={14} />
                            ) : (
                              <FiCheck className="text-gray-300" size={14} />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Section */}
            <div className="bg-white border-t border-gray-200 p-4 flex items-center space-x-3 sticky bottom-0 z-5">
              <BsEmojiSmile className="text-xl text-gray-500 cursor-pointer hover:text-gray-700" />
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 p-2.5 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              />
              <button
                onClick={handleSendMessage}
                className="text-xl text-green-600 hover:text-green-700 transition-colors"
              >
                <FiSend />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50">
            Select or start a conversation to begin chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default UserChat;



{/* <div className="bg-white border-t border-gray-200 p-4 flex items-center space-x-3 sticky bottom-0 z-5">
  <BsEmojiSmile className="text-xl text-gray-500 cursor-pointer hover:text-gray-700" />
  <textarea
    value={newMessage}
    onChange={(e) => {
      setNewMessage(e.target.value);
      handleTyping();
    }}
    onKeyDown={(e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault(); // Prevent default Enter behavior (form submission or newline)
        handleSendMessage();
      }
      // Shift+Enter will automatically add a newline in textarea, no additional logic needed
    }}
    placeholder="Type a message..."
    className="flex-1 p-2.5 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none min-h-[40px] max-h-[100px] overflow-y-auto"
  />
  <button
    onClick={handleSendMessage}
    className="text-xl text-green-600 hover:text-green-700 transition-colors"
  >
    <FiSend />
  </button>
</div>; */}