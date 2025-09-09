import { useEffect, useState, useCallback } from 'react';
import { FaSave, FaTimes, FaTag, FaImage, FaUpload } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  createBlog,
  directFileUpload, 
  updateBlog 
} from '../../api/doctor/doctorApi';
import { message } from 'antd';
import { IDoctorData } from '../../interfaces/doctor';
import { ApiError } from '../../interfaces/error';

const DoctorBlogEditAndCreate = () => {
  const location = useLocation();
  const { blog } = location.state || { blog: null };
  const navigate = useNavigate();
  const Doctor = useSelector((state: IDoctorData) => state.doctor.doctor);

  const [formData, setFormData] = useState({
    title: blog?.title || '',
    thumbnail: blog?.thumbnail || '',
    newthumbnail: '',
    content: blog?.content || '',
    img1: blog?.img1 || '',
    newimg1: '',
    img2: blog?.img2 || '',
    newimg2: '',
    img3: blog?.img3 || '',
    newimg3: '',
    tags: blog?.tags || [],
  });
  
  const [newTag, setNewTag] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [img1File, setImg1File] = useState<File | null>(null);
  const [img2File, setImg2File] = useState<File | null>(null);
  const [img3File, setImg3File] = useState<File | null>(null);
  const [originalImages, setOriginalImages] = useState({
    thumbnail: blog?.thumbnail || '',
    img1: blog?.img1 || '',
    img2: blog?.img2 || '',
    img3: blog?.img3 || '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || '',
        thumbnail: blog.thumbnail || '',
        newthumbnail: '',
        content: blog.content || '',
        img1: blog.img1 || '',
        newimg1: '',
        img2: blog.img2 || '',
        newimg2: '',
        img3: blog.img3 || '',
        newimg3: '',
        tags: blog.tags || [],
      });
      setOriginalImages({
        thumbnail: blog.thumbnail || '',
        img1: blog.img1 || '',
        img2: blog.img2 || '',
        img3: blog.img3 || '',
      });
    }
  }, [blog]);

  const validateForm = useCallback(() => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 50) {
      newErrors.content = 'Content must be at least 50 characters long';
    }else if (formData.content.length > 2000) {
      newErrors.content = 'Title must be less than 2000 characters';
    }
    
    if (!formData.thumbnail && !thumbnailFile) {
      newErrors.thumbnail = 'Thumbnail is required';
    }
    
    if (formData.tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    } else if (formData.tags.length > 10) {
      newErrors.tags = 'Maximum 10 tags allowed';
    }

    // Validate file sizes (max 5MB) and types
    const validateFile = (file: File | null, fieldName: string) => {
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          newErrors[fieldName] = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} file size exceeds 5MB`;
        }
        if (!file.type.startsWith('image/')) {
          newErrors[fieldName] = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be an image file`;
        }
      }
    };

    validateFile(thumbnailFile, 'thumbnail');
    validateFile(img1File, 'img1');
    validateFile(img2File, 'img2');
    validateFile(img3File, 'img3');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, thumbnailFile, img1File, img2File, img3File]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const addTag = useCallback(() => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && formData.tags.length < 10 && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, trimmedTag] }));
      setNewTag('');
      if (errors.tags) {
        setErrors(prev => ({ ...prev, tags: '' }));
      }
    }
  }, [newTag, formData.tags, errors.tags]);

  const handleTagKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  }, [addTag]);

  const removeTag = useCallback((tagToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter((tag: string) => tag !== tagToRemove) 
    }));
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail' | 'img1' | 'img2' | 'img3') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, [type]: 'Please select a valid image file' }));
      return;
    }

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [type]: 'File size must be less than 5MB' }));
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);

    // Update state based on type
    const updates: {newthumbnail?:string;newimg1?:string;newimg2?:string;newimg3?:string} = {};
    if (type === 'thumbnail') {
      setThumbnailFile(file);
      updates.newthumbnail = previewUrl;
    } else if (type === 'img1') {
      setImg1File(file);
      updates.newimg1 = previewUrl;
    } else if (type === 'img2') {
      setImg2File(file);
      updates.newimg2 = previewUrl;
    } else if (type === 'img3') {
      setImg3File(file);
      updates.newimg3 = previewUrl;
    }

    setFormData(prev => ({ ...prev, ...updates }));
    if (errors[type]) {
      setErrors(prev => ({ ...prev, [type]: '' }));
    }
  }, [errors]);

  const cancelImage = useCallback((type: 'thumbnail' | 'img1' | 'img2' | 'img3') => {
    // Revoke the object URL to free memory
    const currentPreview = type === 'thumbnail' ? formData.newthumbnail : 
                          type === 'img1' ? formData.newimg1 :
                          type === 'img2' ? formData.newimg2 : formData.newimg3;
    
    if (currentPreview && currentPreview.startsWith('blob:')) {
      URL.revokeObjectURL(currentPreview);
    }

    if (type === 'thumbnail') {
      setThumbnailFile(null);
      setFormData(prev => ({ ...prev, newthumbnail: '', thumbnail: originalImages.thumbnail }));
    } else if (type === 'img1') {
      setImg1File(null);
      setFormData(prev => ({ ...prev, newimg1: '', img1: originalImages.img1 }));
    } else if (type === 'img2') {
      setImg2File(null);
      setFormData(prev => ({ ...prev, newimg2: '', img2: originalImages.img2 }));
    } else if (type === 'img3') {
      setImg3File(null);
      setFormData(prev => ({ ...prev, newimg3: '', img3: originalImages.img3 }));
    }
  }, [formData, originalImages]);

  const uploadFile = async (file: File, type: string): Promise<string> => {
    setUploadProgress(prev => ({ ...prev, [type]: true }));
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("doc", file);
      uploadFormData.append("location", "blog-images");
      
      const uploadResult = await directFileUpload(uploadFormData);
      if (!uploadResult?.url) {
        throw new Error(`Failed to upload ${type}`);
      }
      return uploadResult.url;
    } finally {
      setUploadProgress(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      message.error("Please fix the errors before saving");
      return;
    }
    
    setLoading(true);
    const hideLoading = message.loading("Preparing to save blog...", 0);

    try {
      let newThumbUrl = '';
      let newImg1Url = '';
      let newImg2Url = '';
      let newImg3Url = '';

      // Upload files sequentially with progress feedback
      if (thumbnailFile) {
        hideLoading();
        message.loading("Uploading thumbnail...");
        newThumbUrl = await uploadFile(thumbnailFile, 'thumbnail');
      }
      
      if (img1File) {
        hideLoading();
        message.loading("Uploading image 1...");
        newImg1Url = await uploadFile(img1File, 'img1');
      }
      
      if (img2File) {
        hideLoading();
        message.loading("Uploading image 2...");
        newImg2Url = await uploadFile(img2File, 'img2');
      }
      
      if (img3File) {
        hideLoading();
        message.loading("Uploading image 3...");
        newImg3Url = await uploadFile(img3File, 'img3');
      }

      hideLoading();
      message.loading("Saving blog...");

       const blogPayload = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      author: blog?.author || Doctor?.fullName || 'Unknown Author',
      authorId:Doctor?._id,
      thumbnail: newThumbUrl || formData.thumbnail,
      img1: newImg1Url || formData.img1,
      img2: newImg2Url || formData.img2,
      img3: newImg3Url || formData.img3,
      tags: formData.tags, // already an array
    };


      if (blog) {
        await updateBlog(blog._id, blogPayload);
        message.success('Blog updated successfully!');
      } else {

        console.log("create blog........",blogPayload);
        await createBlog(blogPayload);
        message.success('Blog created successfully!');
      }
      
      hideLoading();
      navigate('/doctor/blogs');
    } catch (err) {
      hideLoading();
      const errorMessage = (err as ApiError)?.response?.data?.message ?? 'Failed to save blog. Please try again.';
      setErrors({ form: errorMessage });
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [formData, thumbnailFile, img1File, img2File, img3File, blog, navigate, validateForm, Doctor]);

  const onCancel = useCallback(() => {

    [formData.newthumbnail, formData.newimg1, formData.newimg2, formData.newimg3].forEach(url => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    navigate('/doctor/blogs');
  }, [navigate, formData]);

  const ImageUploadSection = ({ 
    type, 
    label, 
    currentImage, 
    newImage, 
    file, 
    error, 
    required = false 
  }: {
    type: 'thumbnail' | 'img1' | 'img2' | 'img3',
    label: string,
    currentImage: string,
    newImage: string,
    file: File | null,
    error?: string,
    required?: boolean
  }) => (
    <div className="group">
      <label className=" text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <FaImage className="text-blue-500" />
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, type)}
          className="hidden"
          id={`${type}-upload`}
          disabled={loading}
        />
        
        {!(newImage || currentImage) ? (
          <label
            htmlFor={`${type}-upload`}
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 bg-gray-50"
          >
            <FaUpload className="text-gray-400 text-3xl mb-2" />
            <span className="text-gray-600 text-sm font-medium">Click to upload {label.toLowerCase()}</span>
            <span className="text-gray-400 text-xs mt-1">PNG, JPG up to 5MB</span>
          </label>
        ) : (
          <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
            <img
              src={newImage || currentImage}
              alt={`${label} Preview`}
              className="w-full h-48 object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
              <div className="flex gap-2">
                <label
                  htmlFor={`${type}-upload`}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <FaUpload /> Change
                </label>
                {file && (
                  <button
                    onClick={() => cancelImage(type)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    disabled={loading}
                  >
                    <FaTimes /> Cancel
                  </button>
                )}
              </div>
            </div>
            {uploadProgress[type] && (
              <div className="absolute inset-0 bg-blue-500 bg-opacity-75 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-2 text-red-500 text-sm flex items-center gap-1">
          <FaTimes className="text-xs" />
          {error}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {blog ? 'Edit Blog Post' : 'Create New Blog Post'}
              </h1>
              <p className="text-gray-600">
                {blog ? 'Update your existing blog post' : 'Share your knowledge with the world'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
                disabled={loading}
              >
                <FaTimes /> Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                disabled={loading}
              >
                <FaSave /> {loading ? 'Saving...' : 'Save Blog'}
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          {errors.form && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 flex items-center gap-2">
              <FaTimes className="text-red-500" />
              {errors.form}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Blog Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              placeholder="Enter an engaging title for your blog post..."
              disabled={loading}
            />
            {errors.title && (
              <div className="mt-2 text-red-500 text-sm flex items-center gap-1">
                <FaTimes className="text-xs" />
                {errors.title}
              </div>
            )}
          </div>

          {/* Thumbnail */}
          <ImageUploadSection
            type="thumbnail"
            label="Thumbnail Image"
            currentImage={formData.thumbnail}
            newImage={formData.newthumbnail}
            file={thumbnailFile}
            error={errors.thumbnail}
            required={true}
          />

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Blog Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={10}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 resize-none ${
                errors.content ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              placeholder="Write your blog content here. Share your expertise, insights, and valuable information..."
              disabled={loading}
            />
            <div className="flex justify-between items-center mt-2">
              {errors.content ? (
                <div className="text-red-500 text-sm flex items-center gap-1">
                  <FaTimes className="text-xs" />
                  {errors.content}
                </div>
              ) : (
                <div className="text-gray-500 text-sm">
                  {formData.content.length} characters
                </div>
              )}
            </div>
          </div>

          {/* Additional Images */}
          <div className="grid md:grid-cols-3 gap-6">
            <ImageUploadSection
              type="img1"
              label="Content Image 1"
              currentImage={formData.img1}
              newImage={formData.newimg1}
              file={img1File}
              error={errors.img1}
            />
            <ImageUploadSection
              type="img2"
              label="Content Image 2"
              currentImage={formData.img2}
              newImage={formData.newimg2}
              file={img2File}
              error={errors.img2}
            />
            <ImageUploadSection
              type="img3"
              label="Content Image 3"
              currentImage={formData.img3}
              newImage={formData.newimg3}
              file={img3File}
              error={errors.img3}
            />
          </div>

          {/* Tags */}
          <div>
            <label className=" text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FaTag className="text-blue-500" />
              Tags <span className="text-red-500">*</span>
              <span className="text-gray-500 font-normal">({formData.tags.length}/10)</span>
            </label>
            
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleTagKeyPress}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 transition-all duration-200"
                placeholder="Enter a tag and press Enter..."
                disabled={loading || formData.tags.length >= 10}
              />
              <button
                onClick={addTag}
                disabled={formData.tags.length >= 10 || loading || !newTag.trim()}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <FaTag /> Add
              </button>
            </div>

            {errors.tags && (
              <div className="mb-4 text-red-500 text-sm flex items-center gap-1">
                <FaTimes className="text-xs" />
                {errors.tags}
              </div>
            )}

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {formData.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-4 py-2 rounded-full flex items-center gap-2 hover:from-blue-200 hover:to-indigo-200 transition-all duration-200 shadow-sm"
                  >
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full p-1 transition-colors duration-200"
                      disabled={loading}
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorBlogEditAndCreate;