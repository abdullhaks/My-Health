import { FaVideo } from "react-icons/fa";
import { FaNotesMedical } from "react-icons/fa6";
import adminimg from "../../assets/doctorLogin.png";
import { getDashboardContent, getDoctorAppointmentsStats, getDoctorReportsStats, getDoctorPayouts } from "../../api/doctor/doctorApi";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { IDoctorData } from "../../interfaces/doctor";
import { number, string } from "zod";

const DoctorDashboard = () => {
  const doctor = useSelector((state: IDoctorData) => state.doctor.doctor);

  // Dashboard data
  const [dashboardData, setDashboardData] = useState<{
    upcomingAppointmentsCount: [string, number][];
    todayAppointmentsCount: number;
    pendingReportsCount: number;
    todaysFirstAppointmentTime: string | null;
  } | null>(null);

  // Graph & tables data
  const [appointmentsStats, setAppointmentsStats] = useState<{ day: string; appointments: number }[] >([]);
  const [reportsStats, setReportsStats] = useState<{ day: string; pending: number; submitted: number }[] >([]);
  const [payouts, setPayouts] = useState<{ on:string,totalAmount: number,status: string,transactionId: string}[]>([]);
  const [filter, setFilter] = useState<"day" | "month" | "year">("day");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const resp = await getDashboardContent(doctor._id);
        setDashboardData(resp);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    const fetchStats = async () => {
      try {
        const appStats = await getDoctorAppointmentsStats(doctor._id, filter);
        const repStats = await getDoctorReportsStats(doctor._id, filter);
        const pay = await getDoctorPayouts(doctor._id);

        setAppointmentsStats(appStats.data);
        setReportsStats(repStats.data);
        setPayouts(pay.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchDashboardData();
    fetchStats();
  }, [doctor._id, filter]);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        weekday: "short",
        timeZone: "Asia/Kolkata",
      })
      .replace(/,/, "");
  };

  // Format time for display
  const formatTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  // Format axis label based on filter
  const formatAxisLabel = (value: string) => {
    if (filter === "day") {
      return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    } else if (filter === "month") {
      return String(value);
    } else {
      return value;
    }
  };

  const todayDate = new Date()
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      weekday: "short",
      timeZone: "Asia/Kolkata",
    })
    .replace(/,/, "");

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Hero Card */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="relative flex-1 rounded-xl overflow-hidden shadow bg-gradient-to-r from-blue-500 to-cyan-400 h-96 flex items-center px-6">
          <div className="z-10 text-white">
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
            {dashboardData?.upcomingAppointmentsCount.map(
              ([date, count], index) => {
                const isToday =
                  date === new Date().toISOString().split("T")[0];
                return (
                  <div
                    key={date}
                    className={`rounded-lg px-4 py-3 flex justify-between items-center ${
                      isToday ? "bg-red-100" : "bg-gray-100"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {formatDate(date).split(" ")[1]}
                      </p>
                      <p className="text-xl font-bold">
                        {formatDate(date).split("-")[0]}
                      </p>
                    </div>
                    <div className="text-gray-600 text-sm">{count}</div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* Today's Updates */}
      <div>
        <h3 className="text-lg font-semibold mb-3">
          Today's Updates{" "}
          <span className="text-sm text-gray-500">{todayDate}</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-green-400 text-white p-6 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaVideo className="text-2xl" />
              <div>
                <p className="font-medium">Online consultations</p>
                <p className="text-2xl font-bold">
                  {dashboardData?.todayAppointmentsCount || 0}
                </p>
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
                <p className="text-2xl font-bold">
                  {dashboardData?.pendingReportsCount || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        {["day", "month", "year"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as "day" | "month" | "year")}
            className={`px-4 py-2 rounded-lg border ${
              filter === f
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Appointments Overview */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Appointments Overview</h3>
        <div className="bg-white rounded-xl shadow p-4">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={appointmentsStats}>
              <XAxis
                dataKey={filter === "day" ? "day" : filter === "month" ? "month" : "year"}
                tickFormatter={formatAxisLabel}
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="appointments" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Appointments Trend (New LineChart) */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Appointments Trend</h3>
        <div className="bg-white rounded-xl shadow p-4">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={appointmentsStats} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <XAxis
                dataKey={filter === "day" ? "day" : filter === "month" ? "month" : "year"}
                tickFormatter={formatAxisLabel}
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="appointments"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Reports Analysis */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Reports Analysis</h3>
        <div className="bg-white rounded-xl shadow p-4">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={reportsStats} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <XAxis
                dataKey="day"
                tickFormatter={formatAxisLabel}
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="pending" fill="#f97316" name="Pending" radius={[4, 4, 0, 0]} />
              <Bar dataKey="submitted" fill="#10b981" name="Submitted" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payouts Table */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Payouts</h3>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Amount</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Transaction Id</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((p, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{formatDate(p.on)}</td>
                  <td className="p-2">₹{p.totalAmount}</td>
                  <td className="p-2">{p.status}</td>
                  <td className="p-2">{p.transactionId || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;