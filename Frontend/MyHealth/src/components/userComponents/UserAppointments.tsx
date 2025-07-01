import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserAppointments, cancelAppointment } from "../../api/user/userApi";
import { useNavigate } from "react-router-dom";
import { Popconfirm, message } from "antd";
import { updateUser } from "../../redux/slices/userSlices";

interface IAppointment {
  _id: string;
  userId: string;
  doctorId: string;
  slotId: string;
  start: string;
  end: string;
  duration: number;
  fee: number;
  appointmentStatus: "booked" | "cancelled" | "completed";
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  stripeSessionId: string;
  userName: string;
  userEmail: string;
  doctorName: string;
  doctorCategory: string;
  createdAt: string;
  updatedAt: string;
}

const UserAppointments = () => {
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const user = useSelector((state: any) => state.user.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsFetching(true);
        setErrorMessage("");
        const response = await getUserAppointments(user._id, page, limit);
        setAppointments(response.appointments || []);
        setTotalPages(response.totalPages || 1);
      } catch (error: any) {
        console.error("Error fetching appointments:", error);
        setErrorMessage(
          error.response?.data?.message || "Failed to load appointments. Please try again."
        );
      } finally {
        setIsFetching(false);
      }
    };
    if (user._id) fetchAppointments();
  }, [user._id, page]);

  const handleCancel = async (appointmentId: string) => {
    try {
      setIsCanceling(true);
      setErrorMessage("");
      const response = await cancelAppointment(appointmentId);
      if (response.status) {
        dispatch(updateUser(response.updatedUser));
        message.success(response.message);
        setAppointments((prev) =>
          prev.map((appt) =>
            appt._id === appointmentId
              ? { ...appt, appointmentStatus: "cancelled", paymentStatus: "refunded" }
              : appt
          )
        );
      } else {
        message.error(response.message);
      }
    } catch (error: any) {
      console.error("Error cancelling appointment:", error);
      setErrorMessage(
        error.response?.data?.message || "Failed to cancel appointment. Please try again."
      );
    } finally {
      setIsCanceling(false);
    }
  };

  const handleJoin = (appointmentId: string) => {
    navigate(`/user/video-call/${appointmentId}`);
  };

  const isJoinable = (start: string, end: string) => {
    // const now = new Date().getTime();
    // const startTime = new Date(start).getTime();
    // const endTime = new Date(end).getTime();
    // const buffer = 5 * 60 * 1000; // 5-minute buffer before/after
    // return now >= startTime - buffer && now <= endTime + buffer;
    return true
  };

  const formatDateTime = (date: string) =>
    new Date(date).toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Appointments</h2>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">{errorMessage}</div>
        )}
        {isFetching ? (
          <div className="text-center text-gray-500 py-4">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="text-center text-gray-500 py-4">No appointments found.</div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appt) => (
              <div
                key={appt._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Dr. {appt.doctorName} ({appt.doctorCategory})
                  </h3>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Date & Time:</span>{" "}
                    {formatDateTime(appt.start)} - {formatDateTime(appt.end)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Duration:</span> {appt.duration} minutes
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Fee:</span> ₹{appt.fee}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Status:</span> {appt.appointmentStatus}
                  </p>
                </div>
                <div className="flex gap-2">
                  {appt.appointmentStatus === "booked" && (
                    <button
                      onClick={() => handleJoin(appt._id)}
                      disabled={!isJoinable(appt.start, appt.end)}
                      className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                        isJoinable(appt.start, appt.end)
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Join
                    </button>
                  )}
                  <Popconfirm
                    title="Cancel Appointment"
                    description="Are you sure to cancel this appointment?"
                    onConfirm={() => handleCancel(appt._id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    {appt.appointmentStatus === "booked" && (
                      <button
                        disabled={isCanceling || appt.appointmentStatus !== "booked"}
                        className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                          isCanceling ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                        }`}
                      >
                        Cancel
                      </button>
                    )}
                  </Popconfirm>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-center items-center mt-6 space-x-2">
        <button
          disabled={page === 1 || isFetching}
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Prev
        </button>
        <span className="text-gray-700">
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages || isFetching}
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default UserAppointments;