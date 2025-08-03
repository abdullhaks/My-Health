import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getDoctorAppointments } from "../../api/doctor/doctorApi";
import { Popconfirm, message, Table, Select, DatePicker, Button, Pagination } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import moment from "moment";

interface IAppointment {
  _id: string;
  userId: string;
  doctorId: string;
  slotId: string;
  start: string;
  end: string;
  duration: number;
  fee: number;
  appointmentStatus: "booked" | "cancelled" | "completed" | "pending";
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  stripeSessionId: string;
  userName: string;
  userEmail: string;
  doctorName: string;
  doctorCategory: string;
  createdAt: string;
  updatedAt: string;
}

const { Option } = Select;
const { RangePicker } = DatePicker;

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(5);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [filters, setFilters] = useState({
    appointmentStatus: "booked",
    dateRange: null as [moment.Moment, moment.Moment] | null,
  });
  const doctor = useSelector((state: any) => state.doctor.doctor);
  const navigate = useNavigate();

  const fetchAppointments = async (page: number) => {
    setLoading(true);
    try {
      const response = await getDoctorAppointments(doctor._id, page, limit, {
        appointmentStatus: filters.appointmentStatus,
        startDate: filters.dateRange ? filters.dateRange[0].toISOString().split("T")[0] : undefined,
        endDate: filters.dateRange ? filters.dateRange[1].toISOString().split("T")[0] : undefined,
      });
      setAppointments(response.appointments || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setErrorMessage(
        (typeof error === "object" && error !== null && "response" in error && (error as any).response?.data?.message) ||
          "Failed to load appointments. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doctor._id) fetchAppointments(currentPage);
  }, [doctor._id, currentPage, filters]);

  const handleFilterChange = (key: string, value: string | [moment.Moment, moment.Moment] | null) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleCancel = async (appointmentId: string) => {
    try {
      setLoading(true);
      // Uncomment and implement cancelAppointment API when available
      // const response = await cancelAppointment(appointmentId);
      // if (response.status) {
      //   message.success(response.message);
      //   setAppointments((prev) =>
      //     prev.map((appt) =>
      //       appt._id === appointmentId
      //         ? { ...appt, appointmentStatus: "cancelled", paymentStatus: "failed" }
      //         : appt
      //     )
      //   );
      // } else {
      //   message.error(response.message);
      // }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      setErrorMessage(
        (typeof error === "object" && error !== null && "response" in error && (error as any).response?.data?.message) ||
          "Failed to cancel appointment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = (appointmentId: string, appointment: IAppointment) => {
    navigate(`/doctor/video-call/${appointmentId}`, { state: { appointment } });
  };

  const isJoinable = (start: string, end: string) => {
    // const now = new Date().getTime();
    // const startTime = new Date(start).getTime();
    // const endTime = new Date(end).getTime();
    // const buffer = 5 * 60 * 1000; // 5-minute buffer
    // return now >= startTime - buffer && now <= endTime + buffer;

    return true;
  };

  const columns = [
    {
      title: "User Name",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "Email",
      dataIndex: "userEmail",
      key: "userEmail",
    },
    {
      title: "Date & Time",
      key: "dateTime",
      render: (_: any, record: IAppointment) =>
        `${moment(record.start).format("MMM DD, YYYY h:mm A")} - ${moment(record.end).format("h:mm A")}`,
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      render: (duration: number) => `${duration} minutes`,
    },
    {
      title: "Fee",
      dataIndex: "fee",
      key: "fee",
      render: (fee: number) => `₹${fee}`,
    },
    {
      title: "Status",
      dataIndex: "appointmentStatus",
      key: "appointmentStatus",
      render: (status: string) => status.charAt(0).toUpperCase() + status.slice(1),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: IAppointment) => (
        <div className="flex gap-2">
          {record.appointmentStatus === "booked" && (
            <button
              onClick={() => handleJoin(record._id, record)}
              disabled={!isJoinable(record.start, record.end)}
              className={`px-4 py-1 rounded-lg text-white font-medium transition-colors ${
                isJoinable(record.start, record.end)
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Join
            </button>
          )}
          {record.appointmentStatus === "booked" && (
            <Popconfirm
              title="Cancel Appointment"
              description="Are you sure to cancel this appointment?"
              onConfirm={() => handleCancel(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <button
                disabled={loading || record.appointmentStatus !== "booked"}
                className={`px-4 py-1 rounded-lg text-white font-medium transition-colors ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Cancel
              </button>
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">My Appointments</h2>

        {/* Filters */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <FilterOutlined className="text-gray-600" />
            <Select
              placeholder="Filter by Status"
              style={{ width: 200 }}
              value={filters.appointmentStatus}
              onChange={(value) => handleFilterChange("appointmentStatus", value)}
              allowClear
            >
              <Option value="booked">Booked</Option>
              <Option value="cancelled">Cancelled</Option>
              <Option value="completed">Completed</Option>
              
            </Select>
          </div>
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

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">{errorMessage}</div>
        )}

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
    </div>
  );
};

export default DoctorAppointments;