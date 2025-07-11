import { useEffect, useRef, useState } from "react";
import PeerService, { initializeSocket } from "../services/peerServices";
import { useParams } from "react-router-dom";
import { Button, Tooltip, Input, List, Avatar } from "antd";
import {
  AudioOutlined,
  AudioMutedOutlined,
  VideoCameraOutlined,
  VideoCameraFilled,
  PhoneOutlined,
  PictureOutlined,
  SettingOutlined,
  MessageOutlined,
  SendOutlined
} from '@ant-design/icons';
import { io } from "socket.io-client";

interface VideoCallProps {
  role: "doctor" | "user";
}

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isMe?: boolean;
  senderRole?: "doctor" | "user";
}

const VideoCall = ({ role }: VideoCallProps) => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<PeerService | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStarted, setCallStarted] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [otherParticipant, setOtherParticipant] = useState<{
    id: string;
    role: "doctor" | "user";
  } | null>(null);
  const [remoteVideoStatus, setRemoteVideoStatus] = useState("Connecting...");

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioMuted(!audioTracks[0].enabled);
      socketRef.current?.emit("mute", { 
        appointmentId, 
        type: "audio", 
        muted: !audioTracks[0].enabled 
      });
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!videoTracks[0].enabled);
      socketRef.current?.emit("mute", { 
        appointmentId, 
        type: "video", 
        muted: !videoTracks[0].enabled 
      });
    }
  };

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  const sendMessage = () => {
    if (message.trim() === "" || !socketRef.current) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: socketRef.current.id ?? "",
      content: message,
      timestamp: new Date(),
      isMe: true,
      senderRole: role
    };

    socketRef.current.emit("videoCall:sendMessage", {
      appointmentId,
      senderId: socketRef.current.id,
      content: message,
      senderRole: role
    });

    setMessages(prev => [...prev, newMessage]);
    setMessage("");
    setTimeout(scrollToBottom, 100);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const endCall = () => {
    if (socketRef.current) {
      socketRef.current.emit("endCall", appointmentId);
    }
    cleanup();
  };

  const cleanup = () => {
    if (socketRef.current) {
      socketRef.current.off("videoCall:newMessage");
    }
    
    peerRef.current?.close();
    setLocalStream(prev => {
      prev?.getTracks().forEach(track => track.stop());
      return null;
    });
    
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    peerRef.current = null;
    setMessages([]);
  };

  useEffect(() => {
    let isMounted = true;
    let durationInterval: NodeJS.Timeout;

    const setup = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 24 }
          }, 
          audio: true 
        });
        
        if (!isMounted) return;

        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const socket = await initializeSocket(role);
        socketRef.current = socket;

        socket.emit("joinVideoCall", appointmentId);
        
        // Setup socket event listeners
        const setupSocketEvents = () => {
          const createPeer = (remoteId: string): PeerService => {
            const peer = new PeerService(remoteId);
            peerRef.current = peer;

            peer.onRemoteStream((remoteStream) => {
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
                setRemoteVideoStatus("Connected");
              }
            });

            stream.getTracks().forEach(track => peer.peer.addTrack(track, stream));
            return peer;
          };

          socket.on("user:joined", async ({ id: remoteId, role: remoteRole }) => {
            setOtherParticipant({ id: remoteId, role: remoteRole });
            setRemoteVideoStatus(`${remoteRole === 'doctor' ? 'Dr.' : 'Patient'} connected`);
            const peer = createPeer(remoteId);
            const offer = await peer.createOffer();
            if (offer) {
              socket.emit("user:call", { to: remoteId, offer });
            }
          });

          socket.on("incomming:call", async ({ from, offer }) => {
            const peer = createPeer(from);
            const answer = await peer.createAnswer(offer);
            if (answer) {
              socket.emit("call:accepted", { to: from, ans: answer });
            }
          });

          socket.on("call:accepted", async ({ from, ans }) => {
            const peer = peerRef.current;
            if (peer && peer.remoteUserId === from) {
              await peer.setRemoteDescription(ans);
            }
          });

          socket.on("peer:nego:needed", async ({ from, offer }) => {
            const peer = peerRef.current;
            if (peer && peer.remoteUserId === from) {
              const answer = await peer.createAnswer(offer);
              if (answer) {
                socket.emit("peer:nego:done", { to: from, ans: answer });
              }
            }
          });

          socket.on("peer:nego:final", async ({ from, ans }) => {
            const peer = peerRef.current;
            if (peer && peer.remoteUserId === from) {
              await peer.setRemoteDescription(ans);
            }
          });

          socket.on("ice:candidate", async ({ from, candidate }) => {
            const peer = peerRef.current;
            if (peer && peer.remoteUserId === from && candidate) {
              await peer.addIceCandidate(candidate);
            }
          });

          socket.on("videoCall:newMessage", (newMessage: ChatMessage) => {
            if (newMessage.senderId !== socket.id) {
              setMessages(prev => [...prev, { ...newMessage, isMe: false }]);
              setTimeout(scrollToBottom, 100);
            }
          });

          socket.on("startCall", () => {
            setCallStarted(true);
            durationInterval = setInterval(() => {
              setCallDuration(prev => prev + 1);
            }, 1000);
          });

          socket.on("callEnded", cleanup);
          socket.on("userLeft", () => {
            setRemoteVideoStatus("Participant left");
            cleanup();
          });
          socket.on("mute", ({ userId, type, muted }) => {
            console.log(`${userId} has ${muted ? "muted" : "unmuted"} ${type}`);
          });
        };

        setupSocketEvents();

      } catch (err) {
        console.error("Media or socket init failed:", err);
      }
    };

    setup();

    return () => {
      isMounted = false;
      clearInterval(durationInterval);
      cleanup();
    };
  }, [role, appointmentId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white py-3 px-6 shadow-sm flex justify-between items-center border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Video Consultation</h2>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600 font-medium">{formatDuration(callDuration)}</span>
          <Tooltip title={showChat ? "Hide chat" : "Show chat"}>
            <Button 
              icon={<MessageOutlined />} 
              shape="circle" 
              onClick={toggleChat}
              className="flex items-center justify-center bg-gray-100 hover:bg-gray-200"
            />
          </Tooltip>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video Area */}
        <div className={`${showChat ? 'w-3/4' : 'w-full'} relative bg-gray-100`}>
          {/* Remote Video */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative w-full h-full max-w-4xl max-h-[80vh] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              <video 
                ref={remoteVideoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-white bg-opacity-80 text-gray-800 px-3 py-1 rounded-lg shadow-sm flex items-center">
                <span className="font-medium">
                  {otherParticipant 
                    ? `${otherParticipant.role === 'doctor' ? 'Dr.' : 'Patient'} ${otherParticipant.id.substring(0, 6)}`
                    : remoteVideoStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Local Video */}
          <div className="absolute right-6 bottom-6 w-64 h-48 rounded-xl overflow-hidden shadow-lg border-2 border-white bg-gray-800">
            <video 
              ref={localVideoRef} 
              autoPlay 
              muted 
              playsInline 
              className="w-full h-full object-cover"
            />
            {localVideoRef.current?.srcObject && (
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center">
                <span className="mr-2">You</span>
                {isAudioMuted && <AudioMutedOutlined className="mr-1" />}
                {isVideoOff && <VideoCameraFilled />}
              </div>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="w-1/4 border-l border-gray-200 bg-white flex flex-col">
            <div className="p-4 border-b border-gray-200 font-medium text-gray-700 flex items-center">
              <MessageOutlined className="mr-2" />
              Chat
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <List
                dataSource={messages}
                renderItem={(msg) => (
                  <List.Item 
                    className={`p-1 ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                    style={{ padding: '2px 0' }}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg p-2 ${msg.isMe ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                      style={{
                        borderRadius: msg.isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px'
                      }}
                    >
                      {!msg.isMe && (
                        <div className="text-xs text-gray-500 mb-1">
                          {msg.senderRole === 'doctor' ? 'Doctor' : 'Patient'}
                        </div>
                      )}
                      <div className="text-sm">{msg.content}</div>
                      <div 
                        className={`text-xs mt-1 text-right ${msg.isMe ? 'text-blue-200' : 'text-gray-400'}`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
              <div ref={chatEndRef} />
            </div>
            <div className="p-3 border-t border-gray-200">
              <Input.TextArea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type a message..."
                className="rounded-lg"
                autoSize={{ minRows: 1, maxRows: 3 }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={sendMessage}
                disabled={!message.trim()}
                block
                className="rounded-lg mt-2"
              >
                Send
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white py-3 px-6 shadow-md border-t border-gray-200">
        <div className="flex justify-center space-x-6">
          {/* Audio Control */}
          <Tooltip title={isAudioMuted ? "Unmute" : "Mute"}>
            <button
              onClick={toggleAudio}
              className={`p-3 rounded-full flex items-center justify-center ${isAudioMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {isAudioMuted ? <AudioMutedOutlined className="text-lg" /> : <AudioOutlined className="text-lg" />}
            </button>
          </Tooltip>

          {/* Video Control */}
          <Tooltip title={isVideoOff ? "Turn on video" : "Turn off video"}>
            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full flex items-center justify-center ${isVideoOff ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {isVideoOff ? <VideoCameraFilled className="text-lg" /> : <VideoCameraOutlined className="text-lg" />}
            </button>
          </Tooltip>

          {/* End Call */}
          <Tooltip title="End call">
            <button
              onClick={endCall}
              className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 flex items-center justify-center"
            >
              <PhoneOutlined className="text-lg" />
            </button>
          </Tooltip>

          {/* More Options */}
          {/* <Tooltip title="More options">
            <button className="p-3 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center">
              <SettingOutlined className="text-lg" />
            </button>
          </Tooltip> */}

          {/* Screen Share */}
          {/* <Tooltip title="Share screen">
            <button className="p-3 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center">
              <PictureOutlined className="text-lg" />
            </button>
          </Tooltip> */}
        </div>
      </div>
    </div>
  );
};

export default VideoCall;