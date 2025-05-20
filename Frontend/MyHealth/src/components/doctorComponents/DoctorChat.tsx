import { useState, useEffect, useRef } from 'react';
import { FiSend, FiPaperclip, FiCheck, FiCheckCircle } from 'react-icons/fi';
import { BsThreeDotsVertical, BsEmojiSmile } from 'react-icons/bs';

type Participant = { userId: string; name: string; avatar: string };
type Conversation = {
  _id: string;
  participants: Participant[];
  lastMessage: {
    content: string;
    createdAt: Date;
    sender: string;
    readBy?: string[];
  };
};

type Message = {
  _id: string;
  conversationId: string;
  sender: string;
  content: string;
  createdAt: Date;
  readBy: string[];
};

const DoctorChat = () => {
  const [currentChat, setCurrentChat] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Mock data - replace with real API calls
  useEffect(() => {
    // Fetch conversations
    const mockConversations = [
      {
        _id: '1',
        participants: [
          { userId: 'p1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1' },
          { userId: 'd1', name: 'Dr. Smith', avatar: 'https://i.pravatar.cc/150?img=5' }
        ],
        lastMessage: {
          content: 'See you tomorrow at 10am',
          createdAt: new Date(),
          sender: 'd1'
        }
      },
      {
        _id: '2',
        participants: [
          { userId: 'p2', name: 'Sarah Johnson', avatar: 'https://i.pravatar.cc/150?img=2' },
          { userId: 'd1', name: 'Dr. Smith', avatar: 'https://i.pravatar.cc/150?img=5' }
        ],
        lastMessage: {
          content: 'The test results are normal',
          createdAt: new Date(Date.now() - 3600000),
          sender: 'd1'
        }
      }
    ];
    setConversations(mockConversations);
    setCurrentChat(mockConversations[0]);

    // Fetch messages for the first conversation
    const mockMessages = [
      {
        _id: 'm1',
        conversationId: '1',
        sender: 'p1',
        content: 'Hello Doctor, I have a headache',
        createdAt: new Date(Date.now() - 86400000),
        readBy: ['d1']
      },
      {
        _id: 'm2',
        conversationId: '1',
        sender: 'd1',
        content: 'How long have you had it?',
        createdAt: new Date(Date.now() - 43200000),
        readBy: ['p1']
      },
      {
        _id: 'm3',
        conversationId: '1',
        sender: 'p1',
        content: 'About 2 days now',
        createdAt: new Date(Date.now() - 21600000),
        readBy: ['d1']
      },
      {
        _id: 'm4',
        conversationId: '1',
        sender: 'd1',
        content: 'Please come in for a checkup tomorrow at 10am',
        createdAt: new Date(Date.now() - 10800000),
        readBy: ['p1']
      },
      {
        _id: 'm5',
        conversationId: '1',
        sender: 'p1',
        content: 'Okay, see you tomorrow at 10am',
        createdAt: new Date(),
        readBy: []
      }
    ];
    setMessages(mockMessages);
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    
    if (!currentChat) return;

    const message = {
      _id: `m${messages.length + 1}`,
      conversationId: currentChat._id,
      sender: 'd1', // In real app, this would be the current user's ID
      content: newMessage,
      createdAt: new Date(),
      readBy: []
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
    
    // Update last message in conversations
    const updatedConversations = conversations.map(conv => 
      conv._id === currentChat._id 
        ? { ...conv, lastMessage: message } 
        : conv
    );
    setConversations(updatedConversations);
  };

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-gray-300 bg-white flex flex-col">
        {/* Header */}
        <div className="p-3 bg-gray-50 border-b border-gray-300 flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="https://i.pravatar.cc/150?img=5" 
              alt="Profile" 
              className="w-10 h-10 rounded-full"
            />
            <span className="ml-2 font-semibold">Dr. Smith</span>
          </div>
          <div className="flex space-x-3 text-gray-500">
            <BsThreeDotsVertical className="text-xl cursor-pointer" />
          </div>
        </div>
        
        {/* Search */}
        <div className="p-2 bg-gray-50">
          <div className="bg-white rounded-lg flex items-center px-3 py-1">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input 
              type="text" 
              placeholder="Search or start new chat" 
              className="ml-2 py-1 w-full outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map(conversation => (
            <div 
              key={conversation._id}
              className={`flex items-center p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${currentChat?._id === conversation._id ? 'bg-gray-100' : ''}`}
              onClick={() => setCurrentChat(conversation)}
            >
              <img 
                src={conversation.participants.find(p => p.userId !== 'd1')?.avatar} 
                alt="User" 
                className="w-12 h-12 rounded-full"
              />
              <div className="ml-3 flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">
                    {conversation.participants.find(p => p.userId !== 'd1')?.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTime(conversation.lastMessage.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600 truncate w-40">
                    {conversation.lastMessage.sender === 'd1' ? 'You: ' : ''}
                    {conversation.lastMessage.content}
                  </p>
                  {conversation.lastMessage.readBy?.includes('d1') ? (
                    <FiCheckCircle className="text-blue-500" />
                  ) : (
                    <FiCheck className="text-gray-400" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Chat area */}
      <div className="flex-1 flex flex-col ">
        {currentChat ? (
          <>
            {/* Chat header */}
            <div className="p-3 bg-gray-50 border-b border-gray-300 flex justify-between items-center">
              <div className="flex items-center">
                <img 
                  src={currentChat.participants.find(p => p.userId !== 'd1')?.avatar || ''} 
                  alt="User" 
                  className="w-10 h-10 rounded-full"
                />
                <div className="ml-3">
                  <div className="font-semibold">
                    {currentChat.participants.find(p => p.userId !== 'd1')?.name}
                  </div>
                  <div className="text-xs text-gray-500">Online</div>
                </div>
              </div>
              
            </div>
            
            {/* Messages */}
            <div 
              className="flex-1 overflow-y-auto p-4 bg-blue-400" 
              // style={{ 
              //   backgroundImage: `url(${doodleBg})`,
              //   backgroundRepeat: 'repeat',
              //   backgroundSize: '400px',
              //   opacity: 0.05
              // }}
            >
              <div className="space-y-2"> 
                 {messages.map(message => (
                  <div 
                    key={message._id}
                    className={`flex ${message.sender === 'd1' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender === 'd1' ? 'bg-blue-500 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none'}`}
                    >
                      <div>{message.content}</div>
                      <div className={`text-xs mt-1 flex items-center ${message.sender === 'd1' ? 'text-blue-100 justify-end' : 'text-gray-500 justify-start'}`}>
                        {formatTime(message.createdAt)}
                        {message.sender === 'd1' && (
                          <span className="ml-1">
                            {message.readBy.includes(
                              currentChat.participants.find(p => p.userId !== 'd1')?.userId || ''
                            ) ? (
                              <FiCheckCircle className="inline-block text-white ml-1" />
                            ) : (
                              <FiCheck className="inline-block text-white ml-1" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message input */} 
            <div className="p-3 bg-gray-50 border-t border-gray-300 flex items-center">
              <button className="text-xl text-gray-500 mr-3">
                <FiPaperclip />
              </button>
              <button className="text-xl text-gray-500 mr-3">
                <BsEmojiSmile />
              </button>
              <input
                type="text"
                className="flex-1 px-4 py-2 border rounded-full focus:outline-none"
                placeholder="Type a message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                className="ml-3 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition duration-200"
              >
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