import { useState } from "react";
import avatar from "../../assets/avatar.png";
import { FiEdit, FiCopy } from "react-icons/fi";
import EditProfileModal from "./EditProfile";
import ChangePasswordModal from "./ChangePassword";

const UserProfile = () => {
  // State for user profile data
  const [profileData, setProfileData] = useState({
    fullName: "Stevan Dux",
    location: "Kochi,Kerala",
    dateOfBirth: "1996-04-03", // Format for date input
    phoneNumber: "+ 91 2387428345",
    gender: "male",
    walletBalance: "200"
  });

  // State for modals
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  
  // Function to handle copy operations
  const handleCopyReferID = () => {
    navigator.clipboard.writeText("www.myhealth.com/id:asrerefjaadlfj3422");
    // You could add a toast notification here
    alert("Refer ID copied to clipboard!");
  };

  const handleCopyMHID = () => {
    navigator.clipboard.writeText("2342422");
    // You could add a toast notification here
    alert("MH ID copied to clipboard!");
  };

  // Function to handle profile update
  const handleProfileUpdate = (updatedData:any) => {
    setProfileData({
      ...profileData,
      ...updatedData
    });
    // Here you would typically make an API call to update the profile
    console.log("Profile updated:", updatedData);
    alert("Profile updated successfully!");
  };

  // Function to handle password change
  const handlePasswordChange = (passwordData:any) => {
    // Here you would typically make an API call to change the password
    console.log("Password change requested:", passwordData);
    alert("Password changed successfully!");
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth:any) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };
  
  // Format date for display (from YYYY-MM-DD to DD/MM/YYYY)
  const formatDate = (dateString:any) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
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
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800">{profileData.fullName}</h2>
              
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
              <button 
                onClick={() => setIsEditProfileModalOpen(true)}
                className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded transition cursor-pointer"
              >
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
              <p className="text-base">{profileData.location}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Date Of Birth</p>
              <p className="text-base">{formatDate(profileData.dateOfBirth)}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Age</p>
              <p className="text-base">{calculateAge(profileData.dateOfBirth)}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="text-base">{profileData.phoneNumber}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Email Address</p>
              <p className="text-base">Email@gmail.com</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Gender</p>
              <p className="text-base">{profileData.gender}</p>
            </div>
          </div>
        </div>
        
        {/* General Section */}
        <div className="p-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">General</h3>
          
          <div className="flex flex-col md:flex-row justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <p className="text-base mr-4">Change Password</p>
              <button 
                onClick={() => setIsChangePasswordModalOpen(true)}
                className="text-blue-500 hover:text-blue-700 border border-blue-500 hover:border-blue-700 px-4 py-1 rounded text-sm transition cursor-pointer"
              >
                Change
              </button>
            </div>
            
            <div className="flex items-center">
              <div className="mr-4">
                <p className="text-base">My Wallet</p>
                <p className="text-sm text-gray-500">balance: {profileData.walletBalance} rs</p>
              </div>
              <button className="text-blue-500 hover:text-blue-700 border border-blue-500 hover:border-blue-700 px-4 py-1 rounded text-sm transition cursor-pointer">
                withdraw
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Profile Modal */}
      <EditProfileModal 
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        onSave={handleProfileUpdate}
        initialData={{
          fullName: profileData.fullName,
          location: profileData.location,
          dateOfBirth: profileData.dateOfBirth,
          phoneNumber: profileData.phoneNumber,
          gender: profileData.gender
        }}
      />
      
      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        onSave={handlePasswordChange}
      />
    </div>
  );
};

export default UserProfile;