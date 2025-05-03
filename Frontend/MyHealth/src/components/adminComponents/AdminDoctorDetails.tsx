import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaLock, FaUnlock } from "react-icons/fa";
import { doctorDetails } from "../../api/admin/adminApi";
import { verifyDoctor } from "../../api/admin/adminApi";
import { declineDoctor } from "../../api/admin/adminApi";
import { Popconfirm } from "antd";


interface DoctorDetails {
  _id: string;
  fullName: string;
  email: string;
  isBlocked: boolean;
  isVerified: boolean;
  profile:string;
  adminVerified: number;
  graduation: string;
  graduationCertificate: string;
  registerNo: string;
  registrationCertificate: string;
  verificationId: string;
  walletBalance: number;
  location?: any;
  specializations?: string[];
}

const AdminDoctorDetails = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState<DoctorDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const handleVerify = async (id:string) => {
    console.log(id);
    
    try {
      await verifyDoctor(id)
      setDoctor(prev => prev ? { ...prev, adminVerified: 1 } : prev);
    } catch (err) {
      console.error("Verification failed:", err);
    }
  };
  
  const handleDecline = async (id:string) => {

    console.log(id);
    
    try {
      await declineDoctor(id);
      setDoctor(prev => prev ? { ...prev, adminVerified: 2 } : prev);
    } catch (err) {
      console.error("Decline failed:", err);
    }
  };
 
  

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        if(id){
        const res = await doctorDetails(id);

        console.log("res from friend end....",res);
        setDoctor(res);
        }
      } catch (err) {
        console.error("Failed to load doctor:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  if (loading) return <p className="text-center mt-6">Loading...</p>;
  if (!doctor) return <p className="text-center mt-6 text-red-500">Doctor not found.</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-md shadow-md">
      <div className="flex flex-col md:flex-row items-start gap-6">
        {/* Profile Section */}
        <div className="w-full md:w-1/3 flex justify-center">
          <div className="w-40 h-40  bg-gray-200 flex items-center justify-center text-gray-500 text-xl">
          <img src={doctor.profile?doctor.profile :"https://myhealth-app-storage.s3.ap-south-1.amazonaws.com/users/profile-images/avatar.png"} alt="User profile" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Info Section */}
        <div className="w-full md:w-2/3 space-y-4">
          <h2 className="text-2xl font-bold text-green-700">Dr. {doctor.fullName}</h2>
          <p><strong>Email:</strong> {doctor.email}</p>
          <p><strong>Graduation:</strong> {doctor.graduation}</p>
          <p><strong>Register No:</strong> {doctor.registerNo}</p>
          <p>
            <strong>Admin Verification:</strong>{" "}
            {doctor.adminVerified === 0 ? (
              <span className="text-blue-600 font-semibold">Pending</span>
            ) : doctor.adminVerified === 1 ? (
              <span className="text-green-600 font-semibold flex items-center">
                <FaCheckCircle className="mr-1" /> Verified
              </span>
            ) : (
              <span className="text-red-600 font-semibold flex items-center">
                <FaTimesCircle className="mr-1" /> Rejected
              </span>
            )}
          </p>
          <p>
            <strong>Account Status:</strong>{" "}
            {doctor.isBlocked ? (
              <span className="text-red-600 font-semibold flex items-center">
                <FaLock className="mr-1" /> Blocked
              </span>
            ) : (
              <span className="text-green-600 font-semibold flex items-center">
                <FaUnlock className="mr-1" /> Active
              </span>
            )}
          </p>

          {/* Certificates */}
          <div className="mt-4">
            <p><strong>Graduation Certificate:</strong></p>
            <a
              href={doctor.graduationCertificate}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              View Graduation Certificate
            </a>

            <p><strong>Registration Certificate:</strong></p>
            <a
              href={doctor.registrationCertificate}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              View Registration Certificate
            </a>

            <p><strong>Verification ID:</strong></p>
            <a
              href={doctor.verificationId}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              View Verification ID
            </a>



          </div>

          {doctor.adminVerified === 0 ? (
            <div className="flex flex-col sm:flex-row gap-8 mt-2">

              <Popconfirm
                                      title="Decline Doctor"
                                      description ={`Are you sure to Decline this Doctor?`}
                                      onConfirm={() => handleDecline(doctor._id)}
                                      // onCancel={cancel}
                                      okText="Yes"
                                      cancelText="No"
                                    >
              
            <button
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
                Decline
            </button>

            </Popconfirm>

            <Popconfirm
                title="Verify Doctor"
                description ={`Are you sure to Verify this Doctor?`}
                onConfirm={() => handleVerify(doctor._id)}
                // onCancel={cancel}
                okText="Yes"
                cancelText="No"
              >

            <button
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
                Verify
            </button>
            </Popconfirm>
            
            </div>
        ) : doctor.adminVerified === 1 ? (
            <span className="text-green-600 font-semibold flex items-center">
            <FaCheckCircle className="mr-1" /> Verified
            </span>
        ) : (
            <span className="text-red-600 font-semibold flex items-center">
            <FaTimesCircle className="mr-1" /> Rejected
            </span>
        )}
        </div>
      </div>
    </div>
  );
};

export default AdminDoctorDetails;
