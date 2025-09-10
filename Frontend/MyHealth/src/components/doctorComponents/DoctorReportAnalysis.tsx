import { useEffect, useState } from "react";
import { getAnalysisReports, submitAnalysisReports, cancelAnalysisReports } from "../../api/doctor/doctorApi";
import { useSelector } from "react-redux";
import { message, Popconfirm } from "antd";
import { FileText, Eye, X, User, AlertCircle, CheckCircle, Clock, XCircle, Send, Plus, Stethoscope } from "lucide-react";
import { IDoctorData } from "../../interfaces/doctor";

type Report = {
  _id: string;
  doctorName: string;
  userId: string;
  doctorId: string;
  doctorCategory: string;
  fee: number;
  concerns: string;
  result: string;
  files: string[];
  analysisStatus: string;
};

const DoctorReportAnalysis = ()=> {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [resultText, setResultText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const doctor = useSelector((state: IDoctorData) => state.doctor.doctor);

  const handleCancel = async (report: Report) => {
    const analysisId = report._id;
    const userId = report.userId;
    const fee = report.fee;
    
    if (!analysisId) {
      message.error("Invalid report ID.");
      return;
    }
    
    setCancellingId(analysisId);
    try {
      const response = await cancelAnalysisReports(analysisId, userId, fee);
      if (response && response._id) {
        message.success("Report cancelled successfully");
        setReports((prevReports) =>
          prevReports.map((r) =>
            r._id === response._id ? { ...r, analysisStatus: "cancelled" } : r
          )
        );
      }
    } catch (error) {
      console.error("Error cancelling report:", error);
      message.error("Failed to cancel report. Please try again later.");
    } finally {
      setCancellingId(null);
    }
  };

  const handleSubmitResult = async () => {
    if (!resultText.trim()) {
      message.error("Result cannot be empty");
      return;
    }
    
    const analysisId = selectedReport?._id;
    if (!analysisId) {
      message.error("Invalid report ID.");
      return;
    }
    
    setSubmittingId(analysisId);
    try {
      const response = await submitAnalysisReports(analysisId, resultText);
      if (response && response._id) {
        message.success("Result submitted successfully");
        setReports((prevReports) =>
          prevReports.map((report) =>
            report._id === response._id ? { ...report, ...response } : report
          )
        );
        setSelectedReport(null);
        setResultText("");
      }
    } catch (error) {
      console.error("Error submitting result:", error);
      message.error("Failed to submit result. Please try again later.");
    } finally {
      setSubmittingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "submited":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "submited":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const response = await getAnalysisReports(doctor._id);
        setReports(response);
      } catch (error) {
        console.error("Error fetching reports:", error);
        message.error("Failed to fetch reports. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [doctor._id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-purple-100">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-purple-700 to-pink-500 rounded-xl">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Patient Analysis Reports</h1>
              <p className="text-gray-600 mt-1">Review and manage patient medical analysis requests</p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {reports.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-purple-100">
            <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full inline-block mb-4">
              <FileText className="w-12 h-12 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Available</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              No patient analysis reports are currently pending. New requests will appear here for your review.
            </p>
          </div>
        )}

        {/* Reports Grid */}
        {reports.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {reports.map((report) => (
              <div
                key={report._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100 overflow-hidden"
              >
                <div className="p-4">
                  {/* Patient Info Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">Patient Report</h3>
                        <p className="text-purple-600 text-sm font-medium">Analysis Request</p>
                      </div>
                    </div>
                  </div>

                  {/* Fee */}
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-lg font-semibold text-green-600">₹{report.fee}</span>
                  </div>

                  {/* Status */}
                  <div className="mb-4">
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(report.analysisStatus)}`}>
                      {getStatusIcon(report.analysisStatus)}
                      <span className="capitalize">{report.analysisStatus}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    {report.analysisStatus === "pending" && (
                      <>
                    <Popconfirm
                          title="Cancel Report Analysis"
                          description="Are you sure to cancel this Analysis?"
                          onConfirm={() => handleCancel(report)}
                          okText="Yes"
                          cancelText="No" 
                          >


                        <button

                          disabled={cancellingId === report._id}
                          className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {cancellingId === report._id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Cancelling...</span>
                            </>
                          ) : (
                            <>
                              <X className="w-4 h-4" />
                              <span>Cancel</span>
                            </>
                          )}
                        </button>

                       </Popconfirm>

                        <button
                          onClick={() => setSelectedReport(report)}
                          className="flex-1 flex items-center justify-center space-x-2 px-2 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-colors text-sm"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Result</span>
                        </button>
                      </>
                    )}
                    {report.analysisStatus === "submited" && (
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Result</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {selectedReport && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-700 to-pink-500 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {selectedReport.analysisStatus === "pending" ? "Add Analysis Result" : "Patient Report Details"}
                      </h2>
                      <p className="text-purple-100">
                        {selectedReport.analysisStatus === "pending" ? "Provide your medical analysis" : "View completed analysis"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="space-y-6">
                  {/* Patient Concern */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Patient's Medical Concern</h3>
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <p className="text-gray-700 leading-relaxed">{selectedReport.concerns}</p>
                    </div>
                  </div>

                  {/* Files */}
                  {selectedReport.files.length > 0 ? (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Patient Files</h3>
                      <div className="grid gap-3">
                        {selectedReport.files.map((file, index) => (
                          <a
                            key={index}
                            href={file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group border border-purple-200"
                          >
                            <div className="p-2 bg-purple-100 group-hover:bg-purple-200 rounded-lg">
                              <FileText className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="text-purple-600 font-medium group-hover:text-purple-700">
                              Medical File {index + 1}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="p-3 bg-gray-100 rounded-full inline-block mb-3">
                        <FileText className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500">No files attached by patient</p>
                    </div>
                  )}

                  {/* Analysis Result */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {selectedReport.analysisStatus === "pending" ? "Your Analysis" : "Analysis Result"}
                    </h3>
                    {selectedReport.analysisStatus === "submited" ? (
                      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedReport.result}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <textarea
                          className="w-full border border-gray-300 rounded-xl p-4 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                          rows={10}
                          value={resultText}
                          onChange={(e) => setResultText(e.target.value)}
                          placeholder="Enter your detailed medical analysis and recommendations here..."
                        />
                        <p className="text-sm text-gray-500">
                          Provide a comprehensive analysis including diagnosis, recommendations, and follow-up instructions.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 p-4 border-t border-gray-200">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Close
                  </button>
                  {selectedReport.analysisStatus === "pending" && (



                      <Popconfirm
                          title="Submiting Report Analysis"
                          description="Are you sure to submit this Analysis Report?"
                          onConfirm={() => {handleSubmitResult()}}
                          okText="Yes"
                          cancelText="No" 
                          >


                         
                    <button
                     
                      disabled={submittingId === selectedReport._id || !resultText.trim()}
                      className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingId === selectedReport._id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Analysis</span>
                        </>
                      )}
                    </button>

                    </Popconfirm>

                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorReportAnalysis