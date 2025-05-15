import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiEdit, FiCopy, FiCamera } from "react-icons/fi";
import toast from "react-hot-toast";
import EditDoctorProfileModal from "./DoctorProfileEdit";
import ChangePasswordModal from "./DoctorChangePassword";
import { updateProfileImage, updateDoctorProfile, changePassword } from "../../api/doctor/doctorApi";
import { updateDoctor } from "../../redux/slices/doctorSlices";

const DoctorProfile = () => {
  const doctor = useSelector((state: any) => state.doctor.doctor);
  const dispatch = useDispatch();

  const [profileData, setProfileData] = useState(doctor);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  useEffect(() => {
    setProfileData(doctor);
  }, [doctor]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSaveImage = async () => {
    if (!selectedImage) return;
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("profile", selectedImage);

      const response = await updateProfileImage(formData, doctor._id);

      console.log("updated doctor is :",response);

      const updatedDoctor = response.updatedDoctor;
      dispatch(updateDoctor(updatedDoctor));
      setProfileData(updatedDoctor);
      toast.success("Profile image updated!");
    } catch (error) {
      toast.error("Failed to update image.");
    } finally {
      setIsUploading(false);
      setSelectedImage(null);
      setPreviewImage(null);
    }
  };


  const handleCopyReferID = () => {
    navigator.clipboard.writeText(`www.myhealth.com/id:${profileData._id}`);
    toast.success("Refer ID copied!");
  };

  const handleCopyMHID = () => {
    navigator.clipboard.writeText("MH-DR-" + profileData._id.slice(0, 6).toUpperCase());
    toast.success("MH ID copied!");
  };

  const handleProfileUpdate = async (updatedData: any) => {
    try {
      const response = await updateDoctorProfile(updatedData, doctor._id);
      dispatch(updateDoctor(response.updatedDoctor));
      setProfileData(response.updatedDoctor);
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile.");
    }
  };

  const handlePasswordChange = async (passwordData: any) => {
    try {
      const response = await changePassword(passwordData, doctor._id);
      if (!response) {
        toast.error("Password change failed");
        return;
      }
      toast.success("Password changed");
    } catch {
      toast.error("Password change failed");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row gap-6">
          <div className="relative w-32 h-32">
            <img
              src={
                previewImage ||
                profileData.profile ||
                "https://myhealth-app-storage.s3.ap-south-1.amazonaws.com/users/profile-images/avatar.png"
              }
              className="w-full h-full object-cover rounded-full border-4 border-blue-200"
              alt="Doctor Profile"
            />
            <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow cursor-pointer hover:bg-gray-100">
              <FiCamera />
              <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            </label>
          </div>

          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Dr. {profileData.fullName}</h2>
              {profileData.isPremium && (
                <span className="bg-yellow-400 text-white text-sm px-3 py-1 rounded-full font-medium mt-2 md:mt-0">
                  Premium Doctor ⭐
                </span>
              )}
            </div>

            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span>Refer ID: www.myhealth.com/id:{profileData._id}</span>
                <FiCopy className="cursor-pointer text-blue-500" onClick={handleCopyReferID} />
              </div>
              <div className="flex items-center gap-2">
                <span>MH-ID: MH-DR-{profileData._id.slice(0, 6).toUpperCase()}</span>
                <FiCopy className="cursor-pointer text-blue-500" onClick={handleCopyMHID} />
              </div>
            </div>
          </div>

          <div className="self-start mt-4 md:mt-0">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
            >
              <FiEdit />
              Edit
            </button>
          </div>
        </div>

        {selectedImage && (
          <div className="px-6 pt-2 pb-4">
            <div className="flex gap-2">
              <button
                onClick={handleSaveImage}
                disabled={isUploading}
                className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 text-sm"
              >
                {isUploading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setPreviewImage(null);
                }}
                className="bg-gray-300 text-gray-800 px-4 py-1 rounded hover:bg-gray-400 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-t">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p>{profileData.email || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p>{profileData.phone || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">DOB</p>
            <p>{profileData.dob || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Gender</p>
            <p>{profileData.gender || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Specialization</p>
            <p>{profileData.specialization || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Experience</p>
            <p>{profileData.experience || "Not provided"} years</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Medical Reg. No</p>
            <p>{profileData.registrationNumber || "Not provided"}</p>
          </div>
        </div>

        <div className="p-6 border-t flex justify-between items-center">
          <div>
            <p className="text-sm">Change Password</p>
            <button
              onClick={() => setIsChangePasswordModalOpen(true)}
              className="text-blue-500 border border-blue-500 px-3 py-1 rounded text-sm hover:bg-blue-50"
            >
              Change
            </button>
          </div>
          <div>
            <p className="text-sm">Wallet Balance</p>
            <p className="text-gray-700 font-semibold">{profileData.walletBalance || 0} ₹</p>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditDoctorProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleProfileUpdate}
        initialData={profileData}
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

export default DoctorProfile;
