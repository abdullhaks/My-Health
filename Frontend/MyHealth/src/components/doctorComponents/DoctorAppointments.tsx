import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getDoctorAppointments } from "../../api/doctor/doctorApi";

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
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const doctor = useSelector((state: any) => state.doctor.doctor);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const response = await getDoctorAppointments(doctor._id);
        setAppointments(response);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setErrorMessage("Failed to load appointments. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const handleCancel = async (appointmentId: string) => {

    try {
      setIsLoading(true);
      setErrorMessage("");
    //   await cancelAppointment(appointmentId);
      setAppointments((prev) =>
        prev.map((appt) =>
          appt._id === appointmentId
            ? { ...appt, appointmentStatus: "cancelled", paymentStatus: "failed" }
            : appt
        )
      );
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      setErrorMessage("Failed to cancel appointment. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
        {isLoading ? (
          <div className="text-center text-gray-500 py-4">Loading...</div>
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
                    {appt.userName}-({appt.userEmail})
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
                <div>
                  {appt.appointmentStatus === "booked" && (
                    <button
                      onClick={() => handleCancel(appt._id)}
                      disabled={isLoading}
                      className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                        isLoading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      Cancel
                    </button>
                  )}
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