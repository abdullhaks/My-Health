

import { useEffect, useState } from "react";
import { getTransactions } from "../../api/user/userApi"; 
import { Table, Select, DatePicker, Button, Pagination } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import moment from "moment";
import { useSelector } from "react-redux";
import { IUserData } from "../../interfaces/user";

interface Transaction {
  _id: string;
  from: string;
  to: string;
  method: string;
  amount: number;
  paymentFor: string;
  transactionId?: string;
  userId?: string;
  doctorId?: string;
  invoice?:string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

const { Option } = Select;
const { RangePicker } = DatePicker;

const UserTransactions = () => {
  const user = useSelector((state: IUserData) => state.user.user);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(5);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    method: "",
    paymentFor: "",
    dateRange: null as [moment.Moment, moment.Moment] | null,
  });

  const fetchTransactions = async (page: number) => {
    setLoading(true);
    try {
      const response = await getTransactions(user._id,page, limit, {
        method: filters.method,
        paymentFor: filters.paymentFor,
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

  const handleFilterChange = (key: string, value: string | [moment.Moment, moment.Moment] | null) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const columns = [
    {
      title: "From",
      dataIndex: "from",
      key: "from",
      render: (text: string) => text.charAt(0).toUpperCase() + text.slice(1),
    },
    {
      title: "To",
      dataIndex: "to",
      key: "to",
      render: (text: string) => text.charAt(0).toUpperCase() + text.slice(1),
    },
    {
      title: "Method",
      dataIndex: "method",
      key: "method",
      render: (text: string) => text.charAt(0).toUpperCase() + text.slice(1),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => `Rs ${amount}`,
    },
    {
      title: "Purpose",
      dataIndex: "paymentFor",
      key: "paymentFor",
      render: (text: string) => text.charAt(0).toUpperCase() + text.slice(1),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => moment(date).format("MMM DD, YYYY h:mm A"),
    },
    {
      title: "Transaction ID",
      dataIndex: "transactionId",
      key: "transactionId",
      render:(text: string, record: Transaction) => {
    if (record.invoice) {
      return (
        <a href={record.invoice} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      );
    }
    return text || "N/A";
  },
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Admin Transactions</h2>
      
      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <FilterOutlined className="text-gray-600" />
          <Select
            placeholder="Filter by Method"
            style={{ width: 200 }}
            onChange={(value) => handleFilterChange("method", value)}
            allowClear
          >
            <Option value="stripe">Stripe</Option>
            <Option value="wallet">Wallet</Option>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <FilterOutlined className="text-gray-600" />
          <Select
            placeholder="Filter by Purpose"
            style={{ width: 200 }}
            onChange={(value) => handleFilterChange("paymentFor", value)}
            allowClear
          >
           
            <Option value="appointment">Appointment</Option>
            <Option value="analysis">Analysis</Option>
            <Option value="refund">Refund</Option>
           
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
          onClick={() => fetchTransactions(currentPage)}
        >
          Apply Filters
        </Button>
      </div>

      {/* Table */}
      <Table
        dataSource={transactions}
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

export default UserTransactions;