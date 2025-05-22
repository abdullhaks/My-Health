import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { FiSend, FiCheck, FiCheckCircle, FiPaperclip } from "react-icons/fi";
import { BsEmojiSmile } from "react-icons/bs";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { getDoctorConversations, getDoctorMessages, sendDoctorMessage } from "../../api/doctor/doctorApi";
import { message } from "antd";
import axios from "axios";

interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  readBy: string[];
  status: "sent" | "delivered" | "read";
  fileUrl?: string;
}

interface Participant {
  userId: string;
  name: string;
  avatar: string;
}

interface Conversation {
  _id: string;
  participants: Participant[];
}

interface User {
  _id: string;
  fullName: string;
}

const DoctorChat = () => {
  const doctor = useSelector((state: any) => state.doctor.doctor);
  const doctorId = doctor?._id;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentChat, setCurrentChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [users, setUsers] = useState<User[]>([{_id: "6808e21a670e6cfc73176507", fullName: "luthfi ks" }]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  async function getRefreshtoken (){
    try {
      const response = await axios.post(
        "http://localhost:3000/api/doctor/refreshToken",
        {},
        { withCredentials: true }
      );

      console.log("token response socket...",response)
      return response.data.accessToken; // Assuming the response contains { accessToken }
    } catch (error) {
      console.error("Failed to refresh token:", error);
      message.error("Session expired. Please log in again.");
      throw error;
    }
  }

  // Initialize socket with authentication
  useEffect(() => {
    const setupSocket = async () => {
      if (!doctorId) return;

      const token = await getRefreshtoken();

      console.log("tocken in fortend...........", token);

      const socket = io("http://localhost:3000", {
        transports: ["websocket"],
        reconnection: true,
        auth: { token },
      });

      socketRef.current = socket;

      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
        message.error("Failed to connect to chat server");
      });

      socket.on("error", ({ message }) => {
        console.error("Socket error:", message);
        message.error(message);
      });

      socket.emit("join", doctorId);
    };

    setupSocket();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [doctorId]);




 useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await getDoctorConversations(doctorId);

        console.log("fetched conversations are.....",res);
        setConversations(res);
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
        message.error("Failed to load conversations. Please try again.");
      }
    };

    // const fetchUsers = async () => {
    //   try {
    //     const res = await axios.get("http://localhost:3000/api/user/all", { withCredentials: true });
    //     setUsers(res.data);
    //   } catch (err) {
    //     console.error("Failed to fetch users:", err);
    //     message.error("Failed to load users. Please try again.");
    //   }
    // };

    if (doctorId) {
      fetchConversations();
      // fetchUsers();
    }
  }, [doctorId]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentChat) return;
      try {
        const res = await getDoctorMessages(currentChat._id);
        setMessages(res);
        socketRef.current?.emit("markSeen", { conversationId: currentChat._id });
      } catch (err) {
        console.error("Failed to fetch messages:", err);
        message.error("Failed to fetch messages. Please try again.");
      }
    };

    if (currentChat) fetchMessages();
  }, [currentChat]);

  useEffect(() => {
    if (!currentChat || !socketRef.current) return;

    const socket = socketRef.current;

    const handleMessage = (msg: Message) => {
      if (msg.conversationId === currentChat._id) {
        setMessages((prev) => [...prev, msg]);
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
        setTypingUser(`${role} is typing...`);
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
  }, [currentChat]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !file) return;
    if (!currentChat) return;

    const formData = new FormData();
    formData.append("conversationId", currentChat._id);
    formData.append("senderId", doctorId);
    formData.append("content", newMessage);
    if (file) formData.append("file", file);

    const tempMessage: Message = {
      _id: uuidv4(),
      conversationId: currentChat._id,
      senderId: doctorId,
      content: newMessage,
      timestamp: new Date().toISOString(),
      readBy: [doctorId],
      status: "sent",
      fileUrl: file ? URL.createObjectURL(file) : undefined,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");
    setFile(null);

    try {
      const sentMessage = await sendDoctorMessage(formData);
      socketRef.current?.emit("sendMessage", sentMessage);
    } catch (error) {
      console.error("Message send failed:", error);
      message.error("Failed to send message. Please try again.");
      setMessages((prev) => prev.filter((msg) => msg._id !== tempMessage._id));
    }
  };

  const handleCreateConversation = async () => {
    if (!selectedUser) {
      message.error("Please select a user to start a conversation");
      return;
    }

    try {

      console.log("doctorid and selected user is ",doctorId, selectedUser);
      const response = await axios.post(
        "http://localhost:3000/api/doctor/conversation",
        { userIds: [doctorId, selectedUser] },
        { withCredentials: true }
      );
      const newConversation = response.data;

      console.log("new conversation is ",response.data);
      
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        message.error("File size must be less than 5MB");
        return;
      }
      if (!selectedFile.type.match(/image\/(jpeg|jpg|png)|application\/pdf/)) {
        message.error("Only images (JPEG, JPG, PNG) or PDFs are allowed");
        return;
      }
      setFile(selectedFile);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.participants.find((p) => p.userId !== doctorId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-1/4 border-r border-gray-300 p-4">
        <input
          type="text"
          placeholder="Search patients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />
        <div className="mb-4">
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full p-2 border rounded"
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
            className="mt-2 w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Start Conversation
          </button>
        </div>
        <ul>
          {filteredConversations.map((c) => {
            const other = c.participants.find((p) => p.userId !== doctorId);
            return (
              <li
                key={c._id}
                className={`p-2 cursor-pointer rounded hover:bg-gray-200 ${
                  currentChat?._id === c._id ? "bg-gray-200" : ""
                }`}
                onClick={() => setCurrentChat(c)}
              >
                <div className="flex items-center space-x-2">
                  <img
                    src={other?.avatar}
                    alt={other?.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span>{other?.name}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col p-4">
        {currentChat ? (
          <>
            <div className="flex-1 overflow-y-auto space-y-2 pr-4">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${msg.senderId === doctorId ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`p-2 rounded-lg max-w-xs ${
                      msg.senderId === doctorId ? "bg-green-500 text-white" : "bg-gray-200 text-black"
                    }`}
                  >
                    {msg.content}
                    {msg.fileUrl && (
                      <div className="mt-2">
                        {msg.fileUrl.match(/\.(jpeg|jpg|png)$/i) ? (
                          <img src={msg.fileUrl} alt="Attachment" className="max-w-full rounded" />
                        ) : (
                          <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                            Download File
                          </a>
                        )}
                      </div>
                    )}
                    {msg.senderId === doctorId && (
                      <span className="ml-2 text-sm inline-flex items-center">
                        {msg.status === "read" ? (
                          <FiCheckCircle className="text-blue-300" />
                        ) : msg.status === "delivered" ? (
                          <FiCheck className="text-gray-300" />
                        ) : (
                          <FiCheck />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {typingUser && <div className="text-gray-500">{typingUser}</div>}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex items-center p-2 border-t">
              <BsEmojiSmile className="mx-2 text-xl cursor-pointer" />
              <label className="mx-2 text-xl cursor-pointer">
                <FiPaperclip />
                <input type="file" hidden onChange={handleFileChange} accept="image/*,application/pdf" />
              </label>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded"
              />
              <button onClick={handleSendMessage} className="ml-2 text-xl text-green-500">
                <FiSend />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select or start a conversation to begin chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorChat;