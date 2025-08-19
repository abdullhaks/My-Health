
import { useEffect, useState, useCallback, useRef } from 'react';
import { Eye, Calendar, Clock, User, ChevronLeft, ChevronRight,
   Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { getDashboardContent } from '../../api/user/userApi';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { message } from 'antd';

interface Blog {
  _id: string;
  title: string;
  content: string;
  thumbnail: string;
  createdAt: string;
  author: string;
}

interface Advertisement {
  _id: string;
  title: string;
  videoUrl: string;
  createdAt: string;
}

const UserDashboard = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const navigate = useNavigate();
  const user = useSelector((state:any)=>state.user.user);
  const [location, setLocation] = useState<any>(null);
  const [latitude, setLatitude] = useState<any>(null);
  const [longitude, setLongitude] = useState<any>(null);


const fetchDashboardContent = async () => {
  setLoading(true);
  try {
    const days = 30;
    const userId = user._id;
    const response = await getDashboardContent(days, userId, latitude, longitude);
    setBlogs(response.blogs || []);
    setAdvertisements(response.advertisements || []);
    setError(null);
  } catch (err) {
    setError('Failed to load dashboard content. Please try again.');
    console.error('Error fetching dashboard content:', err);
  } finally {
    setLoading(false);
  }
};


 useEffect(() => {
  if (latitude && longitude) {
    fetchDashboardContent();
  }
}, [latitude, longitude]);

  // Initialize video refs
  useEffect(() => {
    if (advertisements.length > 0) {
      videoRefs.current = advertisements.map((_, i) => videoRefs.current[i] || null);
    }
  }, [advertisements]);

  // Handle video playback with refined logic
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        video.muted = isMuted;
        
        if (index === currentAdIndex) {
          // Reset and play current video
          video.currentTime = 0;
          video.play()
            .then(() => setIsVideoPlaying(true))
            .catch((err) => {
              console.error('Video play error:', err);
              setIsVideoPlaying(false);
            });
        } else {
          // Pause and reset other videos
          video.pause();
          video.currentTime = 0;
          if (index === currentAdIndex) setIsVideoPlaying(false);
        }
      }
    });
  }, [currentAdIndex]);

  const goToPrevious = () => {
    setIsPaused(true); // Pause auto-slide when manually navigating
    setCurrentAdIndex((prev) =>
      prev === 0 ? advertisements.length - 1 : prev - 1
    );
    // Resume auto-slide after 3 seconds
    setTimeout(() => setIsPaused(false), 3000);
  };

  const goToNext = () => {
    setIsPaused(true); // Pause auto-slide when manually navigating
    setCurrentAdIndex((prev) => (prev + 1) % advertisements.length);
    // Resume auto-slide after 3 seconds
    setTimeout(() => setIsPaused(false), 3000);
  };

  const togglePlayPause = () => {
    const currentVideo = videoRefs.current[currentAdIndex];
    if (currentVideo) {
      if (isVideoPlaying) {
        currentVideo.pause();
        setIsPaused(true);
      } else {
        currentVideo.play();
        setIsPaused(false);
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVideoEnd = () => {
    // When video ends naturally, move to next slide
    if (advertisements.length > 1) {
      setCurrentAdIndex((prev) => (prev + 1) % advertisements.length);
    }
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const handleViewBlog = (blog: Blog) => {
    navigate('/user/blog', { state: { blog } });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };


useEffect(() => {
    if (!navigator.geolocation) {
        message.error("locaiton accessign failed")
      return;
    }

    const successHandler = (position:any) => {

       console.log("location is ...",position);

      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      setLatitude(position.coords.latitude)
      setLongitude(position.coords.longitude)

     
   
    };

    const errorHandler = (err:any) => {
      message.error("locaiton accessign failed",err)
      setLocation(null); 
      setLatitude(null);
      setLongitude(null);

    };
    navigator.geolocation.getCurrentPosition(successHandler, errorHandler);

  }, []);




  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-2 lg:p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-3">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
            Dashboard
          </h1>
          <p className="text-gray-600">Stay updated with the latest content and trends</p>
        </div>

        {/* Top Section: Advertisement and Calendar */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {/* Advertisement Section */}
          <div className="xl:col-span-3">
            <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden group">
              {loading ? (
                <div className="flex items-center justify-center h-96 bg-gradient-to-r from-blue-500 to-indigo-600">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-96 bg-red-50 text-red-600">
                  <div className="text-center">
                    <div className="text-2xl mb-2">⚠️</div>
                    <p>{error}</p>
                  </div>
                </div>
              ) : advertisements.length === 0 ? (
                <div className="flex items-center justify-center h-96 bg-gradient-to-r from-gray-100 to-gray-200">
                  <div className="text-center text-gray-500">
                    <div className="text-4xl mb-4">📺</div>
                    <p className="text-lg">No advertisements available</p>
                  </div>
                </div>
              ) : (
                <div className="relative h-96 overflow-hidden">
                  <video
                    key={advertisements[currentAdIndex]?._id}
                    ref={(el) => {
                      videoRefs.current[currentAdIndex] = el;
                    }}
                    src={advertisements[currentAdIndex]?.videoUrl}
                    className="w-full h-full object-cover"
                    muted={isMuted}
                    loop={false}
                    onPlay={() => setIsVideoPlaying(true)}
                    onPause={() => setIsVideoPlaying(false)}
                    onEnded={handleVideoEnd}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onLoadStart={() => setIsVideoPlaying(false)}
                  />
                  
                  {/* Overlay with title and controls */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-white text-2xl font-bold mb-2">
                        {advertisements[currentAdIndex]?.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={togglePlayPause}
                            className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-200"
                            title={isVideoPlaying ? 'Pause' : 'Play'}
                          >
                            {isVideoPlaying ? (
                              <Pause className="w-6 h-6 text-white" />
                            ) : (
                              <Play className="w-6 h-6 text-white ml-1" />
                            )}
                          </button>
                          
                          <button
                            onClick={toggleMute}
                            className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-200"
                            title={isMuted ? 'Unmute' : 'Mute'}
                          >
                            {isMuted ? (
                              <VolumeX className="w-6 h-6 text-white" />
                            ) : (
                              <Volume2 className="w-6 h-6 text-white" />
                            )}
                          </button>

                          {/* Auto-slide indicator */}
                          {advertisements.length > 1 && !isPaused && !isHovering && (
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              <span className="text-white text-sm font-medium">Auto</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Dots indicator */}
                        {advertisements.length > 1 && (
                          <div className="flex gap-2">
                            {advertisements.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentAdIndex(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                                  index === currentAdIndex
                                    ? 'bg-white scale-110'
                                    : 'bg-white/50 hover:bg-white/75'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Navigation arrows */}
                  {advertisements.length > 1 && (
                    <>
                      <button
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/20 backdrop-blur-sm text-white rounded-full hover:bg-black/40 transition-all duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <ChevronLeft className="w-6 h-6 mx-auto" />
                      </button>
                      <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/20 backdrop-blur-sm text-white rounded-full hover:bg-black/40 transition-all duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <ChevronRight className="w-6 h-6 mx-auto" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Calendar Widget */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl p-6 h-96 overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Calendar</h2>
              </div>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-800">
                    {new Date().getDate()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date().toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-1 text-xs">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day,indx) => (
                    <div key={indx} className="text-center font-semibold text-gray-400 p-2">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: 28 }, (_, i) => (
                    <div
                      key={i}
                      className={`text-center p-2 rounded-lg text-sm cursor-pointer transition-colors ${
                        i + 1 === new Date().getDate()
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold'
                          : 'hover:bg-blue-50 text-gray-600'
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Blogs Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Latest Blogs & News</h2>
              <p className="text-gray-500">Stay informed with our latest insights</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-16 text-red-600">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-lg">{error}</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-lg">No blogs available at the moment</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => (
                <article
                  key={blog._id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 cursor-pointer"
                  onClick={() => handleViewBlog(blog)}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={blog.thumbnail}
                      alt={blog.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{blog.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(blog.createdAt)}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {blog.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                      {blog.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <button className="flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors">
                        <Eye className="w-4 h-4" />
                        <span>Read More</span>
                      </button>
                      <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <ChevronRight className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

function userSelector(arg0: (state: any) => any) {
  throw new Error('Function not implemented.');
}
