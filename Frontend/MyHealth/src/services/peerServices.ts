import io from "socket.io-client";
import axios from "axios";
import { message } from "antd";

let socket: ReturnType<typeof io> | null = null;

const getAccessToken = async (role: string): Promise<string> => {
  try {
    const response = await axios.post(
      `http://localhost:3000/api/${role}/refreshToken`,
      {},
      { withCredentials: true }
    );
    return response.data.accessToken;
  } catch (error) {
    message.error("Session expired. Redirecting to login...");
    setTimeout(() => (window.location.href = "/login"), 2000);
    throw error;
  }
};

const getToken = async (role: string) => {
  let token =
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${role}AccessToken=`))
      ?.split("=")[1] || "";
  if (!token) {
    try {
      token = await getAccessToken(role);
    } catch {
      return "";
    }
  }
  return token;
};

export const initializeSocket = async (role: string) => {
  const token = await getToken(role);
  // Ensure we only create a new socket if one doesn't exist or needs re-initialization
  if (!socket || !socket.connected) { 
    socket = io(import.meta.env.VITE_REACT_APP_SOCKET_URL || "http://localhost:3000", {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    // Optional: Add socket event listeners for debugging connection

    
    socket.on("connect", () => console.log("Socket connected!"));
    socket.on("disconnect", () => console.log("Socket disconnected!"));
    socket.on("connect_error", (err) => console.error("Socket connection error:", err.message));
  }
  return socket;
};

export const getSocket = (): ReturnType<typeof io> => {
  if (!socket) {
    throw new Error("Socket not initialized. Call initializeSocket() first.");
  }
  return socket;
};

class PeerService {
  peer: RTCPeerConnection;
  remoteUserId: string;
  // stream?: MediaStream; // This is not needed to be stored on PeerService
  onRemoteStreamCallback?: (stream: MediaStream) => void;

  constructor(remoteUserId: string) {
    this.remoteUserId = remoteUserId;
    this.peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:global.stun.twilio.com:3478" },
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
      ],
    });

    this.peer.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Sending ICE candidate to:", this.remoteUserId, event.candidate); // Added log
        getSocket().emit("ice:candidate", {
          to: this.remoteUserId,
          candidate: event.candidate,
        });
      }
    };


     this.peer.ontrack = (event) => {
      if (event.streams.length === 0) return;
      const remoteStream = event.streams;
      console.log("Received remote track, stream ID:", remoteStream[0].id);
      if (this.onRemoteStreamCallback) {
        this.onRemoteStreamCallback(remoteStream[0]);
      }
    };

    this.peer.onnegotiationneeded = async () => {
        try {
          if (this.peer.signalingState === 'stable') {
            const offer = await this.peer.createOffer();
            await this.peer.setLocalDescription(offer);
            getSocket().emit("peer:nego:needed", {
              to: this.remoteUserId,
              offer
            });
          } else {
            console.warn("Negotiation skipped due to unstable signalingState.");
          }
        } catch (err) {
          console.error("Negotiation error:", err);
        }
      };

  }

  addLocalStream(stream: MediaStream) {

    stream.getTracks().forEach((track) => {

      this.peer.addTrack(track, stream);
      console.log("Added local track:", track.kind); 
    });
  }

  onRemoteStream(callback: (stream: MediaStream) => void) {
    this.onRemoteStreamCallback = callback;
  }

  async createOffer(): Promise<RTCSessionDescriptionInit | undefined> {
    try {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(offer);
      console.log("Created and set local offer:", offer); // Added log
      return offer;
    } catch (err) {
      console.error("Error creating offer:", err);
      return undefined; // Ensure undefined on error
    }
  }

  async createAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit | undefined> {
    try {
      await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peer.createAnswer();
      await this.peer.setLocalDescription(answer);
      console.log("Created and set local answer:", answer); // Added log
      return answer;
    } catch (err) {
      console.error("Error creating answer:", err);
      return undefined; // Ensure undefined on error
    }
  }

  async setRemoteDescription(desc: RTCSessionDescriptionInit): Promise<void> {
    try {
      
        if (this.peer.remoteDescription?.type === desc.type && this.peer.signalingState === 'stable') {
            console.warn(`Skipping setRemoteDescription: Already in stable state with same type (${desc.type}).`);
            return;
        }

      await this.peer.setRemoteDescription(new RTCSessionDescription(desc));
      console.log("Set remote description:", desc.type); 
    } catch (err) {
      console.error("Error setting remote description:", err);
    }
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    try {
        
        if (this.peer.signalingState !== 'closed' && candidate) {
            await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
            console.warn("Attempted to add ICE candidate to a closed peer connection or candidate is null.");
        }
    } catch (err) {
        console.error("Error adding ICE candidate:", err);
    }
  }

  close(): void {

    this.peer.getSenders().forEach((sender) => {
      try {
        if (sender.track) { 
          sender.track.stop(); 
        }
        this.peer.removeTrack(sender); 
      } catch (e) {
        console.error("Error removing track or sender:", e);
      }
    });

   

    this.peer.close();
    console.log("Peer connection closed."); 
  }
}

export default PeerService;