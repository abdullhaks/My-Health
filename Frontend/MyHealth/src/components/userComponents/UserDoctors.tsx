import { useEffect, useState } from 'react';
import { fetchingDoctors } from '../../api/user/userApi';
import { useNavigate } from 'react-router-dom';
import { IDoctor } from '../../interfaces/doctor';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 3 ; 
  const [loading, setLoading] = useState(false);
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
      const res = await fetchingDoctors({ searchTerm, location, category, sortBy, page, limit });

      console.log("doctors response is :",res);
      setDoctors(res.doctors);
      setTotalPages(res.totalPages);
      setPage(res.page)
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleDoctorClick = (doctor: IDoctor) => {
    navigate(`/user/doctor-details/${doctor._id}`, { state: { doctor } });
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
            <option value="General Physician">General Physician</option>
            <option value="Cardiologist">Cardiologist</option>
            <option value="Dermatologist">Dermatologist</option>
            <option value="Endocrinologist">Endocrinologist</option>
            <option value="Gastroenterologist">Gastroenterologist</option>
            <option value="Neurologist">Neurologist</option>
            <option value="Nephrologist">Nephrologist</option>
            <option value="Oncologist">Oncologist</option>
            <option value="Orthopedic Surgeon">Orthopedic Surgeon</option>
            <option value="Pediatrician">Pediatrician</option>
            <option value="Psychiatrist">Psychiatrist</option>
            <option value="Pulmonologist">Pulmonologist</option>
            <option value="Radiologist">Radiologist</option>
            <option value="Rheumatologist">Rheumatologist</option>
            <option value="Surgeon">Surgeon</option>
            <option value="Urologist">Urologist</option>
            <option value="ENT Specialist">ENT Specialist</option>
            <option value="Ophthalmologist">Ophthalmologist</option>
            <option value="Gynecologist">Gynecologist</option>
            <option value="Dentist">Dentist</option>
            <option value="Physiotherapist">Physiotherapist</option>
            <option value="Dietitian/Nutritionist">Dietitian/Nutritionist</option>
            <option value="Emergency Medicine">Emergency Medicine</option>
            <option value="Pathologist">Pathologist</option>
            <option value="Family Medicine">Family Medicine</option>
            <option value="Hematologist">Hematologist</option>
            <option value="Plastic Surgeon">Plastic Surgeon</option>
            <option value="Anesthesiologist">Anesthesiologist</option>
            <option value="Sports Medicine">Sports Medicine</option>
            <option value="Other">Other</option>
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
            doctors.map((doc: IDoctor) => (
              <div
                key={doc._id}
                className="flex items-center gap-4 p-4 bg-white rounded shadow cursor-pointer hover:bg-gray-50 transition"
                onClick={() => handleDoctorClick(doc)}
              >
                <img
                  src={doc.profile || 'https://myhealth-app-storage.s3.ap-south-1.amazonaws.com/users/profile-images/avatar.png'}
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
    </div>
  );
};

export default Doctors;