
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const DoctorPaymentCancelled = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 flex items-center justify-center p-8">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full text-center animate-fade-in">
        <div className="flex justify-center mb-6">
          <XCircle className="text-red-500 w-20 h-20 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Payment Cancelled</h2>
        <p className="text-gray-600 mt-2">
          Your payment was not completed. Please try again or contact support.
        </p>
        <button
          onClick={() => navigate('/doctor/subscriptions')} // Or wherever plans are shown
          className="mt-6 w-full py-3 cursor-pointer text-white font-semibold rounded-xl bg-gradient-to-r from-purple-700 to-pink-500 hover:opacity-90 transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default DoctorPaymentCancelled;