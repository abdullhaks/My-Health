// src/sharedComponents/Loader.tsx
import React from 'react';
import appLogo from '../assets/applogoblue.png';

const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-95 z-50">
      <div className="relative flex flex-col items-center space-y-8">
        <div className="relative w-24 h-24 flex items-center justify-center">
          {/* Central logo with float animation */}
          <div className="absolute w-full h-full animate-float flex items-center justify-center">
            <img
              src={appLogo}
              alt="MyHealth"
              className="w-20 h-20 object-contain" // Adjusted size to fit within container
            />
          </div>

          {/* Orbiting elements representing community/health icons */}
          <div className="absolute inset-0 animate-spin-slow">
            <div className="absolute -top-2 left-1/2 w-4 h-4 bg-green-400 rounded-full transform -translate-x-1/2 shadow-lg"></div>
            <div className="absolute top-1/2 -right-2 w-3 h-3 bg-blue-400 rounded-full transform -translate-y-1/2 shadow-lg"></div>
            <div className="absolute -bottom-2 left-1/2 w-4 h-4 bg-green-500 rounded-full transform -translate-x-1/2 shadow-lg"></div>
            <div className="absolute top-1/2 -left-2 w-3 h-3 bg-blue-500 rounded-full transform -translate-y-1/2 shadow-lg"></div>
          </div>

          {/* Larger orbit */}
          <div className="absolute inset-0 animate-reverse-spin" style={{ animationDuration: '8s' }}>
            <div className="absolute -top-4 left-1/2 w-2 h-2 bg-green-300 rounded-full transform -translate-x-1/2 opacity-70"></div>
            <div className="absolute top-1/2 -right-4 w-2 h-2 bg-blue-300 rounded-full transform -translate-y-1/2 opacity-70"></div>
            <div className="absolute -bottom-4 left-1/2 w-2 h-2 bg-green-300 rounded-full transform -translate-x-1/2 opacity-70"></div>
            <div className="absolute top-1/2 -left-4 w-2 h-2 bg-blue-300 rounded-full transform -translate-y-1/2 opacity-70"></div>
          </div>
        </div>

        {/* Animated text (optional, commented out as in your original code) */}
        {/* <div className="text-center">
          <h3 className="text-blue-600 font-bold text-xl mb-2 animate-fade-in-out">Welcome to My Health</h3>
          <p className="text-gray-600 animate-fade-in-out" style={{ animationDelay: '0.5s' }}>
            Your healthcare community awaits
          </p>
        </div> */}
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes reverse-spin {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        
        @keyframes fade-in-out {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .animate-reverse-spin {
          animation: reverse-spin 6s linear infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-fade-in-out {
          animation: fade-in-out 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Loader;