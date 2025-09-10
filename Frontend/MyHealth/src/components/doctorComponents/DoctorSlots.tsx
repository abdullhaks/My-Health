import { useState, useEffect, useRef } from "react";
import {
  FaTrash,
  FaEdit,
  FaSave,
  FaTimes,
  FaCalendarAlt,
  FaClock,
  FaRupeeSign,
  FaPlus,
  FaCheckCircle,
  FaTimesCircle,
  FaBan,
} from "react-icons/fa";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useSelector } from "react-redux";
import { message, Popconfirm } from "antd";
import { io, Socket } from "socket.io-client";

import {
  getSessions,
  addSession,
  updateSession,
  deleteSession,
  getBookedSlots,
  makeSessionUnavailable,
  getUnavailableSessions,
  makeSessionAvailable,
  makeDayUnavailable,
  getUnavailableDays,
  makeDayAvailable,
} from "../../api/doctor/doctorApi";
import axios from "axios";
import {sessionData as Session}  from "../../interfaces/session"
import { IDoctorData } from "../../interfaces/doctor";


interface Appointment {
  _id: string;
  slotId: string;
  status: "booked" | "cancelled" | "completed" | "pending" | "confirmed";
}

interface AppointmentSlot {
  id: string;
  start: Date;
  end: Date;
  duration: number;
  fee: number;
  status: "available" | "unavailable" | "pending" | "confirmed" | "completed" | "cancelled" | "booked";
  sessionId: string;
  appointmentId?: string;
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

interface DaySessionSlots {
  session: Session;
  slots: AppointmentSlot[];
}

const weekdays = [
  { name: "Sunday", value: 0 },
  { name: "Monday", value: 1 },
  { name: "Tuesday", value: 2 },
  { name: "Wednesday", value: 3 },
  { name: "Thursday", value: 4 },
  { name: "Friday", value: 5 },
  { name: "Saturday", value: 6 },
];

const defaultSession: Session = {
  dayOfWeek: 1,
  startTime: "10:00",
  endTime: "12:00",
  duration: 20,
  fee: 100,
};

const DoctorSlots = () => {
  const doctor = useSelector((state: IDoctorData) => state.doctor.doctor);
  const doctorId = doctor._id;
  const [sessions, setSessions] = useState<Session[]>([]);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newSession, setNewSession] = useState<Session>(defaultSession);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableDaySessionSlots, setAvailableDaySessionSlots] = useState<DaySessionSlots[]>([]);
  const [unavailableDaySessions, setUnavailableDaySessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string>("");
  const socketRef = useRef<Socket | null>(null);
  const [unAvailableDays, setUnAvailableDays] = useState<string[]>([]);
  const [unAvailableSessions, setUnAvailableSessions] = useState<{ day: string; sessionId: string }[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const minDate = new Date();

  const notify = async (cancels: {
        appointmentId: string;
        userId: string;
        doctorName: string;
        date: string;
        start: Date;
        end: Date;
      }[]) => {
    if (!cancels.length) {
      return;
    }

    cancels.forEach(
      (item: {
        appointmentId: string;
        userId: string;
        doctorName: string;
        date: string;
        start: Date;
        end: Date;
      }) => {
        const notification: Notification = {
          userId: item.userId,
          message: `Your appointment with Dr.${
            item.doctorName
          } on ${new Date(item.date).toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })} has been cancelled due to session update. Please reschedule at the next available slot.`,
          type: "appointment",
          isRead: false,
          link: "/user/appointments",
          mention: `Dr.${item.doctorName}`,
          createdAt: new Date().toISOString(),
        };
        socketRef.current?.emit("sendNotification", notification);
      }
    );
  };

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
      const socket = io(
        import.meta.env.VITE_REACT_APP_SOCKET_URL || "http://localhost:3000",
        {
          transports: ["websocket"],
          reconnection: true,
          auth: { token },
        }
      );
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
          message.error(
            "Failed to connect to notification server: " + err.message
          );
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

  useEffect(() => {
    const fetchData = async () => {
      if (!doctorId) return;
      fetchSessions();

      const yyyy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const dd = String(selectedDate.getDate()).padStart(2, "0");
      const localDate = `${yyyy}-${mm}-${dd}`;

      const unAvailableDays = await getUnavailableDays(doctorId);
      const unAvailableSessions = await getUnavailableSessions(doctorId);
      const BookedSlots = await getBookedSlots(doctorId, localDate);
      console.log("BookedSlots are/......", BookedSlots);
      console.log("unAvailableDays are/......", unAvailableDays);
      setBookedSlots(BookedSlots);

      setUnAvailableDays(unAvailableDays);
      setUnAvailableSessions(unAvailableSessions);
    };
    fetchData();
  }, [doctorId, selectedDate]);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const response = await getSessions(doctorId);
      setSessions(response || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      message.error("Failed to load sessions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const generateSlotsForDate = () => {
      const yyyy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const dd = String(selectedDate.getDate()).padStart(2, "0");
      const localDateStr = `${yyyy}-${mm}-${dd}`;

      const isDayUnavailable = unAvailableDays.includes(localDateStr);

      console.log("Generating slots for date:", localDateStr, "Day unavailable:", isDayUnavailable);
      if (isDayUnavailable) {
        setAvailableDaySessionSlots([]);
        setUnavailableDaySessions([]);
        return;
      }

      const dayOfWeek = selectedDate.getDay();
      const allDaySessions = sessions.filter((s) => s.dayOfWeek === dayOfWeek);
      const unavailableIds = unAvailableSessions
        .filter((us) => {
          // Assuming us.day is an ISO string; normalize to local date string for comparison
          const usDate = new Date(us.day);
          const usYyyy = usDate.getFullYear();
          const usMm = String(usDate.getMonth() + 1).padStart(2, "0");
          const usDd = String(usDate.getDate()).padStart(2, "0");
          return `${usYyyy}-${usMm}-${usDd}` === localDateStr;
        })
        .map((us) => us.sessionId);
      const availableSessions = allDaySessions.filter(
        (s) => !unavailableIds.includes(s._id || "")
      );
      const unavailableSessions = allDaySessions.filter((s) =>
        unavailableIds.includes(s._id || "")
      );
      setUnavailableDaySessions(unavailableSessions);

      const generated: DaySessionSlots[] = [];

      availableSessions.forEach((session) => {
        const [startHours, startMinutes] = session.startTime
          .split(":")
          .map(Number);
        const [endHours, endMinutes] = session.endTime.split(":").map(Number);

        const slotStart = new Date(selectedDate);
        slotStart.setHours(startHours, startMinutes, 0, 0);

        const slotEnd = new Date(selectedDate);
        slotEnd.setHours(endHours, endMinutes, 0, 0);

        const slots: AppointmentSlot[] = [];
        let currentSlotStart = new Date(slotStart);

        while (currentSlotStart < slotEnd) {
          const currentSlotEnd = new Date(currentSlotStart);
          currentSlotEnd.setMinutes(
            currentSlotEnd.getMinutes() + session.duration
          );

          if (currentSlotEnd > slotEnd) break;

          const slotId = currentSlotStart.getTime().toString();

          const isBooked = bookedSlots.includes(slotId);

          let status: AppointmentSlot["status"] = "available";

          if (isBooked) {
            status = "booked";
          }

          slots.push({
            id: slotId,
            start: new Date(currentSlotStart),
            end: new Date(currentSlotEnd),
            duration: session.duration,
            fee: session.fee,
            status,
            sessionId: session._id || "",
          });

          currentSlotStart = new Date(currentSlotEnd);
        }

        if (slots.length > 0) {
          generated.push({ session, slots });
        }
      });

      setAvailableDaySessionSlots(generated);
    };

    generateSlotsForDate();
  }, [sessions, selectedDate, bookedSlots, unAvailableDays, unAvailableSessions]);

  const parseTimeToMinutes = (time: string): number => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const validateSession = (sess: Session): string => {
    const startMin = parseTimeToMinutes(sess.startTime);
    const endMin = parseTimeToMinutes(sess.endTime);
    if (startMin >= endMin) {
      return "End time must be after start time.";
    }

    const sameDaySessions = sessions.filter(
      (s) => s.dayOfWeek === sess.dayOfWeek && s._id !== sess._id
    );
    for (const other of sameDaySessions) {
      const otherStart = parseTimeToMinutes(other.startTime);
      const otherEnd = parseTimeToMinutes(other.endTime);
      if (!(endMin <= otherStart || startMin >= otherEnd)) {
        return `This session overlaps with another on ${
          weekdays.find((d) => d.value === sess.dayOfWeek)?.name
        }.`;
      }
    }

    return "";
  };

  const handleAddSession = async () => {
    const error = validateSession(newSession);
    if (error) {
      setValidationError(error);
      return;
    }

    try {
      const sessionToAdd = { ...newSession, doctorId };
      const added = await addSession(sessionToAdd);
      setIsAdding(false);
      setSessions([...sessions, added]);
      setNewSession(defaultSession);
      setValidationError("");
      message.success("Session added successfully");
    } catch (error) {
      console.error("Error adding session:", error);
      message.error("Failed to add session");
    }
  };

  const startEditing = (session: Session) => {
    setEditingSession({ ...session });
  };

  const handleEditChange = (field: keyof Session, value: string | number) => {
    if (editingSession) {
      setEditingSession({
        ...editingSession,
        [field]:
          typeof value === "string" &&
          ["duration", "fee", "dayOfWeek"].includes(field)
            ? Number(value)
            : value,
      });
    }
  };

  const cancelEdit = () => {
    setEditingSession(null);
    setValidationError("");
  };

  const saveEdit = async () => {
    if (!editingSession || !editingSession._id) return;

    const original = sessions.find((s) => s._id === editingSession._id);
    if (!original) return;

    const hasChanges =
      original.dayOfWeek !== editingSession.dayOfWeek ||
      original.startTime !== editingSession.startTime ||
      original.endTime !== editingSession.endTime ||
      original.duration !== editingSession.duration ||
      original.fee !== editingSession.fee;

    if (!hasChanges) {
      message.info("No changes made");
      setEditingSession(null);
      setValidationError("");
      return;
    }

    const error = validateSession(editingSession);
    if (error) {
      setValidationError(error);
      return;
    }

    try {
      const response = await updateSession(editingSession._id, editingSession);
      const updatedSession = response.updatedSession;
      const cancelledAppointments = response.cancelledAppointments;

      setSessions(
        sessions.map((s) => (s._id === updatedSession._id ? updatedSession : s))
      );
      setEditingSession(null);
      setValidationError("");
      message.success("Session updated successfully");
      notify(cancelledAppointments);
      fetchSessions();
    } catch (error) {
      console.error("Error updating session:", error);
      message.error("Failed to update session");
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      const deleting = await deleteSession(id);
      notify(deleting);

      setSessions(sessions.filter((s) => s._id !== id));
      message.success("Session deleted successfully");
    } catch (error) {
      console.error("Error deleting session:", error);
      message.error("Failed to delete session");
    }
  };

  const handleSessionAction = async (
    sessionSlots: DaySessionSlots | Session,
    date: Date,
    action: "unavailable" | "available"
  ) => {
    const session = "session" in sessionSlots ? sessionSlots.session : sessionSlots;
    try {
      if (action === "unavailable") {
        const updatedUnavailableSessions = await makeSessionUnavailable(
          doctorId,
          date,
          session._id || ""
        );
        notify(updatedUnavailableSessions.cancelledAppoitments);
        message.success("Session made unavailable for this date");
      } else {
        await makeSessionAvailable(
          doctorId,
          date,
          session._id || ''
        );
        message.success("Session made available for this date");
      };
      const getUpdatedUnAvailableSessions = await getUnavailableSessions(doctorId)
      setUnAvailableSessions(getUpdatedUnAvailableSessions);
    } catch (error) {
      console.error("Error performing session action:", error);
      message.error("Failed to perform session action");
    }
  };

  const handleDayAction = async (action: "unavailable" | "available", date: Date) => {
    try {
      if (action === "unavailable") {
        const updation = await makeDayUnavailable(doctorId, date);
        notify(updation.cancelledAppoitments);
        message.success("Day made unavailable");
      } else {
        await makeDayAvailable(doctorId, date);
        message.success("Day made available");
      }
      const updatedUnavailableDays = await getUnavailableDays(doctorId);
      setUnAvailableDays(updatedUnavailableDays);
    } catch (error) {
      console.error("Error performing day action:", error);
      message.error("Failed to perform day action");
    }
  };

  const formatTime12Hour = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const adjustedHours = hours % 12 || 12;
    return `${adjustedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const formatSlotTime12Hour = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatStatus = (status: AppointmentSlot["status"]) => {
    return status
      ? status.charAt(0).toUpperCase() + status.slice(1)
      : "Unknown";
  };

  const isPastSlot = (start: Date) => start < new Date();

  const isDayUnavailable = unAvailableDays.some(
    (ud) => {
      const yyyy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const dd = String(selectedDate.getDate()).padStart(2, "0");
      return ud === `${yyyy}-${mm}-${dd}`;
    }
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Doctor Slot Management
          </h1>
          <p className="text-gray-600">
            Manage your consultation sessions and appointments
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">
                    Weekly Sessions
                  </h2>
                  <p className="text-gray-600">
                    Configure your consultation schedule
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsAdding(true);
                    setValidationError("");
                  }}
                  className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto justify-center"
                >
                  <FaPlus className="group-hover:rotate-90 transition-transform duration-300" />
                  Add Session
                </button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {isAdding && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200 shadow-sm">
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FaPlus className="text-blue-600" />
                        New Session
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Day
                          </label>
                          <select
                            value={newSession.dayOfWeek}
                            onChange={(e) =>
                              setNewSession({
                                ...newSession,
                                dayOfWeek: Number(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          >
                            {weekdays.map((day) => (
                              <option key={day.value} value={day.value}>
                                {day.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={newSession.startTime}
                            onChange={(e) =>
                              setNewSession({
                                ...newSession,
                                startTime: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={newSession.endTime}
                            onChange={(e) =>
                              setNewSession({
                                ...newSession,
                                endTime: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Duration (mins)
                          </label>
                          <select
                            value={newSession.duration}
                            onChange={(e) =>
                              setNewSession({
                                ...newSession,
                                duration: Number(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          >
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                            <option value={30}>30</option>
                            <option value={45}>45</option>
                            <option value={60}>60</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fee (₹)
                          </label>
                          <input
                            type="number"
                            value={newSession.fee}
                            onChange={(e) =>
                              setNewSession({
                                ...newSession,
                                fee: Number(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>
                      </div>
                      {validationError && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                          {validationError}
                        </div>
                      )}
                      <div className="flex justify-end gap-3 mt-6">
                        <button
                          onClick={() => setIsAdding(false)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
                        >
                          <FaTimes />
                          Cancel
                        </button>
                        <button
                          onClick={handleAddSession}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md"
                        >
                          <FaSave />
                          Save Session
                        </button>
                      </div>
                    </div>
                  )}

                  {sessions.map((session) => (
                    <div
                      key={session._id}
                      className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
                    >
                      {editingSession?._id === session._id ? (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Day
                              </label>
                              <select
                                value={
                                  editingSession ? editingSession.dayOfWeek : ""
                                }
                                onChange={(e) =>
                                  handleEditChange("dayOfWeek", e.target.value)
                                }
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              >
                                {weekdays.map((day) => (
                                  <option key={day.value} value={day.value}>
                                    {day.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Time
                              </label>
                              <input
                                type="time"
                                value={
                                  editingSession ? editingSession.startTime : ""
                                }
                                onChange={(e) =>
                                  handleEditChange("startTime", e.target.value)
                                }
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Time
                              </label>
                              <input
                                type="time"
                                value={
                                  editingSession ? editingSession.endTime : ""
                                }
                                onChange={(e) =>
                                  handleEditChange("endTime", e.target.value)
                                }
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Duration (mins)
                              </label>
                              <select
                                value={
                                  editingSession ? editingSession.duration : ""
                                }
                                onChange={(e) =>
                                  handleEditChange("duration", e.target.value)
                                }
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              >
                                <option value={10}>10</option>
                                <option value={15}>15</option>
                                <option value={20}>20</option>
                                <option value={30}>30</option>
                                <option value={45}>45</option>
                                <option value={60}>60</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fee (₹)
                              </label>
                              <input
                                type="number"
                                value={editingSession ? editingSession.fee : ""}
                                onChange={(e) =>
                                  handleEditChange("fee", e.target.value)
                                }
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              />
                            </div>
                          </div>
                          {validationError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                              {validationError}
                            </div>
                          )}
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={cancelEdit}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
                            >
                              <FaTimes />
                              Cancel
                            </button>
                            <button
                              onClick={saveEdit}
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md"
                            >
                              <FaSave />
                              Save Changes
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                            <div className="space-y-1">
                              <label className="text-sm font-medium text-gray-500">
                                Day
                              </label>
                              <p className="text-gray-800 font-medium">
                                {
                                  weekdays.find(
                                    (d) => d.value === session.dayOfWeek
                                  )?.name
                                }
                              </p>
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                <FaClock className="text-xs" />
                                Start Time
                              </label>
                              <p className="text-gray-800 font-medium">
                                {formatTime12Hour(session.startTime)}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                <FaClock className="text-xs" />
                                End Time
                              </label>
                              <p className="text-gray-800 font-medium">
                                {formatTime12Hour(session.endTime)}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-medium text-gray-500">
                                Duration
                              </label>
                              <p className="text-gray-800 font-medium">
                                {session.duration} mins
                              </p>
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                <FaRupeeSign className="text-xs" />
                                Fee
                              </label>
                              <p className="text-gray-800 font-medium">
                                ₹{session.fee}
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => startEditing(session)}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              title="Edit Session"
                            >
                              <FaEdit />
                            </button>
                            <Popconfirm
                              title="Remove Session"
                              description="Are you sure you want to delete this session? All booked appointments in this session will be canceled."
                              onConfirm={() => handleDeleteSession(session._id!)}
                              okText="Yes"
                              cancelText="No"
                            >
                              <button
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                                title="Delete Session"
                              >
                                <FaTrash />
                              </button>
                            </Popconfirm>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  {sessions.length === 0 && !isAdding && (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                        <FaCalendarAlt className="text-3xl text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        No sessions configured
                      </h3>
                      <p className="text-gray-600">
                        Add your first consultation session to get started
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaCalendarAlt className="text-blue-600" />
                Appointment Calendar
              </h2>
              <Calendar
                onChange={(value) => {
                  if (value) {
                    const normalizedDate = new Date(
                      (value as Date).getFullYear(),
                      (value as Date).getMonth(),
                      (value as Date).getDate()
                    );
                    setSelectedDate(normalizedDate);
                  }
                }}
                value={selectedDate}
                minDate={minDate}
                tileClassName={({ date }) =>
                  sessions.some((s) => s.dayOfWeek === date.getDay())
                    ? "bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 text-blue-800 font-medium"
                    : ""
                }
                className="w-full rounded-lg"
              />
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex flex-col gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FaClock className="text-purple-600" />
                    Daily Schedule
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {isDayUnavailable ? (
                    <button
                      onClick={() => handleDayAction("available", selectedDate)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-md text-sm"
                    >
                      <FaCheckCircle className="text-xs" />
                      Open Day
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDayAction("unavailable", selectedDate)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-md text-sm cursor-pointer"
                    >
                      <FaBan className="text-xs" />
                      Block Day
                    </button>
                  )}
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-3 border-purple-500 border-t-transparent"></div>
                </div>
              ) : isDayUnavailable ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <FaBan className="text-2xl text-gray-500" />
                  </div>
                  <p className="text-gray-600">
                    This day is marked as unavailable. Click "Open Day" to make it available.
                  </p>
                </div>
              ) : availableDaySessionSlots.length === 0 && unavailableDaySessions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <FaClock className="text-2xl text-gray-500" />
                  </div>
                  <p className="text-gray-600">
                    No sessions configured for this day
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {availableDaySessionSlots.map((ss, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-200"
                    >
                      <div className="flex flex-col gap-3 mb-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-800">
                            Session-{index + 1}
                          </h4>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSessionAction(ss, selectedDate, "unavailable")}
                              className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-all duration-200 text-xs font-medium"
                            >
                              <FaBan className="text-xs" />
                              Block Session
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <FaClock className="text-xs" />
                            {formatTime12Hour(ss.session.startTime)} -{" "}
                            {formatTime12Hour(ss.session.endTime)}
                          </span>
                          <span>Duration: {ss.session.duration} mins</span>
                          <span className="flex items-center gap-1">
                            <FaRupeeSign className="text-xs" />₹{ss.session.fee}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {ss.slots.map((slot) => {
                          const isPast = isPastSlot(slot.start);
                          let statusConfig = {
                            bgClass: "",
                            textClass: "",
                            borderClass: "",
                            icon: null as React.ReactNode,
                          };

                          switch (slot.status) {
                            case "available":
                            case "booked":
                              statusConfig = {
                                bgClass:
                                  "bg-gradient-to-r from-green-50 to-emerald-50",
                                textClass: "text-green-800",
                                borderClass: "border-green-200",
                                icon: (
                                  <FaCheckCircle className="text-green-600" />
                                ),
                              };
                              break;
                            case "unavailable":
                              statusConfig = {
                                bgClass:
                                  "bg-gradient-to-r from-gray-50 to-gray-100",
                                textClass: "text-gray-700",
                                borderClass: "border-gray-300",
                                icon: <FaBan className="text-gray-500" />,
                              };
                              break;
                            case "completed":
                              statusConfig = {
                                bgClass:
                                  "bg-gradient-to-r from-purple-50 to-violet-50",
                                textClass: "text-purple-800",
                                borderClass: "border-purple-200",
                                icon: (
                                  <FaCheckCircle className="text-purple-600" />
                                ),
                              };
                              break;
                            case "cancelled":
                              statusConfig = {
                                bgClass:
                                  "bg-gradient-to-r from-red-50 to-pink-50",
                                textClass: "text-red-800",
                                borderClass: "border-red-200",
                                icon: (
                                  <FaTimesCircle className="text-red-600" />
                                ),
                              };
                              break;
                            default:
                              statusConfig = {
                                bgClass: "bg-gray-50",
                                textClass: "text-gray-600",
                                borderClass: "border-gray-200",
                                icon: <FaBan className="text-gray-500" />,
                              };
                          }

                          return (
                            <div
                              key={slot.id}
                              className={`border ${statusConfig.borderClass} ${
                                statusConfig.bgClass
                              } p-3 rounded-lg transition-all duration-200 hover:shadow-md ${
                                slot.status === "cancelled" ? "opacity-75" : ""
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div className="flex items-center gap-3">
                                  {statusConfig.icon}
                                  <div>
                                    <div className="font-medium text-gray-800">
                                      {formatSlotTime12Hour(slot.start)} -{" "}
                                      {formatSlotTime12Hour(slot.end)}
                                    </div>
                                    <div className="text-xs text-gray-600 flex items-center gap-2 mt-1">
                                      <span>{slot.duration} mins</span>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        <FaRupeeSign className="text-xs" />
                                        {slot.fee}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium bg-white/80 ${statusConfig.textClass} border ${statusConfig.borderClass}`}
                                  >
                                    {formatStatus(slot.status)}
                                  </span>
                                  {!isPast}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {unavailableDaySessions.length > 0 && (
                    <div className="mt-6 border-t pt-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">
                        Unavailable Sessions
                      </h4>
                      <div className="space-y-4">
                        {unavailableDaySessions.map((session, index) => (
                          <div
                            key={session._id}
                            className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-200"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h5 className="font-semibold text-gray-800">
                                  Session {index + 1}
                                </h5>
                                <p className="text-sm text-red-600 font-medium">
                                  Unavailable
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  handleSessionAction(session, selectedDate, "available")
                                }
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-md text-sm"
                              >
                                <FaCheckCircle className="text-xs" />
                                Open Session
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <FaClock className="text-xs" />
                                {formatTime12Hour(session.startTime)} -{" "}
                                {formatTime12Hour(session.endTime)}
                              </span>
                              <span>Duration: {session.duration} mins</span>
                              <span className="flex items-center gap-1">
                                <FaRupeeSign className="text-xs" />
                                ₹{session.fee}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSlots;