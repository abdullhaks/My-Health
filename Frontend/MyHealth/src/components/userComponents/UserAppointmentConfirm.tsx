import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getDoctor } from "../../api/user/userApi"; 

interface AppointmentSlot {
  id: string;
  start: Date;
  end: Date;
  duration: number;
  fee: number;
  status: "available" | "booked";
  sessionId: string;
}

interface Doctor {
  _id: string;
  fullName: string;
  specialization: string;
  experience: number;
  profile?: string;
  category?:string;
}

interface AppointmentConfirmationProps {
  doctorId: string;
  slot: AppointmentSlot;
}

const UserAppointmentConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { doctorId, slot } = location.state as AppointmentConfirmationProps;
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle");

  useEffect(() => {
    if (!doctorId || !slot) {
      setErrorMessage("Missing doctor or slot information.");
      return;
    }

    const fetchDoctorDetails = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const response = await getDoctor(doctorId);
        setDoctor(response);
      } catch (error) {
        console.error("Error fetching doctor details:", error);
        setErrorMessage("Failed to load doctor details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctorDetails();
  }, [doctorId]);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const handlePayment = async () => {
    // Placeholder for Stripe payment integration
    try {
      setPaymentStatus("processing");
      setErrorMessage("");
      // TODO: Implement Stripe payment logic here
      // Example: const response = await initiateStripePayment(slot, doctorId);
      console.log("Initiating payment for slot:", slot, "Doctor ID:", doctorId);
      // On success:
      // setPaymentStatus("success");
      // navigate to success page or update UI
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStatus("error");
      setErrorMessage("Payment failed. Please try again.");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Confirm Appointment</h2>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">{errorMessage}</div>
        )}
        {paymentStatus === "success" && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
            Payment successful! Appointment confirmed.
          </div>
        )}
        {paymentStatus === "error" && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {errorMessage || "Error processing payment. Please try again."}
          </div>
        )}

        {isLoading ? (
          <div className="text-center text-gray-500 py-4">Loading...</div>
        ) : !doctor ? (
          <div className="text-center text-gray-500 py-4">No doctor details available.</div>
        ) : (
          <div className="space-y-6">
            {/* Doctor Details */}
            <div className="flex items-center space-x-4 border-b border-gray-200 pb-4">
             
                <img
                  src={doctor.profile || "https://myhealth-app-storage.s3.ap-south-1.amazonaws.com/users/profile-images/avatar.png"}
                  alt={doctor.fullName}
                  className="w-16 h-16 rounded-full object-cover"
                />
            
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Dr.{doctor.fullName}</h3>
                <p className="text-sm text-gray-600">{doctor.specialization}</p>
                <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                    {doctor.category || "General"}
                  </span>
                <p className="text-sm text-gray-500">Experience: {doctor.experience} years</p>
              </div>
            </div>

            {/* Slot Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Selected Slot</h3>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Date:</span> {formatDate(slot.start)}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Time:</span> {formatTime(slot.start)} - {formatTime(slot.end)}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Duration:</span> {slot.duration} minutes
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Fee:</span> ₹{slot.fee}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between mt-6">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Back to Slots
              </button>
              <button
                onClick={handlePayment}
                disabled={paymentStatus === "processing"}
                className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                  paymentStatus === "processing"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {paymentStatus === "processing" ? "Processing..." : "Pay with Stripe"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAppointmentConfirmation;