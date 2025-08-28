import { FaVideo } from "react-icons/fa";
import { FaNotesMedical } from "react-icons/fa6";
import adminimg from "../../assets/doctorLogin.png";
import { getDashboardContent } from "../../api/doctor/doctorApi";
import {
  getDoctorAppointmentsStats,
  getDoctorReportsStats,
  getDoctorPayouts,
  // getDoctorTransactions,
} from "../../api/doctor/doctorApi"; // <- you said you’ll put these here
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const DoctorDashboard = () => {
  const doctor = useSelector((state: any) => state.doctor.doctor);

  // Dashboard data
  const [dashboardData, setDashboardData] = useState<{
    upcomingAppointmentsCount: [string, number][];
    todayAppointmentsCount: number;
    pendingReportsCount: number;
    todaysFirstAppointmentTime: string | null;
  } | null>(null);

  // Graph & tables data
  const [appointmentsStats, setAppointmentsStats] = useState<any[]>([]);
  const [reportsStats, setReportsStats] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  // const [transactions, setTransactions] = useState<any[]>([]);
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
        // const txn = await getDoctorTransactions(doctor._id);

        setAppointmentsStats(appStats.data);
        setReportsStats(repStats.data);
        setPayouts(pay.data);
        // setTransactions(txn);
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

      {/* Appointments Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Appointments Overview</h3>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex gap-4 items-end">
            {appointmentsStats.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1">
                <div
                  className="bg-blue-400 w-8 rounded-t"
                  style={{ height: `${item.appointments * 5}px` }}
                ></div>
                <p className="text-xs mt-1">{item.month || item.day || item.year}</p>
                <p className="text-xs">{item.appointments}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Reports Analysis</h3>
        <div className="bg-white rounded-xl shadow p-4 flex gap-6">
          {reportsStats.map((item, idx) => (
            <div key={idx} className="flex-1">
              <p className="font-medium text-sm">{item.day}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-2 bg-orange-400" style={{ width: `${item.pending * 10}px` }}></div>
                <span className="text-xs">Pending {item.pending}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-2 bg-green-400" style={{ width: `${item.submitted * 10}px` }}></div>
                <span className="text-xs">Submitted {item.submitted}</span>
              </div>
            </div>
          ))}
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

      {/* Transactions Table */}
      <div>
        {/* <h3 className="text-lg font-semibold mb-3">Transactions</h3>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Amount</th>
                <th className="p-2 text-left">For</th>
                <th className="p-2 text-left">Method</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{formatDate(t.date)}</td>
                  <td className="p-2">₹{t.amount}</td>
                  <td className="p-2">{t.paymentFor}</td>
                  <td className="p-2">{t.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div> */}
      </div>

      {/* Recommended Doctors (unchanged placeholder) */}
      <div>
        {/* <h3 className="text-lg font-semibold mb-3">Recommended Doctors</h3>
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
        </div> */}
      </div>
    </div>
  );
};

export default DoctorDashboard;
