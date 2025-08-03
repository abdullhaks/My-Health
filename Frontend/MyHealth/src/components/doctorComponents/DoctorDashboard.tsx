import { FaVideo } from "react-icons/fa";
import { FaNotesMedical } from "react-icons/fa6";
import adminimg from "../../assets/doctorLogin.png";
import { getDashboardContent } from "../../api/doctor/doctorApi";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const DoctorDashboard = () => {
  const doctor = useSelector((state: any) => state.doctor.doctor);
  const [dashboardData, setDashboardData] = useState<{
    upcomingAppointmentsCount: [string, number][];
    todayAppointmentsCount: number;
    pendingReportsCount: number;
    todaysFirstAppointmentTime: string | null;
  } | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const resp = await getDashboardContent(doctor._id);
        console.log("resp is .....", resp);
        setDashboardData(resp);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchDashboardData();
  }, [doctor._id]);

  // Format date for display (e.g., "02-08-2025 Sat")
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      weekday: "short",
      timeZone: "Asia/Kolkata",
    }).replace(/,/, ""); // e.g., "02-08-2025 Sat"
  };

  // Format time for display (e.g., "05:30 AM")
  const formatTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }); // e.g., "05:30 AM"
  };

  // Get today's date for header
  const todayDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    weekday: "short",
    timeZone: "Asia/Kolkata",
  }).replace(/,/, ""); // e.g., "02-08-2025 Sat"

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Hero Card */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="relative flex-1 rounded-xl overflow-hidden shadow bg-gradient-to-r from-blue-500 to-cyan-400 h-96 flex items-center px-6">
          <div className="z-5 text-white">
            <h2 className="text-2xl md:text-3xl font-bold text-green-700">
              Aster MIMS HOSPITALS
            </h2>
            <p className="text-sm md:text-base font-medium mt-1">
              We'll Treat You Well
            </p>
            <p className="text-xs mt-2">www.asterhospitals.in</p>
            <p className="text-xs">+91 3434 5656 999</p>
          </div>
          <img
            src={adminimg}
            alt="Hospital Banner"
            className="absolute bottom-0 right-0 h-full object-contain"
          />
        </div>

        {/* Upcoming Appointments */}
        <div className="w-full lg:w-80 rounded-xl shadow bg-white p-5">
          <h3 className="text-lg font-semibold mb-4">Upcoming Appointments</h3>
          <div className="space-y-4">
            {dashboardData?.upcomingAppointmentsCount.map(([date, count], index) => {
              const isToday = date === new Date().toISOString().split("T")[0];
              return (
                <div
                  key={date}
                  className={`rounded-lg px-4 py-3 flex justify-between items-center ${
                    isToday ? "bg-red-100" : "bg-gray-100"
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium">{formatDate(date).split(" ")[1]}</p>
                    <p className="text-xl font-bold">{formatDate(date).split("-")[0]}</p>
                  </div>
                  <div className="text-gray-600 text-sm">{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Today's Updates */}
      <div>
        <h3 className="text-lg font-semibold mb-3">
          Today's Updates <span className="text-sm text-gray-500">{todayDate}</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-green-400 text-white p-6 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaVideo className="text-2xl" />
              <div>
                <p className="font-medium">Online consultations</p>
                <p className="text-2xl font-bold">{dashboardData?.todayAppointmentsCount || 0}</p>
                <p className="text-xs mt-1">
                  start from :{" "}
                  {dashboardData?.todaysFirstAppointmentTime
                    ? formatTime(dashboardData.todaysFirstAppointmentTime)
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-orange-400 text-white p-6 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaNotesMedical className="text-2xl" />
              <div>
                <p className="font-medium">Report Analysis</p>
                <p className="text-2xl font-bold">{dashboardData?.pendingReportsCount || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Doctors (unchanged, as no real data provided) */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Recommended Doctors</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl overflow-hidden shadow bg-gray-500">
            <div className="p-4">
              <button className="bg-black text-white px-4 py-2 rounded">▶</button>
            </div>
          </div>
          <div className="bg-gray-800 text-white rounded-xl p-6 flex flex-col justify-between">
            <div>
              <p className="font-semibold">
                Diabetes in migrant communities : a rising healthcare priority.
              </p>
            </div>
            <p className="text-sm mt-4">Dr. Muhammed Ks, BHMS</p>
            <p className="text-xs">08-09-2025</p>
          </div>
          <div className="rounded-xl overflow-hidden shadow bg-gray-400">
            <div className="p-4 text-sm font-medium">
              Kerala Issues Nipah Alert in Five Districts.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;