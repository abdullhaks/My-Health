import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { getSessions, getBookedSlots, getUnavailableDays, getUnavailableSessions } from "../../api/user/userApi";
import { IAppointmentData } from "../../interfaces/appointment";

interface Session {
  _id?: string;
  startTime: string;
  endTime: string;
  duration: number;
  fee: number;
  dayOfWeek: number;
  rRule?: string;
  doctorId: string;
}

interface AppointmentSlot {
  id: string;
  start: Date;
  end: Date;
  duration: number;
  fee: number;
  status: "available" | "booked";
  sessionId: string;
}

const UserAppointmentSlots = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const doctorId = location.state?.doctorId;
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointmentSlots, setAppointmentSlots] = useState<AppointmentSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<"idle" | "booking" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]); 
  const [unAvailableDays, setUnAvailableDays] = useState<string[]>([]);
  const [unAvailableSessions, setUnAvailableSessions] = useState<{ day: string; sessionId: string }[]>([]);

  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 14);

  // Fetch sessions for the doctor
  useEffect(() => {
    if (!doctorId) {
      setErrorMessage("No doctor selected. Please go back and select a doctor.");
      return;
    }

    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const response = await getSessions(doctorId);
        console.log("Fetched sessions:", response);
        setSessions(response || []);
      } catch (error) {
        console.error("Error fetching sessions:", error);
        setErrorMessage("Failed to load sessions. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSessions();
  }, [doctorId]);

  // Fetch booked slots, unavailable days, and sessions for the selected date
  useEffect(() => {
    if (!doctorId || !selectedDate) return;

    const fetchBookedSlots = async () => {
      try {
        console.log("selected date is >>>>>>>", selectedDate);
        setIsLoading(true);
        setErrorMessage("");
       
        const yyyy = selectedDate.getFullYear();
        const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const dd = String(selectedDate.getDate()).padStart(2, "0");
        const localDate = `${yyyy}-${mm}-${dd}`;
        
        const [bookedResponse, unavailableDaysResponse, unavailableSessionsResponse] = await Promise.all([
          getBookedSlots(doctorId, localDate),
          getUnavailableDays(doctorId),
          getUnavailableSessions(doctorId),
        ]);
        
        console.log("unAvailableDays are/......", unavailableDaysResponse);
        console.log("unAvailableSessions are/......", unavailableSessionsResponse);
        setUnAvailableDays(unavailableDaysResponse || []);
        setUnAvailableSessions(unavailableSessionsResponse || []);
        setBookedSlots(bookedResponse.map((slot: IAppointmentData) => slot.slotId) || []);
     
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMessage("Failed to load data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookedSlots();
  }, [doctorId, selectedDate]);

  // Generate slots and filter based on booked slots, unavailable days, and sessions
  useEffect(() => {
    console.log("Selected date is:", selectedDate);

    if (sessions.length === 0) {
      setAppointmentSlots([]);
      return;
    }

    const generateSlotsForDate = (date: Date) => {
      const daySlots: AppointmentSlot[] = [];
      const dayOfWeek = date.getDay();
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const formattedDate = `${yyyy}-${mm}-${dd}`;
      
      // Check if the selected date is unavailable
      if (unAvailableDays.includes(formattedDate)) {
        console.log("Date is unavailable:", formattedDate);
        return daySlots;
      }

      console.log("Generating slots for date:", date, "Day of week:", dayOfWeek);

      const daySessions = sessions.filter((s) => s.dayOfWeek === dayOfWeek);
      console.log("Day sessions:", daySessions);

      daySessions.forEach((session) => {
        // Check if the session is unavailable for the selected date
        const isSessionUnavailable = unAvailableSessions.some(
          (unavailable) => unavailable.day === formattedDate && unavailable.sessionId === session._id
        );

        if (isSessionUnavailable) {
          console.log(`Session ${session._id} is unavailable for date: ${formattedDate}`);
          return;
        }

        let shouldGenerateSlots = true;

        // Uncomment if rRule logic is needed
        /*
        if (session.rRule) {
          try {
            const rrule = rrulestr(session.rRule);
            const utcDate = new Date(
              Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
            );
            shouldGenerateSlots = rrule.between(utcDate, utcDate, true).length > 0;
            console.log(`rRule check for session ${session._id}:`, shouldGenerateSlots);
          } catch (error) {
            console.error(`Invalid rRule for session ${session._id}:`, error);
            shouldGenerateSlots = true; // Fallback to dayOfWeek
          }
        }
        */

        if (!shouldGenerateSlots) return;

        const [startHours, startMinutes] = session.startTime.split(":").map(Number);
        const [endHours, endMinutes] = session.endTime.split(":").map(Number);

        const slotStart = new Date(date);
        slotStart.setHours(startHours, startMinutes, 0, 0);

        const slotEnd = new Date(date);
        slotEnd.setHours(endHours, endMinutes, 0, 0);

        let currentSlotStart = new Date(slotStart);

        while (currentSlotStart < slotEnd) {
          const currentSlotEnd = new Date(currentSlotStart);
          currentSlotEnd.setMinutes(currentSlotEnd.getMinutes() + session.duration);

          if (currentSlotEnd > slotEnd) break;

          const slotId = `${currentSlotStart.getTime()}`;
          const isBooked = bookedSlots.includes(slotId);

          daySlots.push({
            id: slotId,
            start: new Date(currentSlotStart),
            end: new Date(currentSlotEnd),
            duration: session.duration,
            fee: session.fee,
            status: isBooked ? "booked" : "available",
            sessionId: session._id || "",
          });

          currentSlotStart = new Date(currentSlotEnd);
        }
      });

      console.log("Generated day slots:", daySlots);
      return daySlots;
    };

    const slots = generateSlotsForDate(selectedDate);
    setAppointmentSlots(slots);
  }, [sessions, selectedDate, bookedSlots, unAvailableDays, unAvailableSessions]);

  const handleBookSlot = (slot: AppointmentSlot) => {
    navigate("/user/appointment-confirmation", { state: { doctorId, slot } });
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Book Appointment</h2>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">{errorMessage}</div>
        )}
        {bookingStatus === "success" && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
            Appointment booked successfully!
          </div>
        )}
        {bookingStatus === "error" && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {errorMessage || "Error booking appointment. Please try again."}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Select Date</h3>
            <Calendar
              onChange={(value) => value && setSelectedDate(value as Date)}
              value={selectedDate}
              minDate={minDate}
              maxDate={maxDate}
              tileDisabled={({ date }) => {
                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, "0");
                const dd = String(date.getDate()).padStart(2, "0");
                const formattedDate = `${yyyy}-${mm}-${dd}`;
                return unAvailableDays.includes(formattedDate);
              }}
              tileClassName={({ date }) =>
                sessions.some((s) => s.dayOfWeek === date.getDay())
                  ? "bg-blue-100 hover:bg-blue-200"
                  : ""
              }
              className="border-none"
            />
          </div>

          <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Available Slots on{" "}
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h3>
            {isLoading ? (
              <div className="text-center text-gray-500 py-4">Loading slots...</div>
            ) : appointmentSlots.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                No appointment slots available for this day.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
                {appointmentSlots.map((slot) => (
                  <div
                    key={slot.id}
                    onClick={() => slot.status !== "booked" && bookingStatus !== "booking" && handleBookSlot(slot)}
                    className={`p-3 rounded-xl shadow-lg border border-gray-300 transition-all duration-300 cursor-pointer
                      ${slot.status === "booked" ? "bg-gray-100 opacity-70 cursor-not-allowed" : "bg-white hover:bg-blue-200 hover:shadow-md"}
                      ${bookingStatus === "booking" && slot.status !== "booked" ? "animate-pulse" : ""}`}
                  >
                    <div className="flex flex-col space-y-1">
                      <p className="text-base font-semibold text-gray-900">
                        {formatTime(slot.start)} - {formatTime(slot.end)}
                      </p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Duration: {slot.duration} mins</span>
                        <span>₹{slot.fee}</span>
                      </div>
                      {slot.status === "booked" && (
                        <p className="text-xs text-red-500 font-medium">Booked</p>
                      )}
                      {bookingStatus === "booking" && slot.status !== "booked" && (
                        <p className="text-xs text-blue-500 font-medium">Booking...</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
        >
          Back to Doctors
        </button>
      </div>
    </div>
  );
};

export default UserAppointmentSlots;