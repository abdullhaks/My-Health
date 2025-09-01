import { useEffect, useState } from "react";
import { getAppointments } from "../../api/admin/adminApi";
import { Table, Select, DatePicker, Button, Pagination } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import moment from "moment";

interface Appointment {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  doctorId: string;
  doctorName: string;
  doctorCategory: string;
  date: string;
  start: string;
  end: string;
  duration: number;
  fee: number;
  paymentStatus: string;
  paymentType: string;
  appointmentStatus: string;
  callStartTime?: string;
  createdAt: string;
  updatedAt: string;
  slotId: string;
}

const { Option } = Select;
const { RangePicker } = DatePicker;

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(2);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
 
    dateRange: null as [moment.Moment, moment.Moment] | null,
  });

  const fetchAppointments = async (page: number) => {
    setLoading(true);
    try {
      const response = await getAppointments(page, limit, {
        status: filters.status,
        startDate: filters.dateRange ? filters.dateRange[0].toISOString() : undefined,
        endDate: filters.dateRange ? filters.dateRange[1].toISOString() : undefined,
      });
      setAppointments(response.appointments);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(currentPage);
  }, [currentPage, filters]);

  const handleFilterChange = (key: string, value: string | [moment.Moment, moment.Moment] | null) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const columns = [
    {
      title: "Patient",
      dataIndex: "userName",
      key: "userName",
      render: (text: string, record: Appointment) => `${record.userName}`,
    },
    {
      title: "Doctor",
      dataIndex: "doctorName",
      key: "doctorName",
      render: (text: string, record: Appointment) => `Dr.${record.doctorName}`,
    },

    {
      title: "Date & Time",
      dataIndex: "date",
      key: "date",
      render: (text: string, record: Appointment) =>
        `${moment(record.date).format("MMM DD, YYYY")} ${moment(record.start).format("h:mm A")}`,
    },

    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      render: (duration: number) => `${duration} mins`,
    },

    {
      title: "Fee",
      dataIndex: "fee",
      key: "fee",
      render: (fee: number) => `Rs ${fee}`,
    },

    {
      title: "Payment Status",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (status: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            status === "completed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {status}
        </span>
      ),
    },
    {
      title: "Appointment Status",
      dataIndex: "appointmentStatus",
      key: "appointmentStatus",
      render: (status: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            status === "booked" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
          }`}
        >
          {status}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Admin Appointments</h2>
      
      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <FilterOutlined className="text-gray-600" />
          <Select
            placeholder="Filter by Status"
            style={{ width: 200 }}
            onChange={(value) => handleFilterChange("status", value)}
            allowClear
          >
            <Option value="booked">Booked</Option>
            <Option value="completed">Completed</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
        </div>

        {/* Doctor Category Filter - Uncomment if needed 
        <div className="flex items-center gap-2">
          <FilterOutlined className="text-gray-600" />
          <Select
            placeholder="Filter by Category"
            style={{ width: 200 }}
            onChange={(value) => handleFilterChange("doctorCategory", value)}
            allowClear
          >
            <Option value="GENERAL">General</Option>
            <Option value="CARDIOLOGY">Cardiology</Option>
            <Option value="PEDIATRICS">Pediatrics</Option>
            <Option value="DERMATOLOGY">Dermatology</Option>
          </Select>
        </div>
        */}

        <div className="flex items-center gap-2">
          <FilterOutlined className="text-gray-600" />
          <RangePicker
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                handleFilterChange("dateRange", [moment(dates[0].toDate()), moment(dates[1].toDate())]);
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
          onClick={() => fetchAppointments(currentPage)}
        >
          Apply Filters
        </Button>
      </div>

      {/* Table */}
      <Table
        dataSource={appointments}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={false}
        className="bg-white rounded-lg shadow-sm"
      />

      {/* Pagination */}
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
  );
};

export default AdminAppointments;