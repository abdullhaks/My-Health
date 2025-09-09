import { useEffect, useState, useCallback } from 'react';
import { FaSave, FaTimes, FaTag, FaVideo, FaUpload, FaMapMarkerAlt } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  createAdvertisement,
  directFileUpload, 
  // updateAdvertisement 
} from '../../api/doctor/doctorApi';
import { message } from 'antd';
import GeoapifyAutocomplete from '../../sharedComponents/GeoapifyAutocomplete'; // Adjust path as needed
import { IDoctorData } from '../../interfaces/doctor';

interface ILocation {
  type: "Point";
  coordinates: [number, number];
  text: string;
}

const DoctorAdvertisementCreate = () => {
    
  const location = useLocation();
  const { add } = location.state || { advertisement: null };
  const navigate = useNavigate();
  const Doctor = useSelector((state:IDoctorData) => state.doctor.doctor);

  const [formData, setFormData] = useState({
    title: add?.title || '',
    video: add?.video || '',
    newVideo: '',
    location: add?.location || {
      type: "Point" as const,
      coordinates: [NaN, NaN] as [number, number],
      text: ''
    },
    tags: add?.tags || [],
  });
  
  const [newTag, setNewTag] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [originalVideo, setOriginalVideo] = useState(add?.videoUrl || '');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);

  useEffect(() => {
    if (add) {
      setFormData({
        title: add.title || '',
        video: add.videoUrl || '',
        newVideo: '',
        location: add.location || {
          type: "Point",
          coordinates: [NaN, NaN],
          text: ''
        },
        tags: add.tags || [],
      });
      setOriginalVideo(add.video || '');
    }
  }, [add]);

  const validateForm = useCallback(() => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }
    
    if (!formData.video && !videoFile) {
      newErrors.video = 'Video is required';
    }

    if (!formData.location.text.trim()) {
      newErrors.location = 'Location is required';
    } else if (isNaN(formData.location.coordinates[0]) || isNaN(formData.location.coordinates[1])) {
      newErrors.location = 'Please select a valid location from suggestions';
    }
    
    if (formData.tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    } else if (formData.tags.length > 10) {
      newErrors.tags = 'Maximum 10 tags allowed';
    }

    // Validate video file
    if (videoFile) {
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (videoFile.size > maxSize) {
        newErrors.video = 'Video file size exceeds 50MB';
      }
      if (!videoFile.type.startsWith('video/')) {
        newErrors.video = 'Please select a valid video file';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, videoFile]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleLocationChange = useCallback((location: ILocation) => {
    setFormData(prev => ({ ...prev, location }));
    if (errors.location) {
      setErrors(prev => ({ ...prev, location: '' }));
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

  const handleVideoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setErrors(prev => ({ ...prev, video: 'Please select a valid video file' }));
      return;
    }

    // Validate file size (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, video: 'File size must be less than 50MB' }));
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setVideoFile(file);
    setFormData(prev => ({ ...prev, newVideo: previewUrl }));
    
    if (errors.video) {
      setErrors(prev => ({ ...prev, video: '' }));
    }
  }, [errors]);

  const cancelVideo = useCallback(() => {
    // Revoke the object URL to free memory
    if (formData.newVideo && formData.newVideo.startsWith('blob:')) {
      URL.revokeObjectURL(formData.newVideo);
    }

    setVideoFile(null);
    setFormData(prev => ({ ...prev, newVideo: '', video: originalVideo }));
  }, [formData.newVideo, originalVideo]);

  const uploadVideo = async (file: File): Promise<string> => {
    setUploadProgress(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("doc", file);
      uploadFormData.append("location", "advertisement-videos");
      
      const uploadResult = await directFileUpload(uploadFormData);
      if (!uploadResult?.url) {
        throw new Error('Failed to upload video');
      }
      return uploadResult.url;
    } finally {
      setUploadProgress(false);
    }
  };

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      message.error("Please fix the errors before saving");
      return;
    }
    
    setLoading(true);
    const hideLoading = message.loading("Preparing to save advertisement...", 0);

    try {
      let newVideoUrl = '';

      // Upload video if new file selected
      if (videoFile) {
        hideLoading();
        message.loading("Uploading video...");
        newVideoUrl = await uploadVideo(videoFile);
      }

      hideLoading();
      message.loading("Saving advertisement...");

      const advertisementPayload = {
        title: formData.title.trim(),
        videoUrl: newVideoUrl || formData.video,
        location: formData.location,
        author: add?.author || Doctor?.fullName || '',
        authorId: Doctor?._id,
        tags: formData.tags,
      };

      if (add) {
        // await updateAdvertisement(advertisement._id, advertisementPayload);
        message.success('Advertisement updated successfully!');
      } else {
        console.log("create advertisement........", advertisementPayload);
        await createAdvertisement(advertisementPayload);
        message.success('Advertisement created successfully!');
      }
      
      hideLoading();
      navigate('/doctor/advertisements');
    } catch (err) {
      hideLoading();
      const errorMessage = typeof err === 'object' && err !== null && 'message' in err
      ? (err as { message?: string }).message || 'Failed to save advertisement. Please try again.':'Failed to save advertisement. Please try again.'
      setErrors({ form: errorMessage });
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [formData, videoFile, add, navigate, validateForm, Doctor]);

  const onCancel = useCallback(() => {

    if (formData.newVideo && formData.newVideo.startsWith('blob:')) {
      URL.revokeObjectURL(formData.newVideo);
    }
    navigate('/doctor/advertisements');
  }, [navigate, formData]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const VideoUploadSection = () => (
    <div className="group">
      <label className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <FaVideo className="text-blue-500" />
        Advertisement Video
        <span className="text-red-500">*</span>
        <span className="text-gray-500 font-normal text-xs">(Max 50MB, 16:9 aspect ratio preferred)</span>
      </label>
      
      <div className="relative">
        <input
          type="file"
          accept="video/*"
          onChange={handleVideoChange}
          className="hidden"
          id="video-upload"
          disabled={loading}
        />
        
        {!(formData.newVideo || formData.video) ? (
          <label
            htmlFor="video-upload"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 bg-gray-50"
          >
            <FaUpload className="text-gray-400 text-4xl mb-3" />
            <span className="text-gray-600 text-lg font-medium">Click to upload video</span>
            <span className="text-gray-400 text-sm mt-2">MP4, MOV, AVI up to 50MB</span>
            <span className="text-gray-400 text-xs mt-1">16:9 aspect ratio recommended</span>
          </label>
        ) : (
          <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
            <video
              src={formData.newVideo || formData.video}
              className="w-full h-64 object-cover"
              controls
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
              <div className="flex gap-2">
                <label
                  htmlFor="video-upload"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <FaUpload /> Change
                </label>
                {videoFile && (
                  <button
                    onClick={cancelVideo}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    disabled={loading}
                  >
                    <FaTimes /> Cancel
                  </button>
                )}
              </div>
            </div>
            {uploadProgress && (
              <div className="absolute inset-0 bg-blue-500 bg-opacity-75 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            )}
          </div>
        )}

        {videoFile && (
          <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
            <FaVideo className="text-blue-500" />
            <span>Selected: {videoFile.name}</span>
            <span className="text-gray-400">({formatFileSize(videoFile.size)})</span>
          </div>
        )}
      </div>
      
      {errors.video && (
        <div className="mt-2 text-red-500 text-sm flex items-center gap-1">
          <FaTimes className="text-xs" />
          {errors.video}
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
                {add ? 'Edit Advertisement' : 'Create New Advertisement'}
              </h1>
              <p className="text-gray-600">
                {add ? 'Update your existing add video' : 'Create a video add to promote your services'}
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
                <FaSave /> {loading ? 'Saving...' : 'Save Advertisement'}
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
              Advertisement Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              placeholder="Enter a catchy title for your add..."
              disabled={loading}
            />
            {errors.title && (
              <div className="mt-2 text-red-500 text-sm flex items-center gap-1">
                <FaTimes className="text-xs" />
                {errors.title}
              </div>
            )}
          </div>

          {/* Video Upload */}
          <VideoUploadSection />

          {/* Location */}
          <div>
            <label className=" text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FaMapMarkerAlt className="text-blue-500" />
              Location <span className="text-red-500">*</span>
            </label>
            <GeoapifyAutocomplete
              value={formData.location.text}
              onChange={handleLocationChange}
              setError={(error) => setErrors(prev => ({ ...prev, location: error || '' }))}
              className={errors.location ? 'border-red-300 bg-red-50' : ''}
            />
            {errors.location && (
              <div className="mt-2 text-red-500 text-sm flex items-center gap-1">
                <FaTimes className="text-xs" />
                {errors.location}
              </div>
            )}
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

export default DoctorAdvertisementCreate;