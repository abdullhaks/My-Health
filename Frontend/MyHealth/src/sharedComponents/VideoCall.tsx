import { useEffect, useRef, useState } from "react";
import PeerService, { initializeSocket } from "../services/peerServices";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Tooltip, Input, List, Avatar, Modal, Form, Select, DatePicker, Tabs ,message as antAlert, Card, Badge, Divider, Tag, Space, Timeline, Descriptions } from "antd";
import {AudioOutlined,AudioMutedOutlined,VideoCameraOutlined, VideoCameraFilled,PhoneOutlined,
  MessageOutlined, SendOutlined,SnippetsOutlined,PlusOutlined,MinusCircleOutlined, UserOutlined, CalendarOutlined, MedicineBoxOutlined, AlertOutlined, HistoryOutlined} from '@ant-design/icons';
import { io } from "socket.io-client";
import { getPrescriptions,submitPrescription , getUser} from "../api/doctor/doctorApi";
import { IUser } from "../interfaces/user";

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

  interface PrescriptionValues {
    medicalCondition:string;
    medications:{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }[]
    medicationPeriod:number
    notes:string
  }


interface Prescription extends PrescriptionValues  {
  _id?: string;
  appointmentId: string;
  userId: string;
  doctorId: string;
  createdAt?: Date;
};

const VideoCall = ({ role }: VideoCallProps) => {
  var role = role ;
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
  const [showPrescription, setShowPrescription] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [newPrescription, setNewPrescription] = useState<Prescription>({
    appointmentId: appointmentId || "",
    userId: "",
    doctorId: "",
    medicalCondition:"",
    medications: [],
    medicationPeriod:3,
    notes: "",
    createdAt: new Date()
  });
  const [otherParticipant, setOtherParticipant] = useState<{
    id: string;
    role: "doctor" | "user";
  } | null>(null);
  const [remoteVideoStatus, setRemoteVideoStatus] = useState("Connecting...");
  const [form] = Form.useForm();
  const location = useLocation();
  const {appointment} = location.state;
  const [patient,setPatient] = useState<IUser | null>(null);
  const navigate = useNavigate();
  const [prescriptionSubmited , setPrescriptionSubmited] = useState(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };


   const calculateAge = (dateOfBirth:string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
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

  const togglePrescription = () => {
    setShowPrescription(!showPrescription);
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
    if (!socketRef.current || !appointmentId) return;

    socketRef.current.emit("leaveCall", { appointmentId, role,prescriptionSubmited });

    // For user: immediately cleanup and navigate (backend will handle emit to doctor)
    if (role === "user") {
      navigate(`/${role}/appointments`, { replace: true });
    }
    // For doctor: wait for backend confirmation via "callEnded" event before cleanup
    if (role === "doctor") {
      antAlert.info("Ending call, please wait...");
    }

  };


  const cleanup = () => {
    if (socketRef.current) {
      socketRef.current.off("videoCall:newMessage");
      socketRef.current.off("user:joined");
      socketRef.current.off("incomming:call");
      socketRef.current.off("call:accepted");
      socketRef.current.off("peer:nego:needed");
      socketRef.current.off("peer:nego:final");
      socketRef.current.off("ice:candidate");
      socketRef.current.off("startCall");
      socketRef.current.off("callEnded");
      socketRef.current.off("userLeft");
      socketRef.current.off("doctorLeft");
      socketRef.current.off("mute");
      socketRef.current.off("leaveForced"); // New
      socketRef.current.disconnect(); // Add this to ensure disconnect
    }
    
    peerRef.current?.close();
    peerRef.current = null;
    setLocalStream(prev => {
      prev?.getTracks().forEach(track => track.stop());
      return null;
    });
    
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setMessages([]);
  };

  // Fetch prescriptions (mock implementation - replace with actual API call)
  const fetchPrescriptions = async (userId:string) => {

    try {
      const response = await getPrescriptions(userId);
      const patientResp = await getUser(userId);

      console.log("prescripton are....",response);
      console.log("patientResp are....",patientResp);

      
      if(response) antAlert.info("prescriptions fetched");

      setPrescriptions(response);
      setPatient(patientResp || {});

    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    }
  };


  const handleAddPrescription = async (values:PrescriptionValues) => {
    const newPrescriptionData: Prescription = {
      appointmentId: appointmentId ||appointment._id || "",
      userId: otherParticipant?.id ||appointment.userId|| "",
      doctorId: appointment.doctorId || "",
      medicalCondition:values.medicalCondition || "",
      medications: values.medications || [],
      medicationPeriod:values.medicationPeriod || 3,
      notes: values.notes,
      createdAt: new Date()
    };

    try {
      
      const response = await submitPrescription(newPrescriptionData)
      if(response){
        setPrescriptions([...prescriptions, response]);
        form.resetFields();
        setPrescriptionSubmited(true);
        antAlert.success("prescription submited")
        setShowPrescription(false);
      }  else {
        antAlert.error("Failed to add prescription. Please try again.");
      }
      
    } catch (error) {
      console.error('Error saving prescription:', error);
    }
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
            };
            
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

          socket.on("callEnded",()=> {
            
            cleanup()
            navigate(`/${role}/appointments`, { replace: true });
          });

        socket.on("userLeft", ({ userId }) => {
            if (role === "doctor") {
              setRemoteVideoStatus("Patient left, waiting to rejoin");
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = null;
              }
              peerRef.current?.close();
              peerRef.current = null;
            } else {
              cleanup();
            }
          });

        socket.on("doctorLeft", () => {
            if (role === "user") {
              setRemoteVideoStatus("Doctor left, waiting...");
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = null;
              }
              peerRef.current?.close();
              peerRef.current = null;
            }
          });

          socket.on("leaveForced", () => {

            console.log("Leaving call without submitting prescription.")
            antAlert.warning("Leaving call without submitting prescription.");
            cleanup();
            navigate(`/${role}/appointments`, { replace: true });
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

  useEffect(()=>{
     if (role === "doctor") {
              fetchPrescriptions(appointment.userId);
        }
  },[])

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
          {role === "doctor" && (
            <Tooltip title={showPrescription ? "Hide prescription" : "Show prescription"}>
              <Button 
                icon={<SnippetsOutlined />} 
                shape="circle" 
                onClick={togglePrescription}
                className="flex items-center justify-center bg-gray-100 hover:bg-gray-200"
              />
            </Tooltip>
          )}
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
                style={{ transform: 'scaleX(-1)' }}
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
              style={{ transform: 'scaleX(-1)' }}
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

      {/* Prescription Modal */}
      {role === "doctor" && (
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <MedicineBoxOutlined className="text-blue-600" />
              <span>Prescription Management</span>
            </div>
          }
          open={showPrescription}
          onCancel={togglePrescription}
          footer={null}
          width={1200}
          style={{ top: 20 }}
          zIndex={1000}
          styles={{
            body: {
              maxHeight: '70vh',
              overflowY: 'auto',
              padding: '16px'
            }
          }}
        >
          {/* Patient Information Card */}
          <Card className="mb-4" style={{ backgroundColor: '#f8fafc' }}>
            <div className="flex items-start space-x-4">

              <img
                  src={patient?.profile?patient.profile : 'https://myhealth-app-storage.s3.ap-south-1.amazonaws.com/users/profile-images/avatar.png'}
                  alt="Patient"
                  className="w-16 h-16 rounded-full object-cover"
                />
             
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {patient?.fullName || 'Patient Name'}
                  </h3>
                  <Badge 
                    count={prescriptions.length} 
                    showZero 
                    style={{ backgroundColor: '#52c41a' }}
                    title="Total Prescriptions"
                  />
                </div>
                
                <Descriptions size="small" column={2}>
                  <Descriptions.Item label="Age">
                    {patient?.dob?calculateAge(patient.dob) : 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Gender">
                    {patient?.gender || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Phone">
                    {patient?.phone || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {patient?.email || 'N/A'}
                  </Descriptions.Item>
                </Descriptions>

                {patient?.medicalTags && (
                  <div className="mt-3">
                    <div className="flex items-center mb-2">
                      <AlertOutlined className="text-orange-500 mr-2" />
                      <span className="font-medium text-gray-700">Medical Alerts:</span>
                    </div>
                    <Tag color="orange" className="text-sm px-3 py-1">
                      {patient.medicalTags}
                    </Tag>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Tabs defaultActiveKey="1">
            <Tabs.TabPane 
              tab={
                <span>
                  <PlusOutlined />
                  Add New Prescription
                </span>
              } 
              key="1"
            >
              <Form
                form={form}
                onFinish={handleAddPrescription}
                layout="vertical"
              >
                <Form.Item
                  name="medicalCondition"
                  label="Medical Condition"
                >
                  <Input.TextArea rows={2} placeholder="Describe the medical condition..." />
                </Form.Item>

                <Form.Item
                  name="medicationPeriod"
                  label="Medication Period"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter the medication period',
                    },
                    {
                      validator: (_, value) => {
                        if (!value) {
                          return Promise.reject(); // Handled by required rule
                        }
                        const numValue = parseFloat(value);
                        if (isNaN(numValue)) {
                          return Promise.reject('Medication period must be a number');
                        }
                        if (numValue <= 0) {
                          return Promise.reject('Medication period must be greater than 0');
                        }
                        if (numValue >= 8) {
                          return Promise.reject('Medication period must be less than 8');
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    type="number"
                    min={1}
                    max={7}
                    step={1} 
                    placeholder="Enter medication period (1-7)"
                  />
                </Form.Item>

                <Form.List name="medications">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <Card key={key} size="small" className="mb-3" style={{ backgroundColor: '#fafafa' }}>
                          <div className="grid grid-cols-12 gap-3 items-end">
                            <div className="col-span-3">
                              <Form.Item
                                {...restField}
                                name={[name, 'name']}
                                label="Medication"
                                rules={[{ required: true, message: 'Required' }]}
                                className="mb-0"
                              >
                                <Input placeholder="Medicine name" />
                              </Form.Item>
                            </div>
                            <div className="col-span-2">
                              <Form.Item
                                {...restField}
                                name={[name, 'dosage']}
                                label="Dosage"
                                rules={[{ required: true, message: 'Required' }]}
                                className="mb-0"
                              >
                                <Input placeholder="e.g., 500mg" />
                              </Form.Item>
                            </div>
                            <div className="col-span-2">
                              <Form.Item
                                {...restField}
                                name={[name, 'frequency']}
                                label="Frequency"
                                rules={[{ required: true, message: 'Required' }]}
                                className="mb-0"
                              >
                                <Input placeholder="e.g., 2x daily" />
                              </Form.Item>
                            </div>
                            <div className="col-span-2">
                              <Form.Item
                                {...restField}
                                name={[name, 'duration']}
                                label="Duration"
                                rules={[{ required: true, message: 'Required' }]}
                                className="mb-0"
                              >
                                <Input placeholder="e.g., 7 days" />
                              </Form.Item>
                            </div>
                            <div className="col-span-2">
                              <Form.Item
                                {...restField}
                                name={[name, 'instructions']}
                                label="Instructions"
                                className="mb-0"
                              >
                                <Input placeholder="Optional notes" />
                              </Form.Item>
                            </div>
                            <div className="col-span-1">
                              <Button
                                danger
                                onClick={() => remove(name)}
                                icon={<MinusCircleOutlined />}
                                size="small"
                              />
                            </div>
                          </div>
                        </Card>
                      ))}

                      <Form.Item>
                        <Button
                          type="dashed"
                          onClick={() => add()}
                          block
                          icon={<PlusOutlined />}
                          size="large"
                        >
                          Add Medication
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
                <Form.Item
                  name="notes"
                  label="Additional Notes & Instructions"
                >
                  <Input.TextArea rows={4} placeholder="Additional notes, follow-up instructions, warnings..." />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" block size="large">
                    Save Prescription
                  </Button>
                </Form.Item>
              </Form>
            </Tabs.TabPane>
            
            <Tabs.TabPane 
              tab={
                <span>
                  <HistoryOutlined />
                   Medical History ({prescriptions.length})
                </span>
              } 
              key="2"
            >
              {prescriptions.length === 0 ? (
                <div className="text-center py-0">
                  <MedicineBoxOutlined className="text-4xl text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">No previous prescriptions found</p>
                  <p className="text-gray-400 text-sm">This patient's medical history will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Timeline mode="left">
                    {prescriptions
                      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                      .map((prescription, index) => (
                        <Timeline.Item
                          key={prescription._id || index}
                          dot={<MedicineBoxOutlined className="text-blue-600" />}
                          label={
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-700">
                                {prescription.createdAt 
                                  ? new Date(prescription.createdAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })
                                  : 'Date unknown'
                                }
                              </div>
                              <div className="text-xs text-gray-500">
                                {prescription.createdAt 
                                  ? new Date(prescription.createdAt).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })
                                  : ''
                                }
                              </div>
                            </div>
                          }
                        >
                          <Card 
                            className="ml-4"
                            size="small"
                            style={{ 
                              borderLeft: '4px solid #1890ff',
                              backgroundColor: index === 0 ? '#f6ffed' : '#ffffff'
                            }}
                          >
                            {prescription.medicalCondition && (
                              <div className="mb-3">
                                <Tag color="blue" className="mb-2">Medical Condition</Tag>
                                <p className="text-gray-700 text-sm">{prescription.medicalCondition}</p>
                              </div>
                            )}
                            {prescription.medicationPeriod && (
                              <div className="mb-3">
                                <Tag color="red" className="mb-2">Medication Period</Tag>
                                <p className="text-gray-700 text-sm">{prescription.medicationPeriod}Days</p>
                              </div>
                            )}
                            
                            <div className="mb-3">
                              <div className="flex items-center mb-2">
                                <MedicineBoxOutlined className="text-green-600 mr-2" />
                                <span className="font-medium text-gray-700">Medications Prescribed:</span>
                              </div>
                              <div className="space-y-2">
                                {prescription.medications.map((med, medIndex) => (
                                  <Card key={medIndex} size="small" className="bg-gray-50">
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <div className="font-semibold text-blue-700">{med.name}</div>
                                        <div className="text-sm text-gray-600">
                                          <span className="inline-block w-28">Dosage: {med.dosage}</span> 
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          <span className="inline-block w-28">Frequency: {med.frequency}</span>
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-sm text-gray-600">
                                          <span className="inline-block w-16">Duration:</span> {med.duration}
                                        </div>
                                        {med.instructions && (
                                          <div className="text-sm text-gray-600 mt-1">
                                            <span className="inline-block w-16">Notes:</span> 
                                            <span className="italic">{med.instructions}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            </div>

                            {prescription.notes && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-md border-l-4 border-yellow-400">
                                <div className="flex items-start">
                                  <AlertOutlined className="text-yellow-600 mr-2 mt-1" />
                                  <div>
                                    <div className="font-medium text-yellow-800 mb-1">Doctor's Notes:</div>
                                    <p className="text-yellow-700 text-sm">{prescription.notes}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Card>
                        </Timeline.Item>
                      ))}
                  </Timeline>
                </div>
              )}
            </Tabs.TabPane>
          </Tabs>
        </Modal>
      )}

      {/* Controls */}
      <div className="bg-white py-3 px-6 shadow-md border-t border-gray-200">
        <div className="flex justify-center space-x-6">
          <Tooltip title={isAudioMuted ? "Unmute" : "Mute"}>
            <button
              onClick={toggleAudio}
              className={`p-3 rounded-full flex items-center justify-center ${isAudioMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {isAudioMuted ? <AudioMutedOutlined className="text-lg" /> : <AudioOutlined className="text-lg" />}
            </button>
          </Tooltip>
          <Tooltip title={isVideoOff ? "Turn on video" : "Turn off video"}>
            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full flex items-center justify-center ${isVideoOff ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {isVideoOff ? <VideoCameraFilled className="text-lg" /> : <VideoCameraOutlined className="text-lg" />}
            </button>
          </Tooltip>
          <Tooltip title="End call">
            <button
              onClick={endCall}
              className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 flex items-center justify-center"
            >
              <PhoneOutlined className="text-lg" />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;