import { useEffect, useState } from "react";
import { fetchingDoctors } from "../../api/user/userApi";

const Doctors = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  // const [nearbyDoctors, setNearbyDoctors] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchDoctors();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, location, category, sortBy, page]);

  const fetchDoctors = async () => {
    try {

        console.log("fetching......");
        
      setLoading(true);
      const res = await fetchingDoctors({searchTerm, location, category, sortBy, page, limit: 10})
   

      console.log("res from frontend is...",res);
      
      setDoctors(res.doctors);
      setTotalPages(Math.ceil(res.total / 10));
    //   setNearbyDoctors(res.data.nearby); 
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage:any) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="p-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Left Section (Main Content) */}
      <div className="lg:col-span-3 space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Doctors and Centers</h2>

        {/* Search & Filters */}
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

        {/* Doctors List */}
        <div className="space-y-4">
          {loading ? (
            <p>Loading doctors...</p>
          ) : doctors.length === 0 ? (
            <p>No doctors found.</p>
          ) : (
            doctors.map((doc) => (
              <div
                key={doc._id}
                className="flex items-center gap-4 p-4 bg-white rounded shadow cursor-pointer"
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

        {/* Pagination */}
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

      {/* Nearby Doctors Sidebar */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Nearby Doctors</h3>
        {/* {nearbyDoctors.map((doc) => (
          <div key={doc._id} className="flex items-center gap-3 bg-white p-2 rounded shadow">
            <img
              src={doc.profile || "/default-avatar.png"}
              alt="Nearby Doctor"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h4 className="text-sm font-medium">{doc.fullName}</h4>
              <p className="text-xs text-gray-500">{doc.category} | {doc.experience} yrs</p>
            </div>
          </div>
        ))} */}
      </div>
    </div>
  );
};

export default Doctors;
