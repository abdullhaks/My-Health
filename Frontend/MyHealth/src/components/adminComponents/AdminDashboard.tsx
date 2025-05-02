
// import doctorImg from '../../assets/doctorLogin.png'; 
// import {Video,FileText,DollarSign,Calendar,} from 'lucide-react';
// import {LineChart,Line,XAxis,YAxis,Tooltip,ResponsiveContainer,CartesianGrid,} from 'recharts';

// // Dummy chart data
// const consultationData = [
//   { day: 'Mon', count: 8 },
//   { day: 'Tue', count: 12 },
//   { day: 'Wed', count: 10 },
//   { day: 'Thu', count: 14 },
//   { day: 'Fri', count: 7 },
//   { day: 'Sat', count: 15 },
//   { day: 'Sun', count: 9 },
// ];

// const statCards = [
//   {
//     title: 'Today Consultations',
//     value: 12,
//     icon: <Video className="text-white" size={20} />,
//     bgColor: 'bg-green-500',
//     growth: '+8.5%',
//   },
//   {
//     title: 'Report Analysis',
//     value: 3,
//     icon: <FileText className="text-white" size={20} />,
//     bgColor: 'bg-orange-400',
//     growth: '+3.2%',
//   },
//   {
//     title: 'Earnings',
//     value: '$1,250',
//     icon: <DollarSign className="text-white" size={20} />,
//     bgColor: 'bg-emerald-500',
//     growth: '+5.1%',
//   },
//   {
//     title: 'Upcoming Appointments',
//     value: 9,
//     icon: <Calendar className="text-white" size={20} />,
//     bgColor: 'bg-pink-500',
//     growth: '+2.4%',
//   },
// ];

// const DoctorDashboard = () => {
//   return (
//     <div className="p-6 w-full bg-gray-50 min-h-screen">
//       <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

//       {/* Stat Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         {statCards.map((card, index) => (
//           <div
//             key={index}
//             className={`flex items-center justify-between p-5 rounded-xl shadow ${card.bgColor} text-white`}
//           >
//             <div>
//               <h2 className="text-lg font-semibold">{card.title}</h2>
//               <p className="text-2xl font-bold mt-1">{card.value}</p>
//               <p className="text-sm mt-1">{card.growth} from last check-in</p>
//             </div>
//             <div className="ml-4">{card.icon}</div>
//           </div>
//         ))}
//       </div>

//       {/* Consultation Trends Graph */}
//       <div className="bg-white rounded-xl p-6 shadow mb-10">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-lg font-semibold text-gray-800">Consultation Trends</h2>
//           <select className="border rounded p-1 text-sm">
//             <option>This Week</option>
//             <option>This Month</option>
//           </select>
//         </div>
//         <ResponsiveContainer width="100%" height={300}>
//           <LineChart data={consultationData}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="day" />
//             <YAxis />
//             <Tooltip />
//             <Line
//               type="monotone"
//               dataKey="count"
//               stroke="#3b82f6"
//               strokeWidth={3}
//               activeDot={{ r: 8 }}
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Advertisement / Promo Section */}
//       <div className="relative bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl p-6 overflow-hidden shadow-md">
//         <div className="text-white z-10 relative max-w-lg">
//           <h2 className="text-3xl font-bold tracking-wide animate-pulse drop-shadow-md">
//             “We’ll Treat You Well” – Book Your Slot Today!
//           </h2>
//           <p className="mt-2 text-sm font-light">Aster MIMS Hospital</p>
//         </div>
//         <img
//           src={doctorImg}
//           alt="Doctor Promo"
//           className="absolute bottom-0 right-0 w-48 h-auto object-contain opacity-90"
//         />
//       </div>
//     </div>
//   );
// };

// export default DoctorDashboard;



//............................second ui.........................


import adminimg from "../../assets/doctorLogin.png"; // Replace with your actual image path
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "5k", value: 20 },
  { name: "10k", value: 40 },
  { name: "15k", value: 38 },
  { name: "20k", value: 64 },
  { name: "25k", value: 35 },
  { name: "30k", value: 42 },
  { name: "35k", value: 51 },
  { name: "40k", value: 25 },
  { name: "45k", value: 54 },
  { name: "50k", value: 48 },
  { name: "55k", value: 46 },
  { name: "60k", value: 50 },
];

interface SummaryCardProps {
  title: string;
  value: string;
  trend: string;
  trendColor: string;
  icon?: React.ReactNode;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, trend, trendColor }) => (
  <div className="bg-white rounded-xl p-4 shadow flex flex-col gap-2">
    <div className="flex justify-between items-center">
      <h4 className="text-sm text-gray-500 font-medium">{title}</h4>
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
        {/* Replace with icon logic if needed */}
        <span className="text-lg">📊</span>
      </div>
    </div>
    <div className="text-2xl font-semibold">{value}</div>
    <div className={`text-xs ${trendColor}`}>{trend}</div>
  </div>
);

const AdminDashboard = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Top Banner */}
      <div className="relative flex items-center justify-between bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl h-44 px-6 shadow-lg overflow-hidden">
        <div className="z-4 text-white max-w-md">
          <h2 className="text-3xl font-bold ">
            Aster MIMS HOSPITALS
          </h2>
          <p className="text-lg font-semibold mt-1">We’ll Treat You Well</p>
          <p className="text-sm mt-1">www.asterhospitals.in</p>
          <p className="text-sm">+91 3434 5656 999</p>
        </div>
        <img
          src={adminimg}
          alt="Doctors"
          className="absolute bottom-0 right-4 h-full max-h-44 object-contain z-0"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-6">
        <SummaryCard title="Total User" value="40,689" trend="8.5% Up from yesterday" trendColor="text-green-500" />
        <SummaryCard title="Total Doctors" value="10,293" trend="1.3% Up from past week" trendColor="text-green-500" />
        <SummaryCard title="Total Revenue" value="Rs89,000" trend="4.3% Down from yesterday" trendColor="text-red-500" />
        <SummaryCard title="Total Paid" value="Rs75,000" trend="1.8% Up from yesterday" trendColor="text-green-500" />
        <SummaryCard title="Total Consultation" value="5,343" trend="8.5% Up from yesterday" trendColor="text-green-500" />
      </div>

      {/* Sales Details Chart */}
      <div className="mt-6 p-6 bg-white rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Sales Details</h3>
          <select className="border px-3 py-1 rounded-md text-sm">
            <option>October</option>
            <option>September</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdminDashboard;



 