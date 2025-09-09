// src/components/doctorComponents/DoctorPaymentSuccess.tsx
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { updateDoctor } from '../../redux/slices/doctorSlices';
import { verifySubscription } from '../../api/doctor/doctorApi';
import Loader from '../../sharedComponents/Loaders';
import { IDoctorData } from '../../interfaces/doctor';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const dispatch = useDispatch();
  const doctor = useSelector((state: IDoctorData) => state.doctor.doctor);
  const [verifying, setVerifying] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleVerifyPayment = async () => {
    if (!sessionId) {
      toast.error('Invalid session. Please try again.');
      return;
    }
    setVerifying(true);
    try {
      const response = await verifySubscription(sessionId, doctor._id);
      if (response && response.doctor) {
        setLoading(true);

        dispatch(
          updateDoctor({
            ...doctor,
            premiumMembership: true,
            subscriptionId: response.doctor.subscriptionId,
          })
        );

        toast.success('Subscription verified! Explore MyHealth premium features.');
        setTimeout(() => {
          setLoading(false);
          navigate('/doctor/dashboard');
        }, 4000);
      } else {
        toast.error('Subscription verification failed. Please contact support.');
        setTimeout(() => navigate('/doctor/dashboard'), 2000);
      }
    } catch (error) {
      toast.error('Verification failed.Please contact support.');
      setTimeout(() => navigate('/doctor/dashboard'), 3000);
    } finally {
      setVerifying(false);
    }
  };


  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
      <h1 className="text-2xl font-semibold text-gray-800">Payment Successful</h1>
      <p className="text-gray-600 mb-6">
        Click below to verify your subscription and start exploring premium features.
      </p>
      <button
        onClick={handleVerifyPayment}
        disabled={verifying || !sessionId}
        className={`px-6 py-3 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition ${
          verifying ? 'opacity-60 cursor-not-allowed' : ''
        }`}
      >
        {verifying ? 'Verifying...' : 'Verify and Explore MyHealth'}
      </button>
    </div>
  );
};

export default PaymentSuccess;
