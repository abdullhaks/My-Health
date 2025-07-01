import { useEffect, useState } from "react";
import { fetchingDoctors } from "../../api/user/userApi";
import { useNavigate } from "react-router-dom";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchDoctors();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, location, category, sortBy, page]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await fetchingDoctors({ searchTerm, location, category, sortBy, page, limit: 10 });
      setDoctors(res.doctors);
      setTotalPages(Math.ceil(res.total / 10));
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleDoctorClick = (doctor: any) => {
    setSelectedDoctor(doctor);
  };

  const closeModal = () => {
    setSelectedDoctor(null);
  };

  const handleChatClick = (doctorId: string) => {
    navigate("/chat", { state: { doctorId } });
  };

  const handleBookAppointment = (doctorId: string) => {
    navigate("/user/doctor-appointment-slots", { state: { doctorId } });
  };

  return (
    <div className="p-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
      <div className="lg:col-span-3 space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Doctors and Centers</h2>
        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            placeholder="Find doctors and take an appointment"
            className="w-full px-4 py-2 border rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <input
            type="text"
            placeholder="Location"
            className="w-full px-4 py-2 border rounded"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <select
            className="w-full px-4 py-2 border rounded"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Pediatric">Pediatric</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Dermatology">Dermatology</option>
          </select>
          <select
            className="w-full px-4 py-2 border rounded"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">Sort By</option>
            <option value="experience">Experience</option>
            <option value="alphabet">Name</option>
          </select>
        </div>
        <div className="space-y-4">
          {loading ? (
            <p>Loading doctors...</p>
          ) : doctors.length === 0 ? (
            <p>No doctors found.</p>
          ) : (
            doctors.map((doc: any) => (
              <div
                key={doc._id}
                className="flex items-center gap-4 p-4 bg-white rounded shadow cursor-pointer hover:bg-gray-50 transition"
                onClick={() => handleDoctorClick(doc)}
              >
                <img
                  src={doc.profile || "https://myhealth-app-storage.s3.ap-south-1.amazonaws.com/users/profile-images/avatar.png"}
                  alt="Doctor"
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-semibold">Dr. {doc.fullName}</h3>
                  <p className="text-sm text-gray-600">
                    {doc.category} specialist | {doc.experience} years experience
                  </p>
                  <span className="inline-block mt-1 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                    {doc.category}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-4 gap-2">
            <button
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
            >
              Prev
            </button>
            <span className="px-4">{page} / {totalPages}</span>
            <button
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              disabled={page === totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Nearby Doctors</h3>
      </div>
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Doctor Details</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <img
                src={selectedDoctor.profile || "https://myhealth-app-storage.s3.ap-south-1.amazonaws.com/users/profile-images/avatar.png"}
                alt="Doctor"
                className="w-24 h-24 rounded-full object-cover"
              />
              <div>
                <h3 className="text-xl font-semibold">Dr. {selectedDoctor.fullName}</h3>
                <p className="text-sm text-gray-600">{selectedDoctor.category} Specialist</p>
                {selectedDoctor.premiumMembership && (
                  <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                    Premium Member
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <p><span className="font-semibold">Experience:</span> {selectedDoctor.experience} years</p>
              <p><span className="font-semibold">Location:</span> {selectedDoctor.location.text}</p>
              <p><span className="font-semibold">Qualification:</span> {selectedDoctor.graduation.toUpperCase()}</p>
              <p><span className="font-semibold">Registration No:</span> {selectedDoctor.registerNo}</p>
              <p><span className="font-semibold">Gender:</span> {selectedDoctor.gender}</p>
              <p><span className="font-semibold">Contact:</span> {selectedDoctor.phone}</p>
              <p><span className="font-semibold">Email:</span> {selectedDoctor.email}</p>
            </div>
            {selectedDoctor && selectedDoctor.premiumMembership && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => handleBookAppointment(selectedDoctor._id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Book Appointment
                </button>
                <button
                  onClick={() => handleChatClick(selectedDoctor._id)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  Chat
                </button>
                <button
                  onClick={() => navigate("/user/health-report-analysis", { state: { doctor: selectedDoctor } })}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                >
                  Report Analysis
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;