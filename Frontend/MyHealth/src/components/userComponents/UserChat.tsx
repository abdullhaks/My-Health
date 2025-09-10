import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { FiSend, FiCheck, FiCheckCircle, FiX } from "react-icons/fi";
import { IoDocumentAttachOutline } from "react-icons/io5";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { getUserConversations, getUserMessages, directFileUpload, checkActiveBooking, getLatestDoctorPrescription } from "../../api/user/userApi";
import { message } from "antd";
import axios from "axios";
import doodle from "../../assets/bg_print.png";
import { useLocation, useNavigate } from "react-router-dom";
import { IUserData } from "../../interfaces/user";
import { ApiError } from "../../interfaces/error";

interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: "text" | "file";
  fileName?: string;
  timestamp: string;
  readBy: string[];
  status: "sent" | "delivered" | "read";
}

interface Conversation {
  _id: string;
  members: { _id: string;userId:string; name: string; avatar: string }[];
}

interface User {
  _id: string;
  fullName: string;
}

const UserChat = () => {
  const user = useSelector((state: IUserData) => state.user.user);
  const userId = user?._id;
  const [doctorId,setDoctorId] =  useState ('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentChat, setCurrentChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [docMessage, setDocMessage] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const hasInitializedConversation = useRef(false);
  const [activeAppointment,setActiveAppointment] = useState<boolean>(false);

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

  const settingCurrentChat = (c: Conversation) => {
  setCurrentChat(c);
  // Find the member who is NOT the logged-in user (assumed to be the doctor)
  const doctor = c.members.find((m: { _id: string;userId:string; name: string; avatar: string }) => m._id !== userId);
  if (doctor) {
    setDoctorId(doctor._id || doctor.userId); // Use _id or userId based on API structure
  } else {
    console.error("Doctor not found in conversation members");
    setDoctorId("");
    setActiveAppointment(false); // Disable messaging if no valid doctor
  }
};


  useEffect(() => {
    const doctorId = location.state?.doctorId;
    if (doctorId && userId && !hasInitializedConversation.current) {
      setDoctorId(doctorId)
      const initializeConversation = async () => {
        try {
          setLoading(true);
          const res = await getUserConversations(userId, "Doctor");
          setConversations(res);

          const existingConversation = res.find((c: Conversation) =>
            c.members.some((m) => m._id === doctorId)
          );

          if (existingConversation) {
            setCurrentChat(existingConversation);

          } else {
            const response = await axios.post(
              "http://localhost:3000/api/user/conversation",
              { userIds: [userId, doctorId] },
              { withCredentials: true }
            );
            const newConversation = response.data;
            setConversations((prev) => [...prev, newConversation]);
            setCurrentChat(newConversation);
          }
          hasInitializedConversation.current = true;
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
  }, [location.state?.doctorId, navigate, userId]);

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

      const socket = io(import.meta.env.VITE_REACT_APP_SOCKET_URL||"http://localhost:3000", {
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
        const res = await getUserConversations(userId, "Doctor");
        setConversations(res);
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
        message.error("Failed to load conversations. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    setUsers([{ _id: "682d8d5e69828e1965f9b086", fullName: "FATHIMA KS" }]);

    if (userId) {
      fetchConversations();
    }
  }, [userId]);

useEffect(() => {
  if (!currentChat || !socketRef.current || !doctorId) return;

  socketRef.current.emit("join", currentChat._id);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await getUserMessages(currentChat._id);
      const active = await checkActiveBooking(userId, doctorId);
      const latestPres = await getLatestDoctorPrescription(userId, doctorId);
      
      let medicationPeriod = null;
      if (latestPres && typeof latestPres.medicationPeriod === 'number' && latestPres.medicationPeriod > 0) {
        const dy = new Date(latestPres.createdAt);
        dy.setDate(dy.getDate() + latestPres.medicationPeriod);
        medicationPeriod = dy;
      }

      setMessages(res);
      // Explicitly set activeAppointment based on conditions
      setActiveAppointment(
        (medicationPeriod && medicationPeriod > new Date()) || active?.status || false
      );
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      message.error("Failed to fetch messages. Please try again.");
      setActiveAppointment(false); // Set to false on error to prevent accidental enabling
    } finally {
      setLoading(false);
    }
  };

  fetchMessages();

  return () => {
    socketRef.current?.emit("leave", currentChat._id);
  };
}, [currentChat, userId, doctorId]);

  useEffect(() => {
    if (!currentChat || !socketRef.current) return;

    const socket = socketRef.current;

    const handleMessage = (msg: Message) => {
      if (msg.conversationId === currentChat._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        socket.emit("markSeen", { conversationId: msg.conversationId });
      }
    };

    const handleSeen = ({
      conversationId,
      userId,
    }: {
      conversationId: string;
      userId: string;
    }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.conversationId === conversationId && !msg.readBy.includes(userId)
            ? { ...msg, readBy: [...msg.readBy, userId], status: "read" }
            : msg
        )
      );
    };

    const handleTyping = ({
      userId,
      role,
      conversationId,
    }: {
      userId: string;
      role: string;
      conversationId: string;
    }) => {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        message.error("File size must be less than 10MB");
        return;
      }
      setDocMessage(file);
      setNewMessage("");
    }
  };

  const handleCancelFile = () => {
    setDocMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async () => {
    if (!currentChat || (!newMessage.trim() && !docMessage)) return;

    let messageData: {
          senderId: string,
          conversationId: string,
          type:string,
          content: string,
          fileName?: string,};
    let tempMessage: Message;

    try {
      if (docMessage) {
        const formData = new FormData();
        formData.append("doc", docMessage);
        formData.append("location", "chatDoc");
        const uploadResult = await directFileUpload(formData);
        if (!uploadResult?.url) {
          throw new Error("Failed to upload file");
        }

        messageData = {
          senderId: userId,
          conversationId: currentChat._id,
          type: "file",
          content: uploadResult.url,
          fileName: docMessage.name,
        };

        tempMessage = {
          _id: uuidv4(),
          conversationId: currentChat._id,
          senderId: userId,
          content: uploadResult.url,
          type: "file",
          fileName: docMessage.name,
          timestamp: new Date().toISOString(),
          readBy: [userId],
          status: "sent",
        };
      } else {
        messageData = {
          senderId: userId,
          conversationId: currentChat._id,
          type: "text",
          content: newMessage,
        };

        tempMessage = {
          _id: uuidv4(),
          conversationId: currentChat._id,
          senderId: userId,
          content: newMessage,
          type: "text",
          timestamp: new Date().toISOString(),
          readBy: [userId],
          status: "sent",
        };
      }

      // setMessages((prev) => [...prev, tempMessage]);
      setNewMessage("");
      setDocMessage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      socketRef.current?.emit("sendMessage", { ...messageData, _id: tempMessage._id });
    } catch (error) {
      console.error("Message send failed:", error);
      message.error((error as ApiError).response?.data?.message || "Failed to send message");
      setMessages((prev) => prev.filter((msg) => msg._id !== tempMessage._id));
    }
  };

  const handleCreateConversation = async () => {
    if (!selectedUser) {
      message.error("Please select a user to start a conversation");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/user/conversation",
        { userIds: [userId, selectedUser] },
        { withCredentials: true }
      );
      const newConversation = response.data;
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDateHeader = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return "Today";
    } else if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  const needsDateHeader = (currentMsg: Message, prevMsg?: Message) => {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.timestamp).setHours(0, 0, 0, 0);
    const prevDate = new Date(prevMsg.timestamp).setHours(0, 0, 0, 0);
    return currentDate !== prevDate;
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-gray-100">
      <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 flex flex-col">
      
        {/* <div className="p-4 border-b border-gray-200">
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
        </div> */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-gray-500 text-sm">Loading conversations...</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {conversations.map((c) => {
                return c.members.map((m) => {
                  const { name, avatar } = m;
                  return (
                    <li
                      key={c._id}
                      className={`p-4 flex items-center space-x-3 cursor-pointer hover:bg-gray-100 transition-colors ${
                        currentChat?._id === c._id ? "bg-green-50" : ""
                      }`}
                      onClick={() => settingCurrentChat(c)}
                    >
                      <img
                        src={avatar}
                        alt={name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {name}
                        </p>
                      </div>
                    </li>
                  );
                });
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-gray-50">
        {currentChat ? (
          <>
            <div className="bg-white border-b border-gray-200 p-4 flex items-center space-x-3 sticky top-0 z-5 shadow-sm">
              <img
                src={currentChat.members[0].avatar || "Unknown User"}
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
                <div className="text-center text-gray-500 text-sm">
                  Loading messages...
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((msg, index) => (
                    <div key={msg._id}>
                      {needsDateHeader(msg, messages[index - 1]) && (
                        <div className="text-center my-4">
                          <span className="inline-block bg-gray-200 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                            {formatDateHeader(msg.timestamp)}
                          </span>
                        </div>
                      )}
                      <div
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
                          <div
                            className={`absolute top-2 ${
                              msg.senderId === userId ? "-right-2" : "-left-2"
                            } w-0 h-0 border-t-8 border-t-transparent ${
                              msg.senderId === userId
                                ? "border-l-8 border-l-green-500"
                                : "border-r-8 border-r-white"
                            } border-b-8 border-b-transparent`}
                          />
                          {msg.type === "file" ? (
                            <div className="flex items-center space-x-2">
                              <IoDocumentAttachOutline className="text-lg" />
                              <a
                                href={msg.content}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm underline"
                              >
                                {msg.fileName || "Document"}
                              </a>
                            </div>
                          ) : (
                            <p className="text-sm">{msg.content}</p>
                          )}
                          <div className="flex items-center justify-end mt-1 space-x-1">
                            <span className="text-xs text-gray-300">
                              {formatMessageTime(msg.timestamp)}
                            </span>
                            {msg.senderId === userId && (
                              <span className="flex items-center">
                                {msg.status === "read" ? (
                                  <FiCheckCircle className="text-blue-500" size={14} />
                                ) : msg.status === "delivered" ? (
                                  <FiCheck className="text-gray-300" size={14} />
                                ) : (
                                  <FiCheck className="text-gray-300" size={14} />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>


              {activeAppointment?
            <div className="bg-white border-t border-gray-200 p-4 flex items-center space-x-3 sticky bottom-0 z-5">
              <input
                id="docMessageInput"
                type="file"
                name="docMessage"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <label htmlFor="docMessageInput" className="cursor-pointer">
                <IoDocumentAttachOutline className="text-xl text-gray-500 hover:text-gray-700" />
              </label>

              {docMessage && (
                <div className="flex items-center bg-gray-100 rounded-lg px-2 py-1">
                  <IoDocumentAttachOutline className="text-gray-500" />
                  <span className="text-sm text-gray-700 ml-1">
                    {docMessage.name}
                  </span>
                  <button
                    onClick={handleCancelFile}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              )}

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
                disabled={!!docMessage}
              />

              <button
                onClick={handleSendMessage}
                className={`text-xl ${
                  loading ? "text-gray-400" : "text-green-600 hover:text-green-700"
                } transition-colors`}
                disabled={loading}
              >
                <FiSend />
              </button>
            </div>

            :
             <div className="bg-white border-t border-gray-200 p-4 flex items-center space-x-3 sticky bottom-0 z-5">
              <p className="text-sm text-gray-500">You can send messages only for active appointments or if you are in medication period.</p>
             </div>
    }
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50">
            select a conversation or start a new one by searchin a doctor 
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