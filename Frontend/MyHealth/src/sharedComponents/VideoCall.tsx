import { useEffect, useRef, useState } from "react";
import PeerService, { initializeSocket, getSocket } from "../services/peerServices";
import { useParams } from "react-router-dom";

interface VideoCallProps {
  role: "doctor" | "user";
}

const VideoCall = ({ role }: VideoCallProps) => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<PeerService | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

useEffect(() => {
  let isMounted = true;
  let socketInstance: ReturnType<typeof getSocket>;

  const setup = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (!isMounted) return;

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      await initializeSocket(role);
      socketInstance = getSocket();

      socketInstance.emit("joinVideoCall", appointmentId);
      setupSocketEvents(socketInstance, stream);
    } catch (err) {
      console.error("Media or socket init failed:", err);
    }
  };

  setup();

  return () => {
    isMounted = false;
    cleanup();
    if (socketInstance) socketInstance.removeAllListeners(); // <-- prevent mem leaks
  };
}, [role, appointmentId]);


  const setupSocketEvents = (socket: ReturnType<typeof getSocket>, stream: MediaStream) => {
    const createPeer = (remoteId: string): PeerService => {
      const peer = new PeerService(remoteId);
      peerRef.current = peer;

      peer.onRemoteStream((remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      stream.getTracks().forEach((track) => peer.peer.addTrack(track, stream));
      return peer;
    };

    socket.on("user:joined", async ({ id: remoteId }) => {
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

    socket.on("callEnded", cleanup);
    socket.on("userLeft", cleanup);
  };

  const endCall = () => {
    const socket = getSocket();
    socket.emit("endCall", appointmentId);
    cleanup();
  };

  const cleanup = () => {
    peerRef.current?.close();
    setLocalStream((prev) => {
      prev?.getTracks().forEach((track) => track.stop());
      return null;
    });
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    peerRef.current = null;
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-xl font-bold">Video Call</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm">Your Video</h4>
          <video ref={localVideoRef} autoPlay muted playsInline className="w-full rounded-xl border shadow" />
        </div>
        <div>
          <h4 className="text-sm">Remote Video</h4>
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full rounded-xl border shadow" />
        </div>
      </div>
      <button
        onClick={endCall}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
      >
        End Call
      </button>
    </div>
  );
};

export default VideoCall;
