import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getDoctorAppointments } from "../../api/doctor/doctorApi";
import { useNavigate } from "react-router-dom";
import { Popconfirm, message } from "antd";

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
  paymentStatus: "pending" | "completed" | "failed";
  stripeSessionId: string;
  userName: string;
  userEmail: string;
  doctorName: string;
  doctorCategory: string;
  createdAt: string;
  updatedAt: string;
}

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const doctor = useSelector((state:any) => state.doctor.doctor);
  const navigate = useNavigate();
 

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsFetching(true);
        setErrorMessage("");
        const response = await getDoctorAppointments(doctor._id);
        setAppointments(response || []);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setErrorMessage(
          (typeof error === "object" && error !== null && "response" in error && (error as any).response?.data?.message) ||
            "Failed to load appointments. Please try again."
        );
      } finally {
        setIsFetching(false);
      }
    };
    if (doctor._id) fetchAppointments();
  }, [doctor._id]);

  const handleCancel = async (appointmentId: any) => {
    try {
      // setIsCanceling(true);
      // setErrorMessage("");
      // const response = await cancelAppointment(appointmentId);
      // if (response.status) {
      //   message.success(response.message);
      //   setAppointments((prev) =>
      //     prev.map((appt) =>
      //       appt._id === appointmentId
      //         ? { ...appt, appointmentStatus: "cancelled", paymentStatus: "failed" }
      //         : appt
      //     )
      //   );
      // } else {
      //   message.error(response.message);
      // }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      setErrorMessage(
          (typeof error === "object" && error !== null && "response" in error && (error as any).response?.data?.message) ||
            "Failed to load appointments. Please try again."
        );
    } finally {
      setIsCanceling(false);
    }
  };

  const handleJoin = (appointmentId:string) => {
    navigate(`/doctor/video-call/${appointmentId}`);
  };

  const isJoinable = (start:any, end:any) => {
    // const now = new Date().getTime();
    // const startTime = new Date(start).getTime();
    // const endTime = new Date(end).getTime();
    // const buffer = 5 * 60 * 1000; // 5-minute buffer
    // return now >= startTime - buffer && now <= endTime + buffer;
    return true;
  };

  const formatDateTime = (date:any) =>
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
                    {appt.userName} ({appt.userEmail})
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
    </div>
  );
};

export default DoctorAppointments;