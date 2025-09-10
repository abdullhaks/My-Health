// import { useEffect, useRef, useState, useCallback } from 'react';
// import io, { Socket } from 'socket.io-client';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash } from 'react-icons/fa';
// import { message } from 'antd';
// import axios from 'axios';

// type PendingSignal = { type: 'offer' | 'answer' | 'iceCandidate'; data };

// const UserVideoCall = () => {
//   const { appointmentId } = useParams<{ appointmentId: string }>();
//   const navigate = useNavigate();
//   const user = useSelector((state) => state.user.user);

//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [localStream, setLocalStream] = useState<MediaStream | null>(null);
//   const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
//   const [isAudioMuted, setIsAudioMuted] = useState(false);
//   const [isVideoMuted, setIsVideoMuted] = useState(false);
//   const [otherUserJoined, setOtherUserJoined] = useState(false);
//   const [callStatus, setCallStatus] = useState<'connecting' | 'waiting' | 'connected' | 'error' | 'ended'>('connecting');
//   const [error, setError] = useState('');

//   const peerConnection = useRef<RTCPeerConnection | null>(null);
//   const pendingSignals = useRef<PendingSignal[]>([]);
//   const isPeerConnectionInitializing = useRef(false);
//   const isMediaRequested = useRef(false);

//   const getAccessToken = useCallback(async (): Promise<string> => {
//     try {
//       const response = await axios.post(
//         'http://localhost:3000/api/user/refreshToken',
//         {},
//         { withCredentials: true }
//       );
//       return response.data.accessToken;
//     } catch (error) {
//       console.error('Failed to fetch access token:', error);
//       message.error('Session expired. Redirecting to login...');
//       setTimeout(() => navigate('/login'), 2000);
//       throw error;
//     }
//   }, [navigate]);

//   const processPendingSignals = useCallback(() => {
//     if (!peerConnection.current || peerConnection.current.signalingState === 'closed') {
//       return;
//     }

//     while (pendingSignals.current.length > 0) {
//       const signal = pendingSignals.current[0];
//       let processed = false;

//       if (signal.type === 'offer' && peerConnection.current.signalingState === 'stable') {
//         console.log('Processing queued offer.');
//         handleOffer(signal.data);
//         processed = true;
//       } else if (signal.type === 'answer' && peerConnection.current.signalingState === 'have-local-offer') {
//         console.log('Processing queued answer.');
//         handleAnswer(signal.data);
//         processed = true;
//       } else if (signal.type === 'iceCandidate' && peerConnection.current.remoteDescription) {
//         console.log('Processing queued ICE candidate.');
//         handleIceCandidate(signal.data);
//         processed = true;
//       }

//       if (processed) {
//         pendingSignals.current.shift();
//       } else {
//         break;
//       }
//     }
//   }, []);

//   const endCall = useCallback((notifyServer: boolean = true) => {
//     console.log("Ending call...");
//     if (peerConnection.current) {
//       peerConnection.current.close();
//       peerConnection.current = null;
//       console.log("RTCPeerConnection closed.");
//     }
//     if (localStream) {
//       localStream.getTracks().forEach((track) => {
//         track.stop();
//         console.log(`Stopped track: ${track.kind}`);
//       });
//       setLocalStream(null);
//       console.log("Local stream tracks stopped.");
//     }
//     setRemoteStream(null);
//     setOtherUserJoined(false);
//     setCallStatus('ended');
//     setError('');
//     pendingSignals.current = [];
//     isPeerConnectionInitializing.current = false;

//     if (socket && notifyServer) {
//       socket.emit('endCall', appointmentId);
//       console.log("Emitted 'endCall' to server.");
//     }
//     navigate('/user/appointments');
//   }, [appointmentId, localStream, navigate, socket]);

//   const initializePeerConnection = useCallback(() => {
//     if (peerConnection.current || isPeerConnectionInitializing.current) {
//       console.log("Peer connection already initialized or initialization in progress.");
//       return;
//     }

//     isPeerConnectionInitializing.current = true;
//     console.log("Initializing new RTCPeerConnection...");

//     const pc = new RTCPeerConnection({
//       iceServers: [
//         { urls: 'stun:stun.l.google.com:19302' },
//         {
//           urls: 'turn:openrelay.metered.ca:80',
//           username: 'openrelayproject',
//           credential: 'openrelayproject',
//         },
//       ],
//     });

//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         console.log('Generated and emitting ICE candidate:', event.candidate);
//         socket?.emit('iceCandidate', { appointmentId, candidate: event.candidate });
//       }
//     };

//     pc.ontrack = (event) => {
//       console.log('Remote track received:', event.track.kind);
//       console.log('Remote stream:', event.streams[0]);
//       setRemoteStream(event.streams[0]);
//       const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement | null;
//       if (remoteVideo) {
//         remoteVideo.srcObject = event.streams[0];
//         remoteVideo.play().catch(err => console.error('Error playing remote video:', err));
//         console.log('Remote stream attached to video element.');
//       }
//       setCallStatus('connected');
//     };

//     pc.onsignalingstatechange = () => {
//       console.log('Signaling state changed:', pc.signalingState);
//       console.log(`Pending signals count: ${pendingSignals.current.length}`);
//       processPendingSignals();
//     };

//     pc.oniceconnectionstatechange = () => {
//       console.log('ICE connection state:', pc.iceConnectionState);
//       if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
//         setError('Connection failed or disconnected. Please try rejoining the call or check your network.');
//         setCallStatus('error');
//       } else if (pc.iceConnectionState === 'connected') {
//         setCallStatus('connected');
//       }
//     };

//     pc.onconnectionstatechange = () => {
//       console.log('Peer connection state:', pc.connectionState);
//       if (pc.connectionState === 'failed') {
//         setError('Call connection failed. Please check your network and try again.');
//         setCallStatus('error');
//       } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'closed') {
//         if (callStatus === 'connected') {
//           message.info("The call has ended or the other user disconnected.");
//           endCall(false);
//         }
//       } else if (pc.connectionState === 'connected') {
//         setCallStatus('connected');
//       }
//     };

//     peerConnection.current = pc;
//     isPeerConnectionInitializing.current = false;
//     console.log('PeerConnection instance created and assigned.');
//   }, [socket, appointmentId, callStatus, endCall, processPendingSignals]);

//   const createOffer = useCallback(async () => {
//     if (!peerConnection.current) {
//       console.log("Initializing peer connection for offer creation.");
//       initializePeerConnection();
//       return;
//     }
//     console.log(`Current signaling state before offer: ${peerConnection.current.signalingState}`);
//     if (peerConnection.current.signalingState !== 'stable') {
//       console.warn(`Cannot create offer in signaling state: ${peerConnection.current.signalingState}. Waiting for stable.`);
//       return;
//     }

//     try {
//       const offer = await peerConnection.current.createOffer();
//       await peerConnection.current.setLocalDescription(offer);
//       console.log('Created and set local offer. Emitting to server:', offer);
//       socket?.emit('offer', { appointmentId, offer });
//     } catch (err) {
//       console.error('Error creating or setting offer:', err);
//       setError('Failed to initiate call. Please try again.');
//       setCallStatus('error');
//     }
//   }, [appointmentId, initializePeerConnection, socket]);

//   const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
//     if (!peerConnection.current) {
//       console.log("Initializing peer connection for offer handling.");
//       initializePeerConnection();
//     }
//     console.log(`Current signaling state before handling offer: ${peerConnection.current?.signalingState}`);
//     if (!peerConnection.current || peerConnection.current.signalingState !== 'stable') {
//       console.warn(`Cannot handle offer in signaling state: ${peerConnection.current?.signalingState}. Queuing offer.`);
//       pendingSignals.current.push({ type: 'offer', data: offer });
//       return;
//     }

//     try {
//       await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
//       const answer = await peerConnection.current.createAnswer();
//       await peerConnection.current.setLocalDescription(answer);
//       console.log('Received offer, created and set local answer. Emitting to server:', answer);
//       socket?.emit('answer', { appointmentId, answer });
//     } catch (err) {
//       console.error('Error handling offer:', err);
//       setError('Failed to connect to call. Please try again.');
//       setCallStatus('error');
//     }
//   }, [appointmentId, initializePeerConnection, socket]);

//   const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
//     if (!peerConnection.current || peerConnection.current.signalingState !== 'have-local-offer') {
//       console.warn(`Cannot handle answer in signaling state: ${peerConnection.current?.signalingState}. Queuing answer.`);
//       pendingSignals.current.push({ type: 'answer', data: answer });
//       return;
//     }
//     try {
//       await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
//       console.log('Received and set remote answer.');
//       processPendingSignals();
//     } catch (err) {
//       console.error('Error setting remote description for answer:', err);
//       setError('Failed to connect to call. Please try again.');
//       setCallStatus('error');
//     }
//   }, [processPendingSignals]);

//   const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit | undefined) => {
//     if (!candidate) {
//       console.warn("Received null or undefined ICE candidate.");
//       return;
//     }
//     console.log(`Remote description set: ${!!peerConnection.current?.remoteDescription}`);
//     if (!peerConnection.current || !peerConnection.current.remoteDescription) {
//       console.warn("Peer connection or remote description not ready to add ICE candidate. Queuing signal.");
//       pendingSignals.current.push({ type: 'iceCandidate', data: candidate });
//       return;
//     }
//     try {
//       await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
//       console.log('Successfully added remote ICE candidate:', candidate);
//     } catch (err) {
//       console.error('Error adding ICE candidate:', err);
//     }
//   }, []);

//   const toggleAudio = useCallback(() => {
//     if (localStream) {
//       localStream.getAudioTracks().forEach((track) => {
//         track.enabled = !track.enabled;
//         setIsAudioMuted(!track.enabled);
//         console.log(`Audio track enabled: ${track.enabled}`);
//       });
//     }
//   }, [localStream]);

//   const toggleVideo = useCallback(() => {
//     if (localStream) {
//       localStream.getVideoTracks().forEach((track) => {
//         track.enabled = !track.enabled;
//         setIsVideoMuted(!track.enabled);
//         console.log(`Video track enabled: ${track.enabled}`);
//       });
//     }
//   }, [localStream]);

//   // Add tracks when localStream changes
//   useEffect(() => {
//     if (localStream && peerConnection.current) {
//       localStream.getTracks().forEach((track) => {
//         if (!peerConnection.current!.getSenders().some(sender => sender.track === track)) {
//           peerConnection.current!.addTrack(track, localStream);
//           console.log(`Added local track after stream update: ${track.kind}`);
//         }
//       });
//     }
//   }, [localStream]);

//   useEffect(() => {
//     let currentSocketInstance: Socket | null = null;
//     let currentLocalStreamInstance: MediaStream | null = null;

//     const setupAndConnect = async () => {
//       if (isMediaRequested.current) {
//         console.log("Media access already requested. Skipping duplicate request.");
//         return;
//       }
//       isMediaRequested.current = true;

//       let token = document.cookie
//         .split('; ')
//         .find((row) => row.startsWith('userAccessToken='))
//         ?.split('=')[1];

//       if (!token) {
//         try {
//           token = await getAccessToken();
//         } catch (err) {
//           return;
//         }
//       }

//       console.log('Attempting to connect socket...');
//       const sock = io(import.meta.env.VITE_REACT_APP_SOCKET_URL || 'http://localhost:3000', {
//         auth: { token },
//         reconnection: true,
//         reconnectionAttempts: 5,
//         reconnectionDelay: 1000,
//       });
//       currentSocketInstance = sock;
//       setSocket(sock);

//       sock.on('reconnect', () => {
//         console.log('Socket Reconnected. Rejoining video call...');
//         sock.emit('joinVideoCall', appointmentId);
//       });

//       console.log('Requesting media devices...');
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
//           .catch(async (err) => {
//             console.warn('Failed to get both video and audio:', err);
//             return await navigator.mediaDevices.getUserMedia({ audio: true })
//               .catch((audioErr) => {
//                 console.error('Failed to get audio-only:', audioErr);
//                 throw new Error('No media devices available.');
//               });
//           });
//         currentLocalStreamInstance = stream;
//         setLocalStream(stream);
//         const localVideo = document.getElementById('localVideo') as HTMLVideoElement | null;
//         if (localVideo) {
//           localVideo.srcObject = stream;
//           console.log('Local media stream obtained and set on video element.');
//         }
//         setCallStatus('waiting');
//       } catch (err) {
//         console.error('Error accessing media devices:', err);
//         setError('Failed to access camera or microphone. Please check permissions and refresh.');
//         setCallStatus('error');
//       }
//     };

//     setupAndConnect();

//     return () => {
//       console.log('Cleaning up initial setup (UserVideoCall component unmount).');
//       if (currentSocketInstance) {
//         currentSocketInstance.disconnect();
//         console.log('Socket disconnected via useEffect cleanup.');
//       }
//       if (currentLocalStreamInstance) {
//         currentLocalStreamInstance.getTracks().forEach((track) => {
//           track.stop();
//           console.log(`Stopped track: ${track.kind}`);
//         });
//         console.log('Local stream tracks stopped via useEffect cleanup.');
//       }
//       if (peerConnection.current) {
//         peerConnection.current.close();
//         peerConnection.current = null;
//         console.log('PeerConnection closed via useEffect cleanup.');
//       }
//       pendingSignals.current = [];
//       isPeerConnectionInitializing.current = false;
//       isMediaRequested.current = false;
//     };
//   }, [appointmentId, getAccessToken]);

//   useEffect(() => {
//     let timeoutId: ReturnType<typeof setTimeout>;
//     if (!otherUserJoined && callStatus === 'waiting') {
//       console.log('Setting 5-minute timeout for doctor to join...');
//       timeoutId = setTimeout(() => {
//         if (!otherUserJoined) {
//           message.warning('Doctor has not joined the call within 5 minutes. Returning to appointments...');
//           endCall();
//         }
//       }, 5 * 60 * 1000);
//     }

//     return () => {
//       if (timeoutId) {
//         clearTimeout(timeoutId);
//         console.log('Timeout cleared.');
//       }
//     };
//   }, [otherUserJoined, callStatus, endCall]);

//   useEffect(() => {
//     if (socket && appointmentId) {
//       console.log(`Attaching Socket.IO listeners for appointment: ${appointmentId}`);

//       socket.on('joinedVideoCall', (data) => {
//         console.log('Server confirmed joined video call room:', data.appointmentId);
//       });

//       socket.on('userJoined', (data: { userId: string; role: 'doctor' | 'user' }) => {
//         console.log(`User ${data.userId} (${data.role}) joined the call room.`);
//         setOtherUserJoined(true);
//         setCallStatus('connected');
//         if (!peerConnection.current && localStream) {
//           console.log("User joined, and local stream ready. Initializing PeerConnection.");
//           initializePeerConnection();
//         } else if (!localStream) {
//           console.warn("User joined, but local stream not ready. PeerConnection initialization delayed.");
//         }
//       });

//       socket.on('startCall', () => {
//         console.log('Received startCall event. Preparing to create WebRTC offer...');
//         if (!peerConnection.current) {
//           console.log("startCall received, but peerConnection not initialized. Initializing now.");
//           initializePeerConnection();
//         }
//         createOffer();
//       });

//       socket.on('offer', (data: { offer: RTCSessionDescriptionInit; from: string }) => {
//         console.log('Received WebRTC offer from:', data.from);
//         handleOffer(data.offer);
//       });

//       socket.on('answer', (data: { answer: RTCSessionDescriptionInit; from: string }) => {
//         console.log('Received WebRTC answer from:', data.from);
//         handleAnswer(data.answer);
//       });

//       socket.on('iceCandidate', (data: { candidate: RTCIceCandidateInit; from: string }) => {
//         console.log('Received ICE candidate from:', data.from);
//         handleIceCandidate(data.candidate);
//       });

//       socket.on('callEnded', () => {
//         console.log('Call ended by remote user.');
//         endCall(false);
//       });

//       socket.on('userLeft', (data: { userId: string }) => {
//         console.log(`User ${data.userId} left the call room.`);
//         message.info('The other participant has left the call.');
//         setOtherUserJoined(false);
//         setRemoteStream(null);
//         setCallStatus('waiting');
//         if (peerConnection.current) {
//           peerConnection.current.close();
//           peerConnection.current = null;
//           isPeerConnectionInitializing.current = false;
//         }
//         pendingSignals.current = [];
//       });

//       socket.on('error', (data: { message: string }) => {
//         console.error('Socket error from server:', data.message);
//         setError(`Server Error: ${data.message}`);
//         setCallStatus('error');
//       });

//       return () => {
//         console.log('Detaching Socket.IO listeners for UserVideoCall.');
//         socket.off('joinedVideoCall');
//         socket.off('userJoined');
//         socket.off('startCall');
//         socket.off('offer');
//         socket.off('answer');
//         socket.off('iceCandidate');
//         socket.off('callEnded');
//         socket.off('userLeft');
//         socket.off('error');
//       };
//     }
//   }, [
//     socket,
//     appointmentId,
//     localStream,
//     createOffer,
//     handleOffer,
//     handleAnswer,
//     handleIceCandidate,
//     endCall,
//     initializePeerConnection,
//   ]);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-4xl">
//         <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Video Consultation with Doctor</h1>
//         {error && (
//           <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-center">{error}</div>
//         )}
//         <div className="flex flex-col md:flex-row gap-4 mb-6">
//           <div className="flex-1 relative bg-gray-900 rounded-lg overflow-hidden">
//             <video
//               id="localVideo"
//               autoPlay
//               playsInline
//               muted
//               className="w-full h-full object-cover routerounded-lg transform scaleX(-1)"
//             />
//             <p className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">You (Patient)</p>
//           </div>
//           <div className="flex-1 relative bg-gray-900 rounded-lg overflow-hidden">
//             {otherUserJoined && remoteStream ? (
//               <video
//                 id="remoteVideo"
//                 autoPlay
//                 playsInline
//                 className="w-full h-full object-cover rounded-lg"
//               />
//             ) : (
//               <div className="w-full h-full rounded-lg border-2 border-gray-200 bg-gray-100 flex items-center justify-center p-4">
//                 <p className="text-gray-500 text-center text-lg animate-pulse">
//                   {callStatus === 'connecting'
//                     ? 'Connecting to call server...'
//                     : callStatus === 'waiting'
//                       ? 'Waiting for doctor to join...'
//                       : callStatus === 'error'
//                         ? 'Call error, check permissions.'
//                         : 'Call ended or failed to connect.'}
//                 </p>
//               </div>
//             )}
//             <p className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">Doctor</p>
//           </div>
//         </div>
//         <div className="flex flex-wrap justify-center gap-4 mt-6">
//           <button
//             onClick={toggleAudio}
//             className={`flex items-center gap-2 px-6 py-3 text-white rounded-full transition-all duration-300 ease-in-out
//               ${isAudioMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
//               ${callStatus !== 'connected' && 'opacity-50 cursor-not-allowed'}`}
//             disabled={callStatus !== 'connected'}
//           >
//             {isAudioMuted ? <FaMicrophoneSlash className="text-lg" /> : <FaMicrophone className="text-lg" />}
//             {isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
//           </button>
//           <button
//             onClick={toggleVideo}
//             className={`flex items-center gap-2 px-6 py-3 text-white rounded-full transition-all duration-300 ease-in-out
//               ${isVideoMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
//               ${callStatus !== 'connected' && 'opacity-50 cursor-not-allowed'}`}
//             disabled={callStatus !== 'connected'}
//           >
//             {isVideoMuted ? <FaVideoSlash className="text-lg" /> : <FaVideo className="text-lg" />}
//             {isVideoMuted ? 'Unmute Video' : 'Mute Video'}
//           </button>
//           <button
//             onClick={() => endCall(true)}
//             className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all duration-300 ease-in-out shadow-lg"
//           >
//             <FaPhoneSlash className="text-lg" /> End Call
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserVideoCall;


//----------------------------------------------------------------------------------------

// import { useEffect, useRef, useState, useCallback } from "react";
// import io, { Socket } from "socket.io-client";
// import { useParams, useNavigate } from "react-router-dom";
// import { message } from "antd";
// import axios from "axios";
// import peer from "../../services/peerServices";

// type CallStatus = "connecting" | "waiting" | "connected" | "ended" | "error";

// const UserVideoCall = () => {
//   const localVideo = useRef<HTMLVideoElement>(null);
//   const remoteVideo = useRef<HTMLVideoElement>(null);
//   const socketRef = useRef<Socket | null>(null);
//   const [localStream, setLocalStream] = useState<MediaStream | null>(null);
//   const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
//   const [callStatus, setCallStatus] = useState<CallStatus>("connecting");
//   const [error, setError] = useState("");
//   const [otherUserJoined, setOtherUserJoined] = useState(false);
//   const [isAudioMuted, setIsAudioMuted] = useState(false);
//   const [isVideoMuted, setIsVideoMuted] = useState(false);
//   const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);

//   const navigate = useNavigate();
//   const { appointmentId } = useParams<{ appointmentId: string }>();

//   const getAccessToken = useCallback(async (): Promise<string> => {
//     try {
//       const response = await axios.post(
//         "http://localhost:3000/api/user/refreshToken",
//         {},
//         { withCredentials: true }
//       );
//       return response.data.accessToken;
//     } catch (error) {
//       message.error("Session expired. Redirecting to login...");
//       setTimeout(() => navigate("/login"), 2000);
//       throw error;
//     }
//   }, [navigate]);

//   const getToken = useCallback(async () => {
//     let token =
//       document.cookie
//         .split("; ")
//         .find((row) => row.startsWith("userAccessToken="))
//         ?.split("=")[1] || "";
//     if (!token) {
//       try {
//         token = await getAccessToken();
//       } catch {
//         return "";
//       }
//     }
//     return token;
//   }, [getAccessToken]);

//   const sendStreams = useCallback(() => {
//     if (localStream && peer.peer) {
//       for (const track of localStream.getTracks()) {
//         console.log(`Adding track: ${track.kind}`);
//         peer.peer.addTrack(track, localStream);
//       }
//     }
//   }, [localStream]);

//   const handleNegoNeeded = useCallback(async () => {
//     if (peer.peer && remoteSocketId) {
//       const offer = await peer.getOffer();
//       if (offer) {
//         socketRef.current?.emit("peer:nego:needed", { to: remoteSocketId, offer });
//         console.log("Sent negotiation offer to", remoteSocketId);
//       }
//     }
//   }, [remoteSocketId]);

//   useEffect(() => {
//     if (peer.peer) {
//       peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
//       return () => {
//         if (peer.peer) {
//           peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
//         }
//       };
//     }
//   }, [handleNegoNeeded]);

//   useEffect(() => {
//     if (peer.peer) {
//       peer.peer.addEventListener("track", (ev) => {
//         console.log("Received remote stream:", ev.streams[0]);
//         console.log("Remote stream tracks:", ev.streams[0].getTracks());
//         setRemoteStream(ev.streams[0]);
//         if (remoteVideo.current) {
//           remoteVideo.current.srcObject = ev.streams[0];
//           console.log("Set remote video srcObject");
//         }
//       });

//       peer.peer.addEventListener("icecandidate", (event) => {
//         if (event.candidate && remoteSocketId) {
//           console.log("Sending ICE candidate to", remoteSocketId);
//           socketRef.current?.emit("ice:candidate", {
//             to: remoteSocketId,
//             candidate: event.candidate,
//           });
//         }
//       });

//       peer.peer.addEventListener("iceconnectionstatechange", () => {
//         console.log(`ICE connection state: ${peer.peer?.iceConnectionState}`);
//         if (peer.peer?.iceConnectionState === "disconnected" || peer.peer?.iceConnectionState === "failed") {
//           setCallStatus("error");
//           setError("Connection lost. Please try again.");
//           cleanupCall();
//         }
//       });

//       peer.peer.addEventListener("signalingstatechange", () => {
//         console.log(`Signaling state: ${peer.peer?.signalingState}`);
//       });
//     }
//   }, [remoteSocketId]);

//   useEffect(() => {
//     let cleanup = false;

//     const setup = async () => {
//       if (!appointmentId) {
//         setError("Invalid appointment ID.");
//         setCallStatus("error");
//         return;
//       }

//       setCallStatus("connecting");
//       const token = await getToken();
//       if (!token) {
//         setError("Authentication failed.");
//         setCallStatus("error");
//         return;
//       }

//       try {
//         let mediaStream: MediaStream;
//         try {
//           mediaStream = await navigator.mediaDevices.getUserMedia({
//             video: true,
//             audio: true,
//           });
//         } catch (err) {
//           console.warn("Falling back to dummy stream due to:", err);
//           const canvas = document.createElement("canvas");
//           canvas.width = 640;
//           canvas.height = 480;
//           const ctx = canvas.getContext("2d");
//           if (ctx) {
//             ctx.fillStyle = "blue";
//             ctx.fillRect(0, 0, canvas.width, canvas.height);
//             ctx.fillStyle = "white";
//             ctx.font = "30px Arial";
//             ctx.fillText("Dummy User Video", 50, 240);
//           }
//           mediaStream = canvas.captureStream(15);
//           const audioCtx = new AudioContext();
//           const oscillator = audioCtx.createOscillator();
//           oscillator.frequency.setValueAtTime(0, audioCtx.currentTime);
//           const dest = audioCtx.createMediaStreamDestination();
//           oscillator.connect(dest);
//           oscillator.start();
//           mediaStream.addTrack(dest.stream.getAudioTracks()[0]);
//         }

//         if (cleanup) return;
//         setLocalStream(mediaStream);
//         console.log("Local stream tracks:", mediaStream.getTracks());
//         if (localVideo.current) {
//           localVideo.current.srcObject = mediaStream;
//         }

//         const socket = io(
//           import.meta.env.VITE_REACT_APP_SOCKET_URL || "http://localhost:3000",
//           { auth: { token } }
//         );
//         socketRef.current = socket;

//         socket.emit("joinVideoCall", appointmentId);

//         socket.on("joinedVideoCall", () => {
//           console.log("User joined video call:", appointmentId);
//           setCallStatus("waiting");
//         });

//         socket.on("user:joined", ({ id, role }) => {
//           console.log(`User ${id} (${role}) joined the call`);
//           setOtherUserJoined(true);
//           setRemoteSocketId(id);
//           setCallStatus("connected");
//         });

//         socket.on("incomming:call", async ({ from, offer }) => {
//           console.log(`Received incoming call from ${from}`);
//           setRemoteSocketId(from);
//           if (!localStream || !socket) {
//             console.error("Cannot handle call: localStream or socket not ready");
//             return;
//           }
//           try {
//             const ans = await peer.getAnswer(offer);
//             if (ans) {
//               socket.emit("call:accepted", { to: from, ans });
//               console.log("Sent call accepted to", from);
//               sendStreams();
//             }
//           } catch (err) {
//             setError("Failed to handle incoming call.");
//             setCallStatus("error");
//             console.error("Call handling error:", err);
//           }
//         });

//         socket.on("call:accepted", ({ from, ans }) => {
//           console.log(`Received call accepted from ${from}`);
//           peer.setLocalDescription(ans);
//           console.log("Call accepted, streams already sent");
//         });

//         socket.on("peer:nego:needed", async ({ from, offer }) => {
//           console.log(`Received negotiation needed from ${from}`);
//           const ans = await peer.getAnswer(offer);
//           if (ans) {
//             socket.emit("peer:nego:done", { to: from, ans });
//             console.log("Sent negotiation answer to", from);
//           }
//         });

//         socket.on("peer:nego:final", async ({ ans }) => {
//           console.log("Received negotiation final");
//           await peer.setLocalDescription(ans);
//         });

//         socket.on("ice:candidate", ({ from, candidate }) => {
//           console.log(`Received ICE candidate from ${from}`);
//           if (candidate && peer.peer) {
//             peer.peer.addIceCandidate(new RTCIceCandidate(candidate)).catch((err) => {
//               console.error("Error adding ICE candidate:", err);
//             });
//           }
//         });

//         socket.on("mute", ({ type, muted, userId }) => {
//           message.info(`Doctor ${muted ? "muted" : "unmuted"} ${type}.`);
//         });

//         socket.on("callEnded", ({ userId }) => {
//           console.log(`Call ended by ${userId}`);
//           cleanupCall();
//           setCallStatus("ended");
//           message.info("Call ended by doctor.");
//           setTimeout(() => navigate("/user/appointments"), 2000);
//         });

//         socket.on("userLeft", ({ userId }) => {
//           console.log(`User ${userId} left the call`);
//           setOtherUserJoined(false);
//           setRemoteStream(null);
//           setRemoteSocketId(null);
//           setCallStatus("waiting");
//           if (peer.peer) {
//             peer.peer.close();
//             peer.peer = null;
//           }
//           message.info("Doctor has left the call.");
//         });

//         socket.on("error", (data: { message: string }) => {
//           console.error("Socket error:", data.message);
//           setError(data.message);
//           setCallStatus("error");
//         });
//       } catch (err) {
//         setError("Please allow camera and microphone access or check device availability.");
//         setCallStatus("error");
//         console.error("Media access error:", err);
//       }
//     };

//     setup();

//     return () => {
//       cleanup = true;
//       cleanupCall();
//     };
//   }, [appointmentId, getToken, navigate, sendStreams]);

//   const cleanupCall = () => {
//     console.log("Cleaning up call");
//     if (peer.peer) {
//       peer.peer.close();
//       peer.peer = null;
//     }
//     if (socketRef.current) {
//       socketRef.current.emit("endCall", appointmentId);
//       socketRef.current.disconnect();
//       socketRef.current = null;
//     }
//     if (localStream) {
//       localStream.getTracks().forEach((track) => track.stop());
//     }
//     setLocalStream(null);
//     setRemoteStream(null);
//     setRemoteSocketId(null);
//     if (localVideo.current) localVideo.current.srcObject = null;
//     if (remoteVideo.current) remoteVideo.current.srcObject = null;
//   };

//   const toggleMute = (type: "audio" | "video") => {
//     if (localStream) {
//       localStream.getTracks().forEach((track) => {
//         if (track.kind === type) {
//           track.enabled = !track.enabled;
//           if (type === "audio") {
//             setIsAudioMuted(!track.enabled);
//           } else {
//             setIsVideoMuted(!track.enabled);
//           }
//           socketRef.current?.emit("mute", {
//             appointmentId,
//             type,
//             muted: !track.enabled,
//           });
//         }
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-4xl">
//         <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
//           Video Consultation with Doctor
//         </h1>
//         {error && (
//           <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-center">
//             {error}
//             {error.includes("camera") && (
//               <p className="mt-2 text-sm">
//                 Please check browser permissions or try another device.
//               </p>
//             )}
//           </div>
//         )}
//         <div className="flex flex-col md:flex-row gap-4 mb-6">
//           <div className="flex-1 relative bg-gray-900 rounded-lg overflow-hidden">
//             <video
//               ref={localVideo}
//               autoPlay
//               playsInline
//               muted
//               className="w-full h-full object-cover rounded-lg transform scaleX(-1)"
//             />
//             <p className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
//               You (Patient)
//             </p>
//           </div>
//           <div className="flex-1 relative bg-gray-900 rounded-lg overflow-hidden">
//             {otherUserJoined && remoteStream ? (
//               <video
//                 ref={remoteVideo}
//                 autoPlay
//                 playsInline
//                 className="w-full h-full object-cover rounded-lg"
//               />
//             ) : (
//               <div className="w-full h-full rounded-lg border-2 border-gray-200 bg-gray-100 flex items-center justify-center p-4">
//                 <p className="text-gray-500 text-center text-lg animate-pulse">
//                   {callStatus === "connecting"
//                     ? "Connecting to call server..."
//                     : callStatus === "waiting"
//                     ? "Waiting for doctor to join..."
//                     : callStatus === "error"
//                     ? "Call error, check permissions or connection."
//                     : "Call ended or failed to connect."}
//                 </p>
//               </div>
//             )}
//             <p className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
//               Doctor
//             </p>
//           </div>
//         </div>
//         <div className="flex flex-wrap justify-center gap-4 mt-6">
//           <button
//             onClick={() => toggleMute("audio")}
//             className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ease-in-out shadow-lg ${
//               isAudioMuted ? "bg-yellow-600 hover:bg-yellow-700" : "bg-blue-600 hover:bg-blue-700"
//             } text-white`}
//             disabled={callStatus === "ended" || callStatus === "error"}
//           >
//             {isAudioMuted ? "Unmute Audio" : "Mute Audio"}
//           </button>
//           <button
//             onClick={() => toggleMute("video")}
//             className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ease-in-out shadow-lg ${
//               isVideoMuted ? "bg-yellow-600 hover:bg-yellow-700" : "bg-blue-600 hover:bg-blue-700"
//             } text-white`}
//             disabled={callStatus === "ended" || callStatus === "error"}
//           >
//             {isVideoMuted ? "Unmute Video" : "Mute Video"}
//           </button>
//           <button
//             onClick={cleanupCall}
//             className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all duration-300 ease-in-out shadow-lg"
//             disabled={callStatus === "ended" || callStatus === "error"}
//           >
//             End Call
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserVideoCall;