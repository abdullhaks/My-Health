import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getDoctorAppointments,cancelAppointment } from "../../api/doctor/doctorApi";
import { Popconfirm, message, Table, Select, DatePicker, Button, Pagination } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import moment from "moment";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { IDoctorData } from "../../interfaces/doctor";
import { ApiError } from "../../interfaces/error";

interface IAppointment {
  _id: string;
  userId: string;
  doctorId: string;
  slotId: string;
  start: string;
  date:string;
  end: string;
  duration: number;
  fee: number;
  appointmentStatus: "booked" | "cancelled" | "completed" | "pending";
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  stripeSessionId: string;
  userName: string;
  userEmail: string;
  doctorName: string;
  doctorCategory: string;
  createdAt: string;
  updatedAt: string;
  profile?:string;

}

interface Notification {
  userId: string;
  message: string;
  type: "appointment" | "payment" | "blog" | "add" | "newConnection" | "common" | "reportAnalysis";
  isRead: boolean;
  link?: string;
  mention?: string;
  createdAt: string;
}


const { Option } = Select;
const { RangePicker } = DatePicker;

const DoctorAppointments = () => {
  const [isCanceling, setIsCanceling] = useState(false);
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(5);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [filters, setFilters] = useState({
    appointmentStatus: "booked",
    dateRange: null as [moment.Moment, moment.Moment] | null,
  });
  const doctor = useSelector((state: IDoctorData) => state.doctor.doctor);
  const navigate = useNavigate();
  const socketRef = useRef<Socket | null>(null);


   const getAccessToken = async () => {
      try {
        const response = await axios.post(
          "http://localhost:3000/api/doctor/refreshToken",
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



     useEffect(() => {
        const setupSocket = async () => {
          if (!doctor?._id) return;
    
          let token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("userAccessToken="))
            ?.split("=")[1];
    
          if (!token) {
            token = await getAccessToken();
          }
    
          const socket = io(import.meta.env.VITE_REACT_APP_SOCKET_URL || "http://localhost:3000", {
            transports: ["websocket"],
            reconnection: true,
            auth: { token },
          });
    
          socketRef.current = socket;
    
          socket.on("connect", () => {
            console.log(`Socket connected for user ${doctor._id}`);
            socket.emit("join", doctor._id);
          });
    
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
              message.error("Failed to connect to notification server: " + err.message);
            }
          });
    
          socket.on("error", ({ message }) => {
            console.error("Socket error:", message);
            message.error(message);
          });
    
          return () => {
            socket.disconnect();
          };
        };
    
        setupSocket();
        return () => {
          socketRef.current?.disconnect();
        };
      }, [doctor?._id]);


  const fetchAppointments = async (page: number) => {
    setLoading(true);
    try {
      const response = await getDoctorAppointments(doctor._id, page, limit, {
        appointmentStatus: filters.appointmentStatus,
        startDate: filters.dateRange ? filters.dateRange[0].toISOString().split("T")[0] : undefined,
        endDate: filters.dateRange ? filters.dateRange[1].toISOString().split("T")[0] : undefined,
      });
      setAppointments(response.appointments || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      const errorMessage = (error as ApiError)?.response?.data?.message ?? "Failed fetching appointments. Please try again.";
  setErrorMessage(typeof errorMessage === "string" ? errorMessage : "Failed fetching appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doctor._id) fetchAppointments(currentPage);
  }, [doctor._id, currentPage, filters]);

  const handleFilterChange = (key: string, value: string | [moment.Moment, moment.Moment] | null) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

 const handleCancel = async (appointmentId: string) => {
     try {
       setIsCanceling(true);
       setErrorMessage("");
       const response = await cancelAppointment(appointmentId);
       if (response.status) {
         message.success(response.message);
 
         let doctorName: string = "";
         let userId: string = "";
         let date: string = "";
 
         const targetAppointment = appointments.find((appt) => appt._id === appointmentId);
         if (targetAppointment) {
           doctorName = targetAppointment.doctorName || "Patient";
           userId = targetAppointment.userId || "";
           date = targetAppointment.date || "";
         } else {
           console.warn("Appointment not found in state.");
         }
 
         setAppointments((prev) =>
           prev.map((appt) =>
             appt._id === appointmentId
               ? { ...appt, appointmentStatus: "cancelled", paymentStatus: "refunded" }
               : appt
           )
         );
 
         if (userId) {
           const notification: Notification = {
             userId: userId,
             message: `Your appointment with Dr.${doctorName} on ${new Date(date).toLocaleDateString("en-US", {
               weekday: "short",
               year: "numeric",
               month: "short",
               day: "numeric",
             })} has been cancelled due to unforeseen circumstances. Please reschedule at the next available slot.`,
             type: "appointment",
             isRead: false,
             link: "/user/appointments",
             mention: `Dr.${doctorName}`,
             createdAt: new Date().toISOString(),
           };
 
           socketRef.current?.emit("sendNotification", notification);
         } else {
           console.warn("Missing doctorId for notification.");
         }
       } else {
         message.error(response.message);
       }
     } catch (error) {
       console.error("Error cancelling appointment:", error);
       const errorMessage = (error as ApiError)?.response?.data?.message ?? "Failed to cancel appointment. Please try again.";
  setErrorMessage(typeof errorMessage === "string" ? errorMessage : "Failed to cancel appointment. Please try again.");
     } finally {
       setIsCanceling(false);
     }
   };



  const handleJoin = (appointmentId: string, appointment: IAppointment) => {
    navigate(`/doctor/video-call/${appointmentId}`, { state: { appointment } });
  };

  const isJoinable = (start: string, end: string) => {
    // const now = new Date().getTime();
    // const startTime = new Date(start).getTime();
    // const endTime = new Date(end).getTime();
    // const buffer = 5 * 60 * 1000; // 5-minute buffer
    // return now >= startTime - buffer && now <= endTime + buffer;

    return true;
  };

  const columns = [
    {
      title: "User Name",
      dataIndex: "userName",
      key: "userName",
      render: (text: string, record: IAppointment) => (
        <div className="flex gap-1 items-center">
          <img
                  src={record?.profile || 'https://myhealth-app-storage.s3.ap-south-1.amazonaws.com/users/profile-images/avatar.png'}
                  alt="Doctor"
                  className="w-10 h-10 rounded-full object-cover"
                />
          <p>Dr. {text} ({record.doctorCategory})</p>
        </div>
        ),
    },
    {
      title: "Email",
      dataIndex: "userEmail",
      key: "userEmail",
    },
    {
      title: "Date & Time",
      key: "dateTime",
      render: (_: IAppointment, record: IAppointment) =>
        `${moment(record.start).format("MMM DD, YYYY h:mm A")} - ${moment(record.end).format("h:mm A")}`,
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      render: (duration: number) => `${duration} minutes`,
    },
    {
      title: "Fee",
      dataIndex: "fee",
      key: "fee",
      render: (fee: number) => `₹${fee}`,
    },
    {
      title: "Status",
      dataIndex: "appointmentStatus",
      key: "appointmentStatus",
      render: (status: string) => status.charAt(0).toUpperCase() + status.slice(1),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: IAppointment, record: IAppointment) => (
        <div className="flex gap-2">
          {record.appointmentStatus === "booked" && (
            <button
              onClick={() => handleJoin(record._id, record)}
              disabled={!isJoinable(record.start, record.end)}
              className={`px-4 py-1 rounded-lg text-white font-medium transition-colors ${
                isJoinable(record.start, record.end)
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Join
            </button>
          )}
          {record.appointmentStatus === "booked" && (
            <Popconfirm
              title="Cancel Appointment"
              description="Are you sure to cancel this appointment?"
              onConfirm={() => handleCancel(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <button
                disabled={isCanceling || record.appointmentStatus !== "booked"}
                className={`px-4 py-1 rounded-lg text-white font-medium transition-colors ${
                  isCanceling ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Cancel
              </button>
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">My Appointments</h2>

        {/* Filters */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <FilterOutlined className="text-gray-600" />
            <Select
              placeholder="Filter by Status"
              style={{ width: 200 }}
              value={filters.appointmentStatus}
              onChange={(value) => handleFilterChange("appointmentStatus", value)}
              allowClear
            >
              <Option value="booked">Booked</Option>
              <Option value="cancelled">Cancelled</Option>
              <Option value="completed">Completed</Option>
              
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <FilterOutlined className="text-gray-600" />
            <RangePicker
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  handleFilterChange("dateRange", [moment(dates[0].toDate()), moment(dates[1].toDate())]);
                } else {
                  handleFilterChange("dateRange", null);
                }
              }}
              format="YYYY-MM-DD"
            />
          </div>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => fetchAppointments(currentPage)}
          >
            Apply Filters
          </Button>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">{errorMessage}</div>
        )}

        {/* Table */}
        <Table
          dataSource={appointments}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={false}
          className="bg-white rounded-lg shadow-sm"
        />

        {/* Pagination */}
        <div className="mt-6 flex justify-end">
          <Pagination
            current={currentPage}
            total={totalPages * limit}
            pageSize={limit}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointments;