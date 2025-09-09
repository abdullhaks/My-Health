import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { getDoctorAnalytics, getUserAnalytics, getTotalAnalytics, getTransactions } from "../../api/admin/adminApi";
import adminimg from "../../assets/doctorLogin.png";
import { FaCalendarCheck, FaUsers } from "react-icons/fa";
import { FaMoneyBillTransfer, FaMoneyBillTrendUp, FaUserDoctor } from "react-icons/fa6";
import { Table, DatePicker, Button, Pagination, Tag, message } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SummaryCardProps {
  title: string;
  value: string;
  trend: string;
  trendColor: string;
  icon?: React.ReactNode;
}

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

interface AnalyticsItem {
  name: string;
  value: number;
}

interface CombinedAnalyticsItem {
  name: string;
  users: number;
  doctors: number;
}

interface TotalAnalytics {
  totalConsultations: number;
  totalDoctors: number;
  totalPaid: number;
  totalRevenue: number;
  totalUsers: number;
}

interface Transaction {
  _id: string;
  createdAt: string;
  method: string;
  amount: number;
  paymentFor: string;
  // transactionId?: string;
  // userId?: string;
  // doctorId?: string;
}

interface TransactionsResponse {
  transactions: Transaction[];
  totalPages: number;
}

interface Filters {
  dateRange: [Dayjs, Dayjs] | null;
}

const AdminDashboard = () => {
  const [userData, setUserData] = useState<AnalyticsItem[]>([]);
  const [doctorData, setDoctorData] = useState<AnalyticsItem[]>([]);
  const [combinedData, setCombinedData] = useState<CombinedAnalyticsItem[]>([]);
  const [analyticsFilter, setAnalyticsFilter] = useState("day");
  const [totaldata, setTotalData] = useState<TotalAnalytics>({
    totalConsultations: 0,
    totalDoctors: 0,
    totalPaid: 0,
    totalRevenue: 0,
    totalUsers: 0,
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(2);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    dateRange: null,
  });

  useEffect(() => {
    const fetchTotalAnalytics = async () => {
      try {
        const response: TotalAnalytics = await getTotalAnalytics();
        setTotalData(response);
      } catch (error) {
        console.error("Failed to fetch total analytics:", error);
      }
    };
    fetchTotalAnalytics();
  }, []);

  useEffect(() => {
    const fetchUserAnalytics = async () => {
      try {
        const response: AnalyticsItem[] = await getUserAnalytics(analyticsFilter);
        setUserData(response);
      } catch (error) {
        console.error("Failed to fetch user analytics:", error);
      }
    };
    fetchUserAnalytics();
  }, [analyticsFilter]);

  useEffect(() => {
    const fetchDoctorAnalytics = async () => {
      try {
        const response: AnalyticsItem[] = await getDoctorAnalytics(analyticsFilter);
        setDoctorData(response);
      } catch (error) {
        console.error("Failed to fetch doctor analytics:", error);
      }
    };
    fetchDoctorAnalytics();
  }, [analyticsFilter]);

  useEffect(() => {
    if (userData.length > 0 && doctorData.length > 0 && userData.length === doctorData.length) {
      const combined: CombinedAnalyticsItem[] = userData.map((u, i) => ({
        name: u.name,
        users: u.value,
        doctors: doctorData[i].value,
      }));
      setCombinedData(combined);
    } else {
      setCombinedData([]);
    }
  }, [userData, doctorData]);

  const fetchTransactions = async (page: number) => {
    setLoading(true);
    try {
      const response: TransactionsResponse = await getTransactions(page, limit, {
        startDate: filters.dateRange ? filters.dateRange[0].toISOString() : undefined,
        endDate: filters.dateRange ? filters.dateRange[1].toISOString() : undefined,
      });
      setTransactions(response.transactions);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [currentPage, filters]);

  const handleFilterChange = (key: keyof Filters, value: [Dayjs, Dayjs] | null) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleDownload = async () => {
    if (!filters.dateRange) {
      message.warning("Please select a date range to download.");
      return;
    }
    try {
      const response: TransactionsResponse = await getTransactions(1, 10000, {
        startDate: filters.dateRange[0].toISOString(),
        endDate: filters.dateRange[1].toISOString(),
      });
      const allTransactions = response.transactions;

      const doc = new jsPDF();
      autoTable(doc, {
        head: [['Date', 'Method', 'Amount', 'Payment For']],
        body: allTransactions.map((t: Transaction) => [
          dayjs(t.createdAt).format("MMM DD, YYYY h:mm A"),
          t.method,
          `Rs ${t.amount}`,
          t.paymentFor,
        ]),
      });
      doc.save(`admin_revenue_${dayjs().format('YYYYMMDD')}.pdf`);
    } catch (err) {
      console.error("Error downloading PDF:", err);
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => dayjs(date).format("MMM DD, YYYY h:mm A"),
    },
    {
      title: "Method",
      dataIndex: "method",
      key: "method",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => `Rs ${amount}`,
    },
    {
      title: "Payment For",
      dataIndex: "paymentFor",
      key: "paymentFor",
      render: (text: string) => <Tag color="blue">{text.toUpperCase()}</Tag>,
    },
  ];

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

      {/* Transaction Listing */}
      <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Admin Revenue Transactions</h3>
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <FilterOutlined className="text-gray-600" />
            <DatePicker.RangePicker
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  handleFilterChange(
                    "dateRange",
                    [dates[0], dates[1]]
                  );
                } else {
                  handleFilterChange("dateRange", null);
                }
              }}
              format="YYYY-MM-DD"
            />
          </div>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => fetchTransactions(currentPage)}
          >
            Apply Filters
          </Button>
          <Button onClick={handleDownload}>
            Download PDF
          </Button>
        </div>
        <Table
          dataSource={transactions}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={false}
        />
        <div className="mt-6 flex justify-end">
          <Pagination
            current={currentPage}
            total={totalPages * limit}
            pageSize={limit}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        </div>
      </div>

      {/* Combined Analytics Chart */}
      <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">User & Doctor Analytics</h3>
          <select
            className="border border-gray-300 px-4 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            value={analyticsFilter}
            onChange={(e) => setAnalyticsFilter(e.target.value)}
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={combinedData.length > 0 ? combinedData : [{ name: "", users: 0, doctors: 0 }]}>
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 5, fill: "#3b82f6" }}
            />
            <Line
              type="monotone"
              dataKey="doctors"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 5, fill: "#10b981" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdminDashboard;
