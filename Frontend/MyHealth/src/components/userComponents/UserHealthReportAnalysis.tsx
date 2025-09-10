import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createOneTimePayment, directFileUpload } from "../../api/user/userApi";
import { message } from "antd";
import { useSelector } from "react-redux";
import { IUserData } from "../../interfaces/user";
import { reportAnalysisData } from "../../interfaces/reportAnalysis";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const UserHealthReportAnalysis = () => {
  const { state, search } = useLocation();
  const navigate = useNavigate();
  const doctor = state?.doctor || null;
  const user = useSelector((state: IUserData) => state.user.user);
  const [concerns, setConcerns] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [reports, setReports] = useState<reportAnalysisData[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const maxFiles = 5;
  const maxFileSize = 5 * 1024 * 1024; // 5MB per file

  useEffect(() => {
    if (!doctor) {
      toast.error("No doctor selected. Redirecting...");
      setTimeout(() => navigate("/doctors"), 2000);
      return;
    }
    // fetchUserReports();

    // Check for session_id in URL after Stripe redirect
    const params = new URLSearchParams(search);
    const sessionId = params.get("session_id");
    if (sessionId) {
      // verifyPayment(sessionId);
    }
  }, [doctor, navigate, search]);

  // const fetchUserReports = async () => {
  //   try {
  //     setLoadingReports(true);
  //     const res = await axios.get("/api/user/reports", {
  //       headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  //     });
  //     setReports(res.data.reports.filter((report) => report.doctorId === doctor._id));
  //   } catch (error) {
  //     toast.error("Failed to load reports.");
  //   } finally {
  //     setLoadingReports(false);
  //   }
  // };

  // const verifyPayment = async (sessionId: string) => {
  //   try {
  //     setPaymentStatus("processing");
  //     const { data } = await axios.get(`/api/payment/verify-session/${sessionId}`, {
  //       headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  //     });
  //     if (data.status === "completed") {
  //       setPaymentStatus("success");
  //       await handleUpload(sessionId);
  //       toast.success("Payment successful! Report submitted.");
  //     } else {
  //       setPaymentStatus("error");
  //       toast.error("Payment not completed.");
  //     }
  //   } catch (error) {
  //     setPaymentStatus("error");
  //     toast.error("Error verifying payment.");
  //   }
  // };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter((file) => {
      if (file.size > maxFileSize) {
        toast.error(`${file.name} exceeds 5MB limit.`);
        return false;
      }
      return true;
    });

    if (files.length + validFiles.length > maxFiles) {
      toast.error(`You can upload up to ${maxFiles} files.`);
      return;
    }

    setFiles([...files, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handlePayment = async () => {
    if (!concerns.trim()) {
      toast.error("Please enter your health concerns.");
      return;
    }
    if (files.length === 0) {
      toast.error("Please upload at least one document.");
      return;
    }

    try {
      setUploading(true);
      const urls = files.map(async(file,indx) =>{

        message.loading({ content: `Uploading file ${indx + 1} of ${files.length}`, key: "upload" });
        const formData = new FormData();
        formData.append("doc", file);
        formData.append("location", "healthReports");
        const uploadResult = await directFileUpload(formData);
        if (!uploadResult?.url) {
          throw new Error("Failed to upload file");
        };

        return uploadResult.url;
      });

      const uploadedFiles = await Promise.all(urls);
      console.log("uploadedFiles",uploadedFiles);

      setPaymentStatus("processing");
      const amountInPaise = doctor.reportAnalysisFees * 100; // Convert to paise
      const metadata = {
        doctorId: doctor._id,
        doctorName: doctor.fullName,
        doctorCategory: doctor.category,
        userId: user._id, 
        concerns,
        file1: uploadedFiles[0] || "",
        file2: uploadedFiles[1] || "",
        file3: uploadedFiles[2] || "",
        file4: uploadedFiles[3] || "",
        file5: uploadedFiles[4] || "",
        fee: doctor.reportAnalysisFees,
        role: "user",
        type: "report_analysis",
      };


      const data = await createOneTimePayment(amountInPaise, metadata);
      console.log("Payment data:", data);
            const stripe = await stripePromise;
      
            if (stripe) {
              window.location.href = data.url;
            } else {
              throw new Error("Stripe initialization failed.");
            }

    } catch (error) {
      setPaymentStatus("error");
      toast.error("Error initiating payment.");
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async (sessionId: string) => {
    try {
      setUploading(true);
      const uploadPromises = files.map(async (file) => {
        const { data } = await axios.post(
          "/api/upload/s3-presigned-url",
          { fileName: file.name, fileType: file.type },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        await axios.put(data.url, file, { headers: { "Content-Type": file.type } });
        return data.key;
      });

      const s3Keys = await Promise.all(uploadPromises);

      // Save report data to database
      const { data: report } = await axios.post(
        "/api/user/reports",
        {
          doctorId: doctor._id,
          concerns,
          documents: s3Keys,
          stripeSessionId: sessionId,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setReports([...reports, report]);
      setConcerns("");
      setFiles([]);
    } catch (error) {
      toast.error("Failed to upload report.");
    } finally {
      setUploading(false);
    }
  };

  if (!doctor) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        {/* Doctor Details */}
        <div className="flex items-center gap-4 mb-6">
          <img
            src={doctor.profile || "https://myhealth-app-storage.s3.ap-south-1.amazonaws.com/users/profile-images/avatar.png"}
            alt="Doctor"
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Dr. {doctor.fullName}</h2>
            <p className="text-sm text-gray-600">{doctor.category} Specialist</p>
            <p className="text-sm text-gray-600">Fee: Rs: {doctor.reportAnalysisFees}</p>
          </div>
        </div>

        {/* Concerns Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">Health Concerns</label>
          <textarea
            className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            value={concerns}
            onChange={(e) => setConcerns(e.target.value)}
            placeholder="Describe your health concerns..."
          />
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">
            Upload Health Documents (Max {maxFiles}, 5MB each)
          </label>
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="mt-1 w-full px-4 py-2 border rounded-lg"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                <span className="text-sm text-gray-700">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Status */}

        {/* {paymentStatus === "success" && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
            Payment successful! Report submitted.
          </div>
        )}
        {paymentStatus === "error" && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            Error processing payment. Please try again.
          </div>
        )} */}

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={uploading || paymentStatus === "processing"}
          className={`w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition ${
            uploading || paymentStatus === "processing" ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {uploading || paymentStatus === "processing" ? "Processing..." : `Pay Rs: ${doctor.reportAnalysisFees}`}
        </button>

        {/* Submitted Reports */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800">Your Submitted Reports</h3>
          {loadingReports ? (
            <p>Loading reports...</p>
          ) : reports.length === 0 ? (
            <p className="text-gray-600">No reports submitted yet.</p>
          ) : (
            <div className="space-y-4 mt-4">
              {reports.map((report) => (
                <div
                  key={report._id}
                  className="p-4 bg-gray-50 rounded-lg shadow flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm text-gray-600">
                      Submitted on: {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">Status: {report.analysisStatus}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/report-details/${report._id}`)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserHealthReportAnalysis;