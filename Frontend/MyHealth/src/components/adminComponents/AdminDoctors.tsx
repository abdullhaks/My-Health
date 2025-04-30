import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaLock, FaUnlock, FaSearch ,FaCheck} from "react-icons/fa";
import { getDoctors } from "../../api/admin/adminApi";

interface Doctor {
  _id: string;
  fullName: string;
  email: string;
  isBlocked: boolean;
  adminVerified:number
}

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const limit = 5;

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await getDoctors( search, page, limit );
      setDoctors(response.doctors);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUnblock = async (id: string, isBlocked: boolean) => {
    try {
      const url = isBlocked
        ? `/api/admin/doctors/${id}/unblock`
        : `/api/admin/doctors/${id}/block`;

      await axios.patch(url, {}, { withCredentials: true });

      toast.success(`Doctors ${isBlocked ? "unblocked" : "blocked"} successfully`);
      fetchDoctors(); // Refresh the list
    } catch (error) {
      console.error(error);
      toast.error("Action failed");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDoctors();
  };

  useEffect(() => {
    fetchDoctors();
  }, [page]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold text-green-700 mb-4">Manage Doctors</h1>

      <form onSubmit={handleSearch} className="flex items-center mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email"
          className="border border-gray-300 p-2 rounded-l-md w-full max-w-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="submit"
          className="bg-green-600 text-white p-2 rounded-r-md hover:bg-green-700"
        >
          <FaSearch />
        </button>
      </form>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-md shadow-md">
            <thead className="bg-green-100">
              <tr>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {doctors.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-gray-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                doctors.map((doctor) => (
                  <tr key={doctor._id} className="border-b">
                    <td className="py-3 px-4">Dr.{doctor.fullName}</td>
                    <td className="py-3 px-4">{doctor.email}</td>
                    

                    <td className="py-3 px-4">
                      {doctor.adminVerified === 0 ? (
                        <button className="px-4 py-1 rounded-md text-white bg-blue-500 hover:bg-blue-700">
                          <span className="flex items-center justify-center">
                            <FaCheck className="mr-1" /> Verify
                          </span>
                        </button>
                      ) : doctor.adminVerified === 1 ? (
                        <span className="text-green-600 font-semibold">Verified</span>
                      ) : (
                        <span className="text-red-600 font-semibold">Rejected</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleBlockUnblock(doctor._id, doctor.isBlocked)}
                        className={`px-4 py-1 rounded-md text-white ${
                          doctor.isBlocked ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"
                        }`}
                      >
                        {doctor.isBlocked ? (
                          <span className="flex items-center justify-center">
                            <FaUnlock className="mr-1" /> Unblock
                          </span>
                        ) : (
                          <span className="flex items-center justify-center">
                            <FaLock className="mr-1" /> Block
                          </span>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center mt-6 space-x-2">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Prev
        </button>

        <span className="text-gray-700">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminDoctors;
