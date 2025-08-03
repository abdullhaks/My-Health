import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'antd'; // Using Ant Design for consistent buttons

interface Doctor {
  _id: string;
  fullName: string;
  category: string;
  experience: number;
  location: { text: string };
  graduation: string;
  registerNo: string;
  gender: string;
  phone: string;
  email: string;
  profile?: string;
  premiumMembership: boolean;
  offlineAvailability?: {
    offlineLocation: string;
    googleMapLink: string;
    bookingNumber: string;
  };
}

const UserDoctorDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const doctor: Doctor = location.state?.doctor;

  if (!doctor) {
    return (
      <div className="p-4 text-center text-red-500">
        No doctor data available. Please select a doctor.
      </div>
    );
  }

  const handleBookAppointment = () => {
    navigate('/user/doctor-appointment-slots', { state: { doctorId: doctor._id } });
  };

  const handleChatClick = () => {
    navigate('/chat', { state: { doctorId: doctor._id } });
  };

  const handleReportAnalysis = () => {
    navigate('/user/health-report-analysis', { state: { doctor } });
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Doctor Details</h2>
          <Button
            onClick={() => navigate(-1)} // Go back to previous page
            className="text-gray-500 hover:text-gray-700 border-none"
          >
            ✕ Close
          </Button>
        </div>
        <div className="flex items-center gap-4 mb-6">
          <img
            src={doctor.profile || 'https://myhealth-app-storage.s3.ap-south-1.amazonaws.com/users/profile-images/avatar.png'}
            alt={doctor.fullName}
            className="w-24 h-24 rounded-full object-cover"
          />
          <div>
            <h3 className="text-xl font-semibold">Dr. {doctor.fullName}</h3>
            <p className="text-sm text-gray-600">{doctor.category} Specialist</p>
            {doctor.premiumMembership && (
              <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                Premium Member
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-700">Personal Information</h4>
            <p>
              <span className="font-semibold">Experience:</span> {doctor.experience} years
            </p>
            <p>
              <span className="font-semibold">Location:</span> {doctor.location.text}
            </p>
            <p>
              <span className="font-semibold">Qualification:</span> {doctor.graduation.toUpperCase()}
            </p>
            <p>
              <span className="font-semibold">Registration No:</span> {doctor.registerNo}
            </p>
            <p>
              <span className="font-semibold">Gender:</span> {doctor.gender}
            </p>
            <p>
              <span className="font-semibold">Contact:</span> {doctor.phone}
            </p>
            <p>
              <span className="font-semibold">Email:</span> {doctor.email}
            </p>
          </div>
          {doctor.offlineAvailability && (
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-gray-700">Offline Availability</h4>
              <p>
                <span className="font-semibold">Location:</span>{' '}
                {doctor.offlineAvailability.offlineLocation}
              </p>
              <p>
                <span className="font-semibold">Google Map:</span>{' '}
                <a
                  href={doctor.offlineAvailability.googleMapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View on Google Maps
                </a>
              </p>
              <p>
                <span className="font-semibold">Booking Number:</span>{' '}
                {doctor.offlineAvailability.bookingNumber}
              </p>
            </div>
          )}
        </div>
        {doctor.premiumMembership && (
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleBookAppointment}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Book Appointment
            </button>
            <button
              onClick={handleChatClick}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Chat
            </button>
            <button
              onClick={handleReportAnalysis}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Report Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDoctorDetails;