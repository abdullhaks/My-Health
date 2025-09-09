import { useEffect, useState } from "react";
import { getPayouts } from "../../api/admin/adminApi";
import { Table, Select, DatePicker, Button, Pagination, Tag, Modal, Form, Input, DatePicker as SingleDatePicker, InputNumber, Popconfirm, message } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import moment from "moment";
// Assuming updatePayout is added to adminApi
import { updatePayout } from "../../api/admin/adminApi";

interface Transaction {
  _id: string;
  bankAccNo: string;
  bankAccHolderName: string;
  bankIfscCode: string;
  totalAmount: number;
  paid: number;
  serviceAmount: number;
  status: string;
  transactionId?: string;
  invoiceLink?: string;
  on?: string;
  createdAt: string;
  updatedAt: string;
}

const { Option } = Select;
const { RangePicker } = DatePicker;

const AdminPayouts = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(5);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "requested",
    dateRange: null as [moment.Moment, moment.Moment] | null,
  });
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [form] = Form.useForm();

  const fetchTransactions = async (page: number) => {
    setLoading(true);
    try {
      const response = await getPayouts(page, limit, {
        status: filters.status,
        startDate: filters.dateRange ? filters.dateRange[0].toISOString() : undefined,
        endDate: filters.dateRange ? filters.dateRange[1].toISOString() : undefined,
      });
      setTransactions(response.payouts);
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

  useEffect(() => {
    if (selected && visible) {
      form.setFieldsValue({
        paid: selected.paid,
        transactionId: selected.transactionId || '',
        invoiceLink: selected.invoiceLink || '',
        on: moment(),
      });
    }
  }, [selected, visible, form]);

  const handleFilterChange = (key: string, value: string | [moment.Moment, moment.Moment] | null) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePay = (record: Transaction) => {
    setSelected(record);
    setVisible(true);
  };

  const onFinishPay = async (values: { paid:number; transactionId: string; invoiceLink: string; on: { toISOString: () => string; }; }) => {
    if (!selected) return;
    try {
      const updateData = {
        status: 'paid',
        paid: values.paid,
        transactionId: values.transactionId,
        invoiceLink: values.invoiceLink||"",
        on: values.on.toISOString(),
      };
      await updatePayout(selected._id, updateData);
      setVisible(false);
      fetchTransactions(currentPage);
    } catch (err) {
      console.error("Error updating payout:", err);
    }
  };

  const handleReject = async (record: Transaction) => {
    try {
      const updateData = {
        status: 'rejected',
        on: new Date().toISOString(),
      };
      const rewt = await updatePayout(record._id, updateData);
      console.log("rsrew. isslfjsd",rewt);
      setVisible(false);
      fetchTransactions(currentPage);
    } catch (err) {
      console.error("Error rejecting payout:", err);
      message.error("payment updation failed")
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => moment(date).format("MMM DD, YYYY h:mm A"),
    },
    {
      title: "Acc.No",
      dataIndex: "bankAccNo",
      key: "bankAccNo",
    },
    {
      title: "Name",
      dataIndex: "bankAccHolderName",
      key: "bankAccHolderName",
    },
    {
      title: "IFSC",
      dataIndex: "bankIfscCode",
      key: "bankIfscCode",
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => `Rs ${amount}`,
    },
    {
      title: "Paid",
      dataIndex: "paid",
      key: "paid",
      render: (amount: number) => `Rs ${amount}`,
    },
    {
      title: "Serv Amnt",
      dataIndex: "serviceAmount",
      key: "serviceAmount",
      render: (amount: number) => `Rs ${amount}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text: string) => {
        let color = 'blue';
        if (text === 'paid') color = 'green';
        if (text === 'rejected') color = 'red';
        return <Tag color={color}>{text.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Action Date",
      dataIndex: "on",
      key: "on",
      render: (date: string, record: Transaction) =>
        record.status !== 'requested' && date ? moment(date).format("MMM DD, YYYY h:mm A") : '-',
    },
    {
      title: "Trans Id",
      dataIndex: "transactionId",
      key: "transactionId",
      render: (text: string, record: Transaction) => {
        if (record.invoiceLink) {
          return (
            <a href={record.invoiceLink} target="_blank" rel="noopener noreferrer">
              {text || 'View'}
            </a>
          );
        }
        return text || 'N/A';
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (text: string, record: Transaction) => {
        if (record.status === 'requested') {
          return (
            <div className="flex gap-2">
              <Button type="primary" onClick={() => handlePay(record)}>
                Pay
              </Button>
              <Popconfirm
                title="Are you sure you want to reject this payout?"
                onConfirm={() => handleReject(record)}
                okText="Yes"
                cancelText="No"
              >
                <Button danger>Reject</Button>
              </Popconfirm>
            </div>
          );
        }
        return null;
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
            placeholder="Filter by Status"
            style={{ width: 200 }}
            value={filters.status}
            onChange={(value) => handleFilterChange("status", value)}
            allowClear
          >
            <Option value="requested">Requested</Option>
            <Option value="paid">Paid</Option>
            <Option value="rejected">Rejected</Option>
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

      {/* Pay Modal */}
      <Modal
        title="Update Payout Details"
        visible={visible}
        onCancel={() => setVisible(false)}
        onOk={form.submit}
      >
        <Form form={form} onFinish={onFinishPay} layout="vertical">
          <Form.Item name="paid" label="Paid Amount" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="transactionId" label="Transaction ID" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="invoiceLink" label="Invoice Link">
            <Input />
          </Form.Item>
          <Form.Item name="on" label="Action Date" rules={[{ required: true }]}>
            <SingleDatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPayouts;