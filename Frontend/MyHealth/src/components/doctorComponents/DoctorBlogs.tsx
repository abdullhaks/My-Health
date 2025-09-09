import { useEffect, useState, useCallback, memo } from 'react';
import { FaEdit, FaTrash, FaEye, FaHeart, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getBlogs,
  //  deleteBlog 
  } from '../../api/doctor/doctorApi';
import { useSelector } from 'react-redux';
import { blogCreate } from '../../interfaces/blog';
import { IDoctorData } from '../../interfaces/doctor';

// Blog Card Component
const BlogCard = memo(({ blog, onView, onEdit, onDelete }: {
  blog: blogCreate;
  onView: (blog: blogCreate) => void;
  onEdit: (blog: blogCreate) => void;
  onDelete: (blogId: string) => void;
}) => (
  <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
    <img
      src={blog.thumbnail}
      alt={blog.title}
      className="w-full h-48 object-cover rounded-t-xl cursor-pointer"
      onClick={() => onView(blog)}
      loading="lazy"
    />
    <div className="p-4 space-y-2">
      <h3 className="font-semibold text-lg text-gray-800 line-clamp-2">{blog.title}</h3>
      <p className="text-gray-600 text-sm line-clamp-3">{blog.content}</p>
      <div className="flex flex-wrap gap-1">
        {blog.tags.slice(0, 3).map((tag: string, index: number) => (
          <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {tag}
          </span>
        ))}
        {blog.tags.length > 3 && <span className="text-gray-400 text-xs">+{blog.tags.length - 3}</span>}
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="flex items-center gap-4 text-gray-500 text-sm">
          {/* <span className="flex items-center gap-1">
            <FaHeart className="text-red-400" aria-label="Likes" />
            {blog.likes||''}
          </span> */}
          <span>{new Date(blog.createdAt||"").toLocaleDateString()}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onView(blog)}
            className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors cursor-pointer"
            aria-label={`View ${blog.title}`}
          >
            <FaEye />
          </button>
          <button
            onClick={() => onEdit(blog)}
            className="text-green-500 hover:bg-green-50 p-2 rounded-lg transition-colors cursor-pointer"
            aria-label={`Edit ${blog.title}`}
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onDelete(blog._id||"")}
            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors cursor-pointer"
            aria-label={`Delete ${blog.title}`}
          >
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  </div>
));

const DoctorBlogs = () => {

  const Doctor = useSelector((state: IDoctorData) => state.doctor.doctor);
  const [blogs, setBlogs] = useState<blogCreate[]>([]);
  const [selectedBlog,setSelectedBlog] = useState(null)
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const limit = 10;

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getBlogs(Doctor._id,page, limit);
      console.log("response........... response..........",response.blogs);
      setBlogs(response.blogs);
      setTotalPages(response.totalPages || 1);
      setError(null);
    } catch (err) {
      setError('Failed to fetch blogs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleViewBlog = useCallback((blog: blogCreate) => {
    navigate('/doctor/blog', { state: { blog } });
  }, [navigate]);

  const handleEditBlog = useCallback((blog: blogCreate) => {
    navigate('/doctor/blog-create-edit', { state: { blog } });
  }, [navigate]);

  const handleDeleteBlog = useCallback(async (blogId: string) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        // await deleteBlog(blogId);
        // setBlogs(prev => prev.filter(blog => blog._id !== blogId));
        setError(null);
      } catch (err) {
        setError('Failed to delete blog. Please try again.');
      }
    }
  }, []);

  const handleCreateBlog = useCallback(() => {
    navigate('/doctor/blog-create-edit', { state: { blog: null } });
  }, [navigate]);


  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">My Blogs</h1>
        <button
          onClick={handleCreateBlog}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          aria-label="Create new blog"
        >
          <FaPlus /> Post New Blog
        </button>
      </div>

      {error && <div className="text-red-500 text-center py-4">{error}</div>}
      {loading ? (
        <div className="text-center text-gray-500 py-4">Loading...</div>
      ) : blogs.length === 0 ? (
        <div className="text-center text-gray-500 py-4">No blogs yet.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map(blog => (
              <BlogCard
                key={blog._id}
                blog={blog}
                onView={handleViewBlog}
                onEdit={handleEditBlog}
                onDelete={handleDeleteBlog}
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

export default DoctorBlogs;