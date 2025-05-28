import { useState, useEffect } from "react";
import { FaTrash, FaSave } from "react-icons/fa";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { RRule, rrulestr } from "rrule";
import { setSessions as setSessionsApi ,getSessions} from "../../api/doctor/doctorApi";
import { useSelector } from "react-redux";

interface Session {
  id?: string;
  startTime: string;
  endTime: string;
  duration: number;
  fee: number;
  dayOfWeek: number;
  rRule?: string;
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

interface ValidationError {
  index: number;
  message: string;
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
  startTime: "10:00",
  endTime: "12:00",
  duration: 20,
  fee: 100,
  dayOfWeek: 1, 
};

const DoctorSlots = () => {

  const doctor = useSelector((state:any)=> state.doctor.doctor);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointmentSlots, setAppointmentSlots] = useState<AppointmentSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  // Load sessions from backend on component mount
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        const response = await getSessions(doctor._id)
        // const data = await response.json();
        setSessions(response);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // Validate sessions whenever they change
  useEffect(() => {
    const validateSessions = () => {
      const errors: ValidationError[] = [];

      sessions.forEach((session, index) => {
        // Validate start time is before end time
        const start = new Date(`2000-01-01T${session.startTime}:00`);
        const end = new Date(`2000-01-01T${session.endTime}:00`);
        if (start >= end) {
          errors.push({
            index,
            message: "End time must be after start time.",
          });
          return;
        }

        // Check for overlapping sessions on the same day
        const sameDaySessions = sessions.filter(
          (s, i) => s.dayOfWeek === session.dayOfWeek && i !== index
        );
        sameDaySessions.forEach((otherSession) => {
          const otherStart = new Date(`2000-01-01T${otherSession.startTime}:00`);
          const otherEnd = new Date(`2000-01-01T${otherSession.endTime}:00`);

          if (
            (start >= otherStart && start < otherEnd) ||
            (end > otherStart && end <= otherEnd) ||
            (start <= otherStart && end >= otherEnd)
          ) {
            errors.push({
              index,
              message: `This session overlaps with another session on ${weekdays.find((day) => day.value === session.dayOfWeek)?.name}.`,
            });
          }
        });
      });

      setValidationErrors(errors);
    };

    validateSessions();
  }, [sessions]);

  // Generate appointment slots (unchanged)
  useEffect(() => {
    if (sessions.length === 0) return;

    const generateSlotsForDate = (date: Date) => {
      const daySlots: AppointmentSlot[] = [];
      const dayOfWeek = date.getDay();

      const daySessions = sessions.filter((s) => s.dayOfWeek === dayOfWeek);

      daySessions.forEach((session) => {
        const rrule = session.rRule ? rrulestr(session.rRule) : null;

        if (rrule && !rrule.between(date, date, true).length) {
          return;
        }

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

          daySlots.push({
            id: `${currentSlotStart.getTime()}`,
            start: new Date(currentSlotStart),
            end: new Date(currentSlotEnd),
            duration: session.duration,
            fee: session.fee,
            status: "available",
            sessionId: session.id || "",
          });

          currentSlotStart = new Date(currentSlotEnd);
        }
      });

      return daySlots;
    };

    const slots = generateSlotsForDate(selectedDate);
    setAppointmentSlots(slots);

    console.log("created sessions:", sessions);
    console.log("Selected date:", selectedDate);
    console.log("Generated appointment slots:", slots);

  }, [sessions, selectedDate]);

  const handleEditSession = (index: number, field: keyof Session, value: string | number) => {
    const updated = [...sessions];

    if (field === "startTime" || field === "endTime") {
      updated[index][field] = value as string;
    } else if (field === "duration" || field === "fee" || field === "dayOfWeek") {
      updated[index][field] = Number(value);
    }

    setSessions(updated);
  };

  const handleAddSession = () => {
    setSessions([...sessions, { ...defaultSession }]);
  };

  const handleDeleteSession = (index: number) => {
    const updated = [...sessions];
    updated.splice(index, 1);
    setSessions(updated);
  };

  const generateRRule = (session: Session): string => {
    const rule = new RRule({
      freq: RRule.WEEKLY,
      byweekday: [session.dayOfWeek],
      dtstart: new Date(),
      // until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });
    return rule.toString();
  };

  const saveSessions = async () => {
    if (validationErrors.length > 0) return; // Prevent saving if there are errors

    try {
      setSaveStatus("saving");

      const sessionsWithRRule = sessions.map((session) => ({
        ...session,
        rRule: generateRRule(session),
        doctorId:doctor._id
      }));

      console.log("Saving sessions:", sessionsWithRRule);

      const response = await setSessionsApi(sessionsWithRRule);

      console.log("response in frontend is .....",response);

      if (!response) throw new Error('Failed to save sessions');

    
      setSessions(response);
 
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("Error saving sessions:", error);
      setSaveStatus("error");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Session Editor */}
        <div className="col-span-2 bg-white rounded-lg p-6 shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Manage Weekly Consultation Timings</h2>
            <div className="flex gap-2">
              <button
                onClick={handleAddSession}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Session
              </button>
              <button
                onClick={saveSessions}
                disabled={saveStatus === "saving" || validationErrors.length > 0}
                className={`px-3 py-1 rounded flex items-center gap-1 ${
                  saveStatus === "saving" || validationErrors.length > 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                {saveStatus === "saving" ? (
                  "Saving..."
                ) : (
                  <>
                    <FaSave /> Save
                  </>
                )}
              </button>
            </div>
          </div>

          {saveStatus === "success" && (
            <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
              Sessions saved successfully!
            </div>
          )}

          {saveStatus === "error" && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
              Error saving sessions. Please try again.
            </div>
          )}

          {isLoading ? (
            <div>Loading sessions...</div>
          ) : (
            <div className="space-y-6">
              {sessions.map((session, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex flex-wrap gap-4 items-end mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                      <select
                        value={session.dayOfWeek}
                        onChange={(e) => handleEditSession(index, "dayOfWeek", e.target.value)}
                        className="border px-3 py-2 rounded w-full"
                      >
                        {weekdays.map((day) => (
                          <option key={day.value} value={day.value}>
                            {day.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={session.startTime}
                        onChange={(e) => handleEditSession(index, "startTime", e.target.value)}
                        className="border px-3 py-2 rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                      <input
                        type="time"
                        value={session.endTime}
                        onChange={(e) => handleEditSession(index, "endTime", e.target.value)}
                        className="border px-3 py-2 rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration (mins)</label>
                      <select
                        value={session.duration}
                        onChange={(e) => handleEditSession(index, "duration", e.target.value)}
                        className="border px-3 py-2 rounded"
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fee (Rs)</label>
                      <input
                        type="number"
                        value={session.fee}
                        onChange={(e) => handleEditSession(index, "fee", e.target.value)}
                        className="border px-3 py-2 rounded w-20"
                      />
                    </div>

                    <button
                      onClick={() => handleDeleteSession(index)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  {validationErrors.some((err) => err.index === index) && (
                    <div className="text-red-500 text-sm mt-2">
                      {validationErrors.find((err) => err.index === index)?.message}
                    </div>
                  )}

                  {session.rRule && (
                    <div className="text-sm text-gray-500 mt-2">
                      Recurrence: {rrulestr(session.rRule).toText()}
                    </div>
                  )}
                </div>
              ))}

              {sessions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No consultation sessions configured. Click "Add Session" to create one.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Calendar + Slot Summary (unchanged) */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-lg font-semibold mb-4">Appointment Calendar</h2>
          <Calendar
            onChange={(value) => value && setSelectedDate(value as Date)}
            value={selectedDate}
            tileClassName={({ date }) => {
              const dayOfWeek = date.getDay();
              return sessions.some((s) => s.dayOfWeek === dayOfWeek) ? "bg-blue-50" : "";
            }}
          />

          <div className="mt-6">
            <h3 className="text-md font-semibold mb-2">
              Appointments on{" "}
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h3>

            {appointmentSlots.length === 0 ? (
              <div className="text-gray-500 py-4 text-center">
                No appointment slots available for this day.
              </div>
            ) : (
              <ul className="space-y-2">
                {appointmentSlots.map((slot) => (
                  <li
                    key={slot.id}
                    className={`border p-3 rounded shadow-sm text-sm ${
                      slot.status === "booked" ? "bg-red-50" : "bg-green-50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">
                          {slot.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                          {slot.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="text-gray-600 block text-xs">
                          Duration: {slot.duration} mins • Fee: ${slot.fee}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          slot.status === "booked" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                        }`}
                      >
                        {slot.status === "booked" ? "Booked" : "Available"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSlots;