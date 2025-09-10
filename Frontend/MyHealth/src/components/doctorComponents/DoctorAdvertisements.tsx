import { useEffect, useState, useCallback, memo } from 'react';
import { FaEdit, FaTrash, FaEye, FaHeart, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { 
    getAdds,
  //  deleteAdd 
  } from '../../api/doctor/doctorApi';
import { useSelector } from 'react-redux';
import { advertisement } from '../../interfaces/advertisement';
import { IDoctorData } from '../../interfaces/doctor';

// Blog Card Component
const AddCard = memo(({ add, onView, onEdit, onDelete }: {
  add: advertisement;
  onView: (add: advertisement) => void;
  onEdit: (add: advertisement) => void;
  onDelete: (addId: string) => void;
}) => (
  <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
    <video
        src={add.videoUrl}
        className="w-full h-48 object-cover rounded-t-xl"
        controls
        preload="metadata">
    </video>

    <div className="p-4 space-y-2">
      <h3 className="font-semibold text-lg text-gray-800 line-clamp-2">{add.title}</h3>
      
      <div className="flex flex-wrap gap-1">
        {add.tags.slice(0, 3).map((tag: string, index: number) => (
          <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {tag}
          </span>
        ))}
        {add.tags.length > 3 && <span className="text-gray-400 text-xs">+{add.tags.length - 3}</span>}
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="flex items-center gap-4 text-gray-500 text-sm">
          <span className="flex items-center gap-1">
            <FaEye className="text-red-400" aria-label="Likes" />
            {add.views}
          </span>
          <span>{add.createdAt ? new Date(add.createdAt).toLocaleDateString() : 'N/A'}</span>
        </div>
        <div className="flex gap-2">
          {/* <button
            onClick={() => onView(add)}
            className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors"
            aria-label={`View ${add.title}`}
          >
            <FaEye />
          </button> */}
          <button
            onClick={() => onEdit(add)}
            className="text-green-500 hover:bg-green-50 p-2 rounded-lg transition-colors"
            aria-label={`Edit ${add.title}`}
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onDelete(add._id || '')}
            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
            aria-label={`Delete ${add.title}`}
          >
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  </div>
));

const DoctorAdds = () => {

  const Doctor = useSelector((state: IDoctorData) => state.doctor.doctor);
  const [adds, setAdds] = useState<advertisement[]>([]);
  const [selectedAdd,setSelectedAdd] = useState(null)
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const limit = 1;

  const fetchAdds = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAdds(Doctor._id,page, limit);
      console.log("response........... response..........",response.data.adds);
      setAdds(response.data.adds);
      setTotalPages(response.totalPages || 1);
      setError(null);
    } catch (err) {
      setError('Failed to fetch adds. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchAdds();
  }, [fetchAdds]);

  const handleViewAdd = useCallback((add: advertisement) => {
    navigate('/doctor/add', { state: { add } });
  }, [navigate]);

  const handleEditAdd = useCallback((add: advertisement) => {
    navigate('/doctor/advertisement-create', { state: { add } });
  }, [navigate]);

  const handleDeleteAdd = useCallback(async (addId: string) => {
    if (window.confirm('Are you sure you want to delete this add?')) {
      try {
        // await deleteAdd(addId);
        // setAdds(prev => prev.filter(add => add._id !== addId));
        setError(null);
      } catch (err) {
        setError('Failed to delete add. Please try again.');
      }
    }
  }, []);

  const handleCreateAdd = useCallback(() => {
    navigate('/doctor/advertisement-create', { state: { add: null } });
  }, [navigate]);


  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">My Adds</h1>
        <button
          onClick={handleCreateAdd}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          aria-label="Create new add"
        >
          <FaPlus /> Post New Add
        </button>
      </div>

      {error && <div className="text-red-500 text-center py-4">{error}</div>}
      {loading ? (
        <div className="text-center text-gray-500 py-4">Loading...</div>
      ) : adds.length === 0 ? (
        <div className="text-center text-gray-500 py-4">No adds yet.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adds.map(add => (
              <AddCard
                key={add._id}
                add={add}
                onView={handleViewAdd}
                onEdit={handleEditAdd}
                onDelete={handleDeleteAdd}
              />
            ))}
          </div>
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
              aria-label="Previous page"
            >
              Previous
            </button>
            <span className="text-gray-700">Page {page} of {totalPages}</span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DoctorAdds;