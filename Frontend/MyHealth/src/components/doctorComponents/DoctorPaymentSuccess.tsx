import { useSearchParams, useNavigate } from 'react-router-dom';
import {  useState } from 'react';
import { CheckCircle } from 'lucide-react';
// import axios from 'axios';
import { toast } from 'react-toastify';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [verifying, setVerifying] = useState(false);
  const navigate = useNavigate();

  const handleVerifyPayment = async () => {
    if (!sessionId) return toast.error('Missing session ID');
    try {
      setVerifying(true);
    //   const response = await axios.post('/api/doctor/verify-payment', { sessionId });
      toast.success('Payment verified successfully!');
      navigate('/doctor/dashboard');
    } catch (error) {
      toast.error('Payment verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 flex items-center justify-center p-8">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full text-center animate-fade-in">
        <div className="flex justify-center mb-6">
          <CheckCircle className="text-green-500 w-20 h-20 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Payment Successful!</h2>
        <p className="text-gray-600 mt-2">
          Thank you for upgrading. Please verify the payment to activate MyHealth premium features.
        </p>

        <button
          onClick={handleVerifyPayment}
          disabled={verifying}
          className={`mt-6 w-full py-3 text-white font-semibold rounded-xl bg-gradient-to-r from-purple-700 to-pink-500 hover:opacity-90 transition ${
            verifying ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        >
          {verifying ? 'Verifying...' : 'Verify Payment'}
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
