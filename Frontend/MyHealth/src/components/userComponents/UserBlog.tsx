import { Heart, ArrowLeft, Bookmark, Share2 } from 'lucide-react';
import { JSX } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const UserBlogDetails = () => {
  // Sample blog data for demonstration
  
const navigete = useNavigate();
const location = useLocation();
const { blog } = location.state || { blog: null };

  // Split content into paragraphs and insert images strategically
  const contentParagraphs = blog.content.split('\n\n').filter((p:string) => p.trim());
  const images = [blog.img1, blog.img2, blog.img3].filter(img => img);
  
  const renderContentWithImages = () => {
    const elements:JSX.Element[] = [];
    
    contentParagraphs.forEach((paragraph:string, index:number) => {
      // Add paragraph
      elements.push(
        <p key={`p-${index}`} className="text-gray-800 leading-8 text-lg mb-6 font-serif">
          {paragraph}
        </p>
      );
      
      // Insert image after certain paragraphs (strategically placed)
      if (images.length > 0) {
        const shouldInsertImage = 
          (index === Math.floor(contentParagraphs.length * 0.3) && images[0]) ||
          (index === Math.floor(contentParagraphs.length * 0.6) && images[1]) ||
          (index === Math.floor(contentParagraphs.length * 0.8) && images[2]);
          
        if (shouldInsertImage) {
          const imageIndex = index === Math.floor(contentParagraphs.length * 0.3) ? 0 :
                           index === Math.floor(contentParagraphs.length * 0.6) ? 1 : 2;
          
          if (images[imageIndex]) {
            elements.push(
              <figure key={`img-${imageIndex}`} className="my-10">
                <img
                  src={images[imageIndex]}
                  alt={`Blog illustration ${imageIndex + 1}`}
                  className="w-full rounded-lg shadow-lg"
                />
                
              </figure>
            );
          }
        }
      }
    });
    
    return elements;
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Navigation Bar */}
      <div className="border-b border-gray-100sticky top-0 z-10 backdrop-blur-sm bg-white/95">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
            onClick={()=>navigete(-1)}>
              <ArrowLeft size={18} />
            </button>
            
            <div className="flex items-center gap-3">
              <button className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-full transition-all duration-200">
                <Bookmark size={18} />
              </button>
              <button className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-full transition-all duration-200">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Article Container */}
      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* Title Section */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6 font-serif tracking-tight">
            {blog.title}
          </h1>
          
          {/* Author and Meta Information */}
          <div className="flex items-center gap-4 pb-8 border-b border-gray-100">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md">
              {blog.author.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900 text-lg">Dr. {blog.author}</span>
                <span className="text-emerald-600 text-sm font-medium cursor-pointer hover:text-emerald-700">• Follow</span>
              </div>
              
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
                <span>•</span>
                <span>8 min read</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Heart className="text-red-500" size={14} />
                  <span>{blog.likes}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <figure className="mb-12">
          <img
            src={blog.thumbnail}
            alt={blog.title}
            className="w-full rounded-xl shadow-xl"
          />
         
        </figure>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          <div className="first-letter:text-6xl first-letter:font-bold first-letter:text-gray-900 first-letter:float-left first-letter:mr-3 first-letter:mt-1">
            {renderContentWithImages()}
          </div>
        </div>

        {/* Tags Section */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="flex flex-wrap gap-3 mb-8">
            {blog.tags.map((tag:string, index:number) => (
              <span
                key={index}
                className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-4 py-2 rounded-full cursor-pointer transition-all duration-200 hover:scale-105 font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Engagement Actions */}
          <div className="flex items-center justify-between py-6 border-t border-b border-gray-100">
            <div className="flex items-center gap-8">
              <button className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors duration-200 group">
                <Heart size={20} className="group-hover:scale-110 transition-transform" />
                <span className="font-medium">{blog.likes}</span>
              </button>
              
              <button className="text-gray-600 hover:text-blue-500 transition-colors duration-200">
                <Share2 size={18} />
              </button>
            </div>
            
            <button className="text-gray-600 hover:text-emerald-500 transition-colors duration-200">
              <Bookmark size={18} />
            </button>
          </div>
        </div>

        {/* Author Bio Section */}
        <div className="mt-12 p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              {blog.author.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex-1">
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                Dr. {blog.author}
              </h3>
              {/* <p className="text-gray-600 mb-6 leading-relaxed">
                Board-certified physician and researcher specializing in digital health innovation. 
                Passionate about leveraging technology to improve patient outcomes and healthcare accessibility. 
                Published author with over 50 peer-reviewed articles on medical AI applications.
              </p> */}
              <div className="flex items-center gap-4">
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg">
                  Follow
                </button>
                <button className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-full text-sm font-medium transition-all duration-200">
                  View Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Articles Suggestion */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">More from Dr. {blog.author}</h3>
          <p className="text-gray-600">Discover more insights on healthcare innovation and medical technology</p>
        </div>
      </article>
    </div>
  );
};

export default UserBlogDetails;