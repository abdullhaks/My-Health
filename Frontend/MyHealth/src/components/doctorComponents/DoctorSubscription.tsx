import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaCheckCircle } from 'react-icons/fa';
import { loadStripe } from '@stripe/stripe-js';
import { handlePayment , getSubscriptions} from '../../api/doctor/doctorApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store/store';


type Plan = {
  id: string;
  name?: string;
  active: boolean;
  description?: string;
  default_price?: {
    id: string;
    unit_amount: number;
    currency: string;
    recurring?: {
      interval: string;
    };
  };
};

const DoctorSubscriptionPlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const doctor = useSelector((state: RootState) => state.doctor.doctor);
  const isPremium = doctor?.premiumMembership;

  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await getSubscriptions();
      if(response.data.length){
      console.log("ksjfdsk jsoifjsdiofjjsjfoi lskfj----------------",response.data);
      let existingPlans = response.data.filter((plan: Plan) => plan.active);
      
      setPlans(existingPlans);
      setLoading(false);
      }
    } catch (error) {
      toast.error('Failed to fetch subscription plans');
      setLoading(false);
    }
  };

  const handleCheckout = async (priceId: string) => {
    if (isPremium) {
      toast.info('You are already a premium member');
      return;
    };

    if(!doctor||!doctor._id){
      toast.info('Subscription failed');
      return;
    }
    try {
      const data = await handlePayment(priceId, {
        doctorId: doctor?._id,
        type: 'subscription',
        role: 'doctor',
      });
      const stripe = await stripePromise;
      if (stripe && data.url) {
        console.log("stripe is opening......");
        window.location.href = data.url;
      }
    } catch (error) {
      toast.error('Failed to initiate payment');
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <h3 className="text-lg font-semibold mb-3">Subscription Plans</h3>
      {loading ? (
        <p className="text-gray-600">Loading plans...</p>
      ) : plans.length === 0 ? (
        <p className="text-gray-600">No plans available</p>
      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {
          
          
          plans.map((plan, idx) => (
            <div
              key={plan.id}
              className={`bg-white p-6 rounded-xl shadow-lg text-center relative ${
                idx === 1 ? 'border-2 border-purple-500' : ''
              }`}
            >
              {idx === 1 && (
                <span className="absolute top-0 left-0 right-0 bg-purple-700 text-white py-1 text-sm font-bold tracking-wider rounded-t-xl">
                  POPULAR
                </span>
              )}
              <h3 className="text-xl font-semibold mt-4">
                {plan.name || 'Unnamed Plan'}
              </h3>
              <p className="text-3xl font-bold mt-2">
                {plan.default_price
                  ? `${(plan.default_price.unit_amount / 100).toFixed(2)} ${plan.default_price.currency.toUpperCase()}`
                  : 'N/A'}
                <span className="text-sm font-normal">
                  {plan.default_price?.recurring?.interval
                    ? `/${plan.default_price.recurring.interval}`
                    : '/one-time'}
                </span>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {plan.description || 'No description available'}
              </p>
              <ul className="text-sm text-left mt-4 space-y-2">
                <li className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  Online consultations with secure video calls
                </li>
                <li className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  Report analysis service
                </li>
                <li className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  Advertisement service
                </li>
              </ul>
              <button
                onClick={() =>
                  handleCheckout(
                    plan.default_price?.id || ""
                  )
                }
                className={`mt-5 px-4 py-2 rounded-md w-full ${
                  isPremium || !plan.default_price
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700 transition'
                }`}
                disabled={isPremium || !plan.default_price}
              >
                {isPremium ? 'Already Subscribed' : 'Buy Now'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorSubscriptionPlans;