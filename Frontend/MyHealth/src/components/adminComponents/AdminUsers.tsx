
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaLock, FaUnlock, FaSearch } from "react-icons/fa";
import { getUsers } from "../../api/admin/adminApi";

interface User {
  _id: string;
  fullName: string;
  email: string;
  isBlocked: boolean;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const limit = 3;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers( search, page, limit );

      console.log("users are........",response);
      setUsers(response.users);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUnblock = async (id: string, isBlocked: boolean) => {
    try {
      const url = isBlocked
        ? `/api/admin/users/${id}/unblock`
        : `/api/admin/users/${id}/block`;

      await axios.patch(url, {}, { withCredentials: true });

      toast.success(`User ${isBlocked ? "unblocked" : "blocked"} successfully`);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error(error);
      toast.error("Action failed");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold text-green-700 mb-4">Manage Users</h1>

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
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-gray-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="border-b">
                    <td className="py-3 px-4">{user.fullName}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      {user.isBlocked ? (
                        <span className="text-red-500 font-semibold">Blocked</span>
                      ) : (
                        <span className="text-green-600 font-semibold">Active</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleBlockUnblock(user._id, user.isBlocked)}
                        className={`px-4 py-1 rounded-md text-white ${
                          user.isBlocked ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"
                        }`}
                      >
                        {user.isBlocked ? (
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

export default AdminUsers;
