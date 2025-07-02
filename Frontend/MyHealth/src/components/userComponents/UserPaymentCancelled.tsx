import { useNavigate } from "react-router-dom";

const UserPaymentCancelled = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-red-600 mb-6">Payment Cancelled</h2>
        <p className="text-gray-600 mb-4">Your payment was not completed. Please try again.</p>
        <button
          onClick={() => navigate("/user/dashboard")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again After Some Time Later
        </button>
      </div>
    </div>
  );
};

export default UserPaymentCancelled;