import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { FiSend, FiCheck, FiCheckCircle, FiPaperclip } from 'react-icons/fi';
import { BsEmojiSmile } from 'react-icons/bs';
import { io, Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { getDoctorConversations,getDoctorMessages,sendDoctorMessage } from '../../api/doctor/doctorApi';
import { message } from 'antd';

interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  readBy: string[];
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

const DoctorChat = () => {
  const doctor = useSelector((state: any) => state.doctor.doctor);
  const doctorId = doctor?._id;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentChat, setCurrentChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket
  useEffect(() => {
    if (!doctorId) return;
   const socketUrl = 'http://localhost:3000';
  //  import.meta.env.VITE_REACT_APP_SOCKET_URL || 
    const socket = io(socketUrl, {
      transports: ['websocket'],
      reconnection: true,
    });

    socket.emit('join', doctorId);
    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [doctorId]);

  useEffect(() => {
  const fetchConversations = async () => {
    try {
      const res = await getDoctorConversations(doctorId);
      console.log("conversation res ", res);
      setConversations(res);
    } catch (err) {
      console.error('Failed to fetch conversations', err);
      message.error('Failed to load conversations. Please try again.');
    }
  };

  if (doctorId) fetchConversations();
}, [doctorId]);


  useEffect(() => {
  const fetchMessages = async () => {
    if (!currentChat) return;
    try {
      const res = await getDoctorMessages(currentChat._id);
      setMessages(res);
      socketRef.current?.emit('markSeen', {
        conversationId: currentChat._id,
        userId: doctorId,
      });
    } catch (err) {
      console.error('Failed to fetch messages', err);
      message.error('Failed to fetch messages. Please try again.');
    }
  };

  fetchMessages();
}, [currentChat, doctorId]);



  // Setup socket listeners for incoming messages
  useEffect(() => {
    if (!currentChat || !socketRef.current) return;

    const socket = socketRef.current;

    const handleMessage = (msg: Message) => {
      if (msg.conversationId === currentChat._id) {
        setMessages((prev) => [...prev, msg]);
        socket.emit('markSeen', { conversationId: msg.conversationId, userId: doctorId });
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
            ? { ...msg, readBy: [...msg.readBy, userId] }
            : msg
        )
      );
    };

    
socket.on('messageSeen', handleSeen);

    socket.on('message', handleMessage);
    socket.on('messageSeen', handleSeen);

    return () => {
      socket.off('message', handleMessage);
      socket.off('messageSeen', handleSeen);
    };
  }, [currentChat, doctorId]);

  const handleSendMessage = async () => {
  if (!newMessage.trim() || !currentChat) return;

  const Message: Message = {
    _id: uuidv4(),
    conversationId: currentChat._id,
    senderId: doctorId,
    content: newMessage,
    timestamp: new Date().toISOString(),
    readBy: [doctorId],
  };

  setMessages((prev) => [...prev, Message]);
  setNewMessage('');

  try {
    await sendDoctorMessage(Message);
    socketRef.current?.emit('sendMessage', Message);
  } catch (error) {
    console.error('Message send failed:', error);
    message.error('Failed to sending messages. Please try again.');
  }
};

  const filteredConversations = conversations.filter((c) =>
    c.participants.find((p) => p.userId !== doctorId)?.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        <ul>
          {filteredConversations.map((c) => {
            const other = c.participants.find((p) => p.userId !== doctorId);
            return (
              <li
                key={c._id}
                className={`p-2 cursor-pointer rounded hover:bg-gray-200 ${
                  currentChat?._id === c._id ? 'bg-gray-200' : ''
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
                  className={`flex ${
                    msg.senderId === doctorId ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg max-w-xs ${
                      msg.senderId === doctorId
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-black'
                    }`}
                  >
                    {msg.content}
                    {msg.senderId === doctorId && (
                      <span className="ml-2 text-sm inline-flex items-center">
                        {msg.readBy.length > 1 ? (
                          <FiCheckCircle className="text-blue-300" />
                        ) : (
                          <FiCheck />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex items-center p-2 border-t">
              <BsEmojiSmile className="mx-2 text-xl cursor-pointer" />
              <FiPaperclip className="mx-2 text-xl cursor-pointer" />
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
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
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorChat;
