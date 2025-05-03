import { useState } from "react";
// import avatar from "../../assets/avatar.png";
import { FiEdit, FiCopy, FiCamera} from "react-icons/fi";
import EditProfileModal from "./EditProfile";
import ChangePasswordModal from "./ChangePassword";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { updateProfile } from "../../api/user/userApi";
import { changePassword } from "../../api/user/userApi";
import { updateProfileImage } from "../../api/user/userApi";
import { useDispatch } from "react-redux";
import { updateUser } from "../../redux/slices/userSlices";


const UserProfile = () => {

  const user = useSelector((state:any) => state.user.user);
  const dispatch = useDispatch();

  const [profileData , setProfileData] = useState(user);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);


  // State for modals
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  

  //image update...........

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {

    console.log("e.target is ",e.target.files?.[0])
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleCancelImageUpdate = () => {
    setSelectedImage(null);
    setPreviewImage(null);
  };

  const handleSaveImage = async () => {
    if (!selectedImage) return;

    try {
      setIsUploading(true);
      const formData = new FormData();

  
      formData.append("profile", selectedImage);

      const response = await updateProfileImage(formData, user._id); 

      console.log("response is............ ",response)
      const updatedUser  = response.updatedUser;

      console.log("updatedUser is ",updatedUser);
      
      dispatch(updateUser(updatedUser));
      setProfileData(updatedUser);

      toast.success("Profile image updated!");
    } catch (error) {
      toast.error("Failed to update image.");
    } finally {
      setIsUploading(false);
      handleCancelImageUpdate();
    }
  };


  // Function to handle copy operations
  const handleCopyReferID = () => {
    navigator.clipboard.writeText("www.myhealth.com/id:asrerefjaadlfj3422");
    // You could add a toast notification here
    toast.success("Refer ID copied to clipboard!");
  };

  const handleCopyMHID = () => {
    navigator.clipboard.writeText("2342422");
    // You could add a toast notification here
    toast.success("MH ID copied to clipboard!");
  };

  // Function to handle profile update
  const handleProfileUpdate = async(updatedData:any) => {

    console.log("data for update....",updatedData)
    const response = await updateProfile(updatedData,user._id);
    console.log("Profile update response:", response);
    const { updatedUser } = response;

    dispatch(updateUser(updatedUser))
    
    setProfileData(updatedUser);

    // Here you would typically make an API call to update the profile
    console.log("Profile updated:", updatedData);
    toast .success("Profile updated successfully!");
  };

  // Function to handle password change
  const handlePasswordChange = async (passwordData:any) => {
   
    try{
    console.log("Password change requested:", passwordData);
    const response = await changePassword (passwordData,user._id);
    console.log("password change response is ", response);

    if(!response){
      toast.error("changin password has been failed")
      return
    }

    toast.success("password changed")

    }catch(error){
      toast.error("changin password has been failed")
    }
    

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
  
  

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Profile Header */}
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
             <div className="relative w-32 h-32">
              <img
                src={previewImage || profileData.profile || `https://myhealth-app-storage.s3.ap-south-1.amazonaws.com/users/profile-images/avatar.png`}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-4 border-blue-100"
              />
              <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow cursor-pointer hover:bg-gray-100">
                <FiCamera />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            </div>

            {selectedImage && (
              <div className="flex flex-col items-center gap-2 mt-4">
                <button
                  onClick={handleSaveImage}
                  disabled={isUploading}
                  className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition text-sm"
                >
                  {isUploading ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={handleCancelImageUpdate}
                  disabled={isUploading}
                  className="bg-gray-300 text-gray-800 px-4 py-1 rounded hover:bg-gray-400 transition text-sm"
                >
                  Cancel
                </button>
              </div>
            )}
            
            <div className="flex flex-col text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800">{profileData.fullName}</h2>
              
              <div className="mt-2 text-sm text-gray-500 space-y-1">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <span>refer id : www.myhealth.com/id:{profileData._id}</span>
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
              <p className="text-base">{profileData?.location?.text || "not provided" }</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Date Of Birth</p>
              <p className="text-base">{profileData.dob || "not provided"}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Age</p>
              <p className="text-base">{calculateAge(profileData.dob) || "not provided"}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="text-base">{profileData.phone || "not provided"}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Email Address</p>
              <p className="text-base">{profileData.email || "not provided"}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Gender</p>
              <p className="text-base">{profileData.gender || "not provided"}</p>
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
          dob: profileData.dob,
          phone: profileData.phone,
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