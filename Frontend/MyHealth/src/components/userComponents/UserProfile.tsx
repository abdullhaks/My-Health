import avatar from "../../assets/avatar.png";
import { FiEdit, FiCopy } from "react-icons/fi";

const UserProfile = () => {
  const handleCopyReferID = () => {
    navigator.clipboard.writeText("www.myhealth.com/id:asrerefjaadlfj3422");
    // You could add a toast notification here
  };

  const handleCopyMHID = () => {
    navigator.clipboard.writeText("DR2342422");
    // You could add a toast notification here
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Profile Header */}
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
            <div className="relative">
              <img
                src={avatar}
                alt="Profile"
                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-blue-100"
              />
            </div>
            
            <div className="flex flex-col text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800">Stevan Dux</h2>
              
              <div className="mt-2 text-sm text-gray-500 space-y-1">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <span>refer id : www.myhealth.com/id:asrerefjaadlfj3422</span>
                  <button 
                    onClick={handleCopyReferID}
                    className="text-blue-500 hover:text-blue-700 cursor-pointer"
                    title="Copy Refer ID"
                  >
                    <FiCopy />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <span>mh-id : 2342422</span>
                  <button 
                    onClick={handleCopyMHID}
                    className="text-blue-500 hover:text-blue-700 cursor-pointer"
                    title="Copy MH ID"
                  >
                    <FiCopy />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="md:ml-auto mt-4 md:mt-0">
              <button className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded transition cursor-pointer">
                <FiEdit />
                <span>Edit</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Personal Information Section */}
        <div className="p-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Location</p>
              <p className="text-base">Kochi,Kerala</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Date Of Birth</p>
              <p className="text-base">03/04/1996</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Age</p>
              <p className="text-base">56</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="text-base">+ 91 2387428345</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Email Address</p>
              <p className="text-base">Email@gmail.com</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Gender</p>
              <p className="text-base">male</p>
            </div>
          </div>
        </div>
        
        {/* General Section */}
        <div className="p-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">General</h3>
          
          <div className="flex flex-col md:flex-row justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <p className="text-base mr-4">Change Password</p>
              <button className="text-blue-500 hover:text-blue-700 border border-blue-500 hover:border-blue-700 px-4 py-1 rounded text-sm transition cursor-pointer">
                Change
              </button>
            </div>
            
            <div className="flex items-center">
              <div className="mr-4">
                <p className="text-base">My Wallet</p>
                <p className="text-sm text-gray-500">balance: 200 rs</p>
              </div>
              {/* <button className="text-blue-500 hover:text-blue-700 border border-blue-500 hover:border-blue-700 px-4 py-1 rounded text-sm transition cursor-pointer">
                withdraw
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;