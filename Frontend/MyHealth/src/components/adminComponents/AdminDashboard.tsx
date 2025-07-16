import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getDoctorAnalytics, getUserAnalytics ,getTotalAnalytics} from "../../api/admin/adminApi";
import adminimg from "../../assets/doctorLogin.png";
import { FaCalendarCheck, FaUsers } from "react-icons/fa";
import { FaMoneyBillTransfer, FaMoneyBillTrendUp, FaUserDoctor } from "react-icons/fa6";


interface SummaryCardProps {
  title: string;
  value: string;
  trend: string;
  trendColor: string;
  icon?: any;
};



const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, trend, trendColor, icon }) => (
  <div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col gap-3 transition-transform transform hover:scale-105">
    <div className="flex justify-between items-center">
      <h4 className="text-sm text-gray-600 font-semibold">{title}</h4>
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
        {icon || <span className="text-xl">📊</span>}
      </div>
    </div>
    <div className="text-3xl font-bold text-gray-800">{value}</div>
    <div className={`text-sm font-medium ${trendColor}`}>{trend}</div>
  </div>
);

const AdminDashboard = () => {
  const [userData, setUserData] = useState([]);
  const [userFilter, setUserFilter] = useState("day");
  const [doctorData,setDoctorData] = useState([]);
  const [doctorFilter, setDoctorFilter] = useState("day");
  const [totaldata,setTotalData] = useState({totalConsultations:0,
                                             totalDoctors:0,
                                             totalPaid:0,
                                             totalRevenue:0,
                                             totalUsers:0 })

  useEffect(() => {
    const fetchTotalAnalytics = async () => {
      try {
        const response = await getTotalAnalytics();

        console.log("total analytics response is ...",response);
        setTotalData(response); 
      } catch (error) {
        console.error("Failed to fetch user analytics:", error);
      }
    };
    fetchTotalAnalytics();
  }, []);

  useEffect(() => {
    const fetchUserAnalytics = async () => {
      try {
        const response = await getUserAnalytics(userFilter);
        setUserData(response); 
      } catch (error) {
        console.error("Failed to fetch user analytics:", error);
      }
    };
    fetchUserAnalytics();
  }, [userFilter]);

  useEffect(() => {
    const fetchDoctorAnalytics = async () => {
      try {
        const response = await getDoctorAnalytics(doctorFilter);
        setDoctorData(response); 
      } catch (error) {
        console.error("Failed to fetch user analytics:", error);
      }
    };
    fetchDoctorAnalytics();
  }, [doctorFilter]);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* Top Banner */}
      <div className="relative flex items-center justify-between bg-gradient-to-r from-blue-500 to-cyan-300 rounded-2xl h-48 px-8 shadow-xl overflow-hidden">
        <div className="z-10 text-white max-w-lg">
          <h2 className="text-4xl font-extrabold tracking-tight">
            Aster MIMS Hospitals
          </h2>
          <p className="text-lg font-semibold mt-2">We’ll Treat You Well</p>
          <p className="text-sm mt-1">www.asterhospitals.in</p>
          <p className="text-sm">+91 3434 5656 999</p>
        </div>
        <img
          src={adminimg}
          alt="Doctors"
          className="absolute bottom-0 right-8 h-full max-h-48 object-contain opacity-90 z-0"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mt-8">
        <SummaryCard
          title="Total Users"
          value={totaldata.totalUsers.toString()}
          trend="8.5% Up from yesterday"
          trendColor="text-green-600"
          icon={<FaUsers />}
        />
        <SummaryCard
          title="Total Doctors"
          value={totaldata.totalDoctors.toString()}
          trend="1.3% Up from past week"
          trendColor="text-green-600"
          icon={<FaUserDoctor />}
        />
        <SummaryCard
          title="Total Revenue"
          value={totaldata.totalRevenue.toString()}
          trend="4.3% Down from yesterday"
          trendColor="text-red-600"
          icon={<FaMoneyBillTrendUp />}
        />
        <SummaryCard
          title="Total Paid"
          value={totaldata.totalPaid.toString()}
          trend="1.8% Up from yesterday"
          trendColor="text-green-600"
          icon={<FaMoneyBillTransfer />}
        />
        <SummaryCard
          title="Total Consultations"
          value={totaldata.totalConsultations.toString()}
          trend="8.5% Up from yesterday"
          trendColor="text-green-600"
          icon={<FaCalendarCheck />}
        />
      </div>

      {/* User Analytics Chart */}
      <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">User Analytics</h3>
          <select
            className="border border-gray-300 px-4 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>
       <ResponsiveContainer width="100%" height={350}>
        <LineChart data={userData.length > 0 ? userData : [{ name: "", value: 0 }]}>
          <XAxis dataKey="name" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ r: 5, fill: "#3b82f6" }}
          />
        </LineChart>
      </ResponsiveContainer>
      </div>



      {/* Doctor Analytics Chart */}
      <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Doctor Analytics</h3>
          <select
            className="border border-gray-300 px-4 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>
       <ResponsiveContainer width="100%" height={350}>
        <LineChart data={doctorData.length > 0 ? doctorData : [{ name: "", value: 0 }]}>
          <XAxis dataKey="name" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ r: 5, fill: "#3b82f6" }}
          />
        </LineChart>
      </ResponsiveContainer>
      </div>


    </div>
  );
};

export default AdminDashboard;