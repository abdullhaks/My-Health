import { useState } from "react";
import { FaTrash } from "react-icons/fa";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const defaultSessions = {
  startTime: "10:00",
  endTime: "12:00",
  duration: 20,
  fee: 150
};

const DoctorAppointments = () => {
  interface Session {
    startTime: string;
    endTime: string;
    duration: number;
    fee: number;
  }

  const [weeklySchedule, setWeeklySchedule] = useState<Record<string, Session[]>>(
    weekdays.reduce((acc, day) => ({ ...acc, [day.toLowerCase()]: [{ ...defaultSessions }] }), {})
  );
  const [selectedDate, setSelectedDate] = useState(new Date());
//   const [appointments, setAppointments] = useState([]);

 const handleEditSession = (
  day: string,
  index: number,
  field: keyof Session,
  value: string | number
) => {
  const updated = [...weeklySchedule[day]];

  // Type narrowing per field
  if (field === "startTime" || field === "endTime") {
    updated[index][field] = value as string;
  } else if (field === "duration" || field === "fee") {
    updated[index][field] = value as number;
  }

  setWeeklySchedule({ ...weeklySchedule, [day]: updated });
};

  const handleAddSession = (day:any) => {
    const updated = [...weeklySchedule[day], { ...defaultSessions }];
    setWeeklySchedule({ ...weeklySchedule, [day]: updated });
  };

  const handleDeleteSession = (day:any, index:any) => {
    const updated = [...weeklySchedule[day]];
    updated.splice(index, 1);
    setWeeklySchedule({ ...weeklySchedule, [day]: updated });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Session Editor */}
        <div className="col-span-2 bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Manage Weekly Consultation Timings</h2>
          {weekdays.map((day) => (
            <div key={day} className="mb-4">
              <h3 className="font-bold mb-2">{day}</h3>
              {weeklySchedule[day.toLowerCase()].map((session, index) => (
                <div key={index} className="flex flex-wrap gap-2 items-center mb-2">
                  <input
                    type="time"
                    value={session.startTime}
                    onChange={(e) => handleEditSession(day.toLowerCase(), index, "startTime", e.target.value)}
                    className="border px-2 py-1 rounded"
                  />
                  <input
                    type="time"
                    value={session.endTime}
                    onChange={(e) => handleEditSession(day.toLowerCase(), index, "endTime", e.target.value)}
                    className="border px-2 py-1 rounded"
                  />
                  <select
                    value={session.duration}
                    onChange={(e) => handleEditSession(day.toLowerCase(), index, "duration", parseInt(e.target.value))}
                    className="border px-2 py-1 rounded"
                  >
                    <option value={20}>20 mins</option>
                    <option value={30}>30 mins</option>
                    <option value={60}>1 hour</option>
                  </select>
                  <input
                    type="number"
                    value={session.fee}
                    onChange={(e) => handleEditSession(day.toLowerCase(), index, "fee", parseInt(e.target.value))}
                    className="border px-2 py-1 rounded w-20"
                    placeholder="Fee"
                  />
                  <button onClick={() => handleDeleteSession(day.toLowerCase(), index)} className="text-red-500">
                    <FaTrash />
                  </button>
                </div>
              ))}
              <button
                onClick={() => handleAddSession(day.toLowerCase())}
                className="text-sm text-blue-500 hover:underline"
              >
                + Add Session
              </button>
            </div>
          ))}
        </div>

        {/* Calendar + Slot Summary */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-lg font-semibold mb-4">Appointment Calendar</h2>
          <Calendar onChange={(value) => value && setSelectedDate(value as Date)} value={selectedDate} />
          <div className="mt-6">
            <h3 className="text-md font-semibold">Appointments on {selectedDate.toDateString()}</h3>
            <ul className="mt-2 space-y-2">
              {/* Placeholder for dynamic slots (map from API later) */}
              <li className="flex justify-between border p-2 rounded shadow text-sm">
                <span>10:00 AM - 10:20 AM</span>
                <span className="text-green-600">Available</span>
              </li>
              <li className="flex justify-between border p-2 rounded shadow text-sm">
                <span>10:20 AM - 10:40 AM</span>
                <span className="text-red-500">Booked</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointments;
