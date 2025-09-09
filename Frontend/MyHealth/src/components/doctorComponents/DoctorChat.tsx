import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { FiSend, FiCheck, FiCheckCircle, FiX } from "react-icons/fi";
import { IoDocumentAttachOutline } from "react-icons/io5";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { directFileUpload, getDoctorConversations, getDoctorMessages } from "../../api/doctor/doctorApi";
import { message } from "antd";
import axios from "axios";
import doodle from "../../assets/bg_print.png";
import { IDoctorData } from "../../interfaces/doctor";
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

interface User {
  _id: string;
  fullName: string;
  profile?: string;
}

interface Conversation {
  _id: string;
  members: { _id: string; name: string; avatar: string }[];
  lastMessage?: string;
}

const DoctorChat = () => {
  const doctor = useSelector((state: IDoctorData) => state.doctor.doctor);
  const doctorId = doctor?._id;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docMessage, setDocMessage] = useState<File | null>(null);

  const getAccessToken = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/doctor/refreshToken",
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
    const setupSocket = async () => {
      if (!doctorId) return;

      let token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("doctorAccessToken="))
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

      socket.emit("join", doctorId);

      return () => {
        socket.disconnect();
      };
    };

    setupSocket();
    return () => {
      socketRef.current?.disconnect();
    };
  }, [doctorId]);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!doctorId) return;
      setLoading(true);
      try {
        const res = await getDoctorConversations(doctorId, "User");
        console.log("Fetched conversations:", res);
        setConversations(res);
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
        message.error("Failed to load conversations. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    setUsers([{ _id: "6808e21a670e6cfc73176507", fullName: "Luthfi KS" }]);

    if (doctorId) {
      fetchConversations();
    }
  }, [doctorId]);

  useEffect(() => {
    if (!currentChat || !socketRef.current) return;

    socketRef.current.emit("join", currentChat._id);

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await getDoctorMessages(currentChat._id);
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
      socketRef.current?.emit("leave", currentChat._id);
    };
  }, [currentChat]);

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

    let messageData: {senderId: string,
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
          senderId: doctorId,
          conversationId: currentChat._id,
          type: "file",
          content: uploadResult.url,
          fileName: docMessage.name,
        };

        tempMessage = {
          _id: uuidv4(),
          conversationId: currentChat._id,
          senderId: doctorId,
          content: uploadResult.url,
          type: "file",
          fileName: docMessage.name,
          timestamp: new Date().toISOString(),
          readBy: [doctorId],
          status: "sent",
        };
      } else {
        messageData = {
          senderId: doctorId,
          conversationId: currentChat._id,
          type: "text",
          content: newMessage,
        };

        tempMessage = {
          _id: uuidv4(),
          conversationId: currentChat._id,
          senderId: doctorId,
          content: newMessage,
          type: "text",
          timestamp: new Date().toISOString(),
          readBy: [doctorId],
          status: "sent",
        };
      }

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
      console.log("doctorId and selected user:", doctorId, selectedUser);
      const response = await axios.post(
        "http://localhost:3000/api/doctor/conversation",
        { userIds: [doctorId, selectedUser] },
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
              {conversations.map((c) =>
                c.members.map((m) => {
                  const { name, avatar } = m;
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
                      </div>
                    </li>
                  );
                })
              )}
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
                src={currentChat.members[0].avatar || "https://myhealth-app-storage.s3.ap-south-1.amazonaws.com/users/profile-images/avatar.png"}
                alt={currentChat.members[0].name}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{currentChat.members[0].name}</p>
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
                  {messages.map((msg, index) => (
                    <div key={msg._id}>
                      {needsDateHeader(msg, messages[index - 1]) && (
                        <div className="text-center my-4">
                          <span className="inline-block bg-gray-200 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                            {formatDateHeader(msg.timestamp)}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${msg.senderId === doctorId ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`relative max-w-xs p-3 rounded-lg shadow-sm ${
                            msg.senderId === doctorId ? "bg-green-500 text-white" : "bg-white text-gray-900"
                          }`}
                        >
                          <div
                            className={`absolute top-2 ${
                              msg.senderId === doctorId ? "-right-2" : "-left-2"
                            } w-0 h-0 border-t-8 border-t-transparent ${
                              msg.senderId === doctorId ? "border-l-8 border-l-green-500" : "border-r-8 border-r-white"
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
                            <span className="text-xs text-gray-300">{formatMessageTime(msg.timestamp)}</span>
                            {msg.senderId === doctorId && (
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

            {/* Input Section */}
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
                  <span className="text-sm text-gray-700 ml-1">{docMessage.name}</span>
                  <button onClick={handleCancelFile} className="ml-2 text-red-500 hover:text-red-700">
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
                className={`text-xl ${loading ? "text-gray-400" : "text-green-600 hover:text-green-700"} transition-colors`}
                disabled={loading}
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

export default DoctorChat;

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