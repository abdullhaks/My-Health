import { useEffect, useState } from "react";
import { getAnalysisReports, cancelAnalysisReports } from "../../api/user/userApi";
import { useDispatch, useSelector } from "react-redux";
import { message, Popconfirm } from "antd";
import { updateUser } from "../../redux/slices/userSlices";
import { FileText, Eye, X,User,AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { IUserData } from "../../interfaces/user";

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

const UserReportAnalysis = ()=> {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const user = useSelector((state: IUserData) => state.user.user);
  const dispatch = useDispatch();

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
      if (response.userWithoutPassword && response.response._id) {
        message.success("Report cancelled successfully");
        dispatch(updateUser(response.userWithoutPassword));
        setReports((prevReports) =>
          prevReports.map((r) =>
            r._id === response.response._id ? { ...r, analysisStatus: "cancelled" } : r
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
        const response = await getAnalysisReports(user._id);
        setReports(response);
      } catch (error) {
        console.error("Error fetching reports:", error);
        message.error("Failed to fetch reports. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [user._id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-blue-100">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analysis Reports</h1>
              <p className="text-gray-600 mt-1">Track your medical analysis reports and results</p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {reports.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-blue-100">
            <div className="p-4 bg-blue-50 rounded-full inline-block mb-4">
              <FileText className="w-12 h-12 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Available</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              You haven't submitted any analysis reports yet. Once you do, they'll appear here for you to track and review.
            </p>
          </div>
        )}

        {/* Reports Grid */}
        {reports.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {reports.map((report) => (
              <div
                key={report._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100 overflow-hidden"
              >
                <div className="p-4">
                  {/* Doctor Info */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{report.doctorName}</h3>
                        <p className="text-blue-600 text-sm font-medium">{report.doctorCategory}</p>
                      </div>
                    </div>
                  </div>

                  {/* Fee */}
                  <div className="flex items-center space-x-2 mb-1">  
                    <span className="text-lg font-semibold text-green-600">₹{report.fee}</span>
                  </div>

                  {/* Concerns */}
                  {/* <div className="mb-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-0">Medical Concern:</h4>
                    <p className="text-gray-600 text-sm bg-gray-50 p-1 rounded-lg leading-relaxed">
                      {report.concerns}
                    </p>
                  </div> */}

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
                            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                          className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
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
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {selectedReport.analysisStatus === "submited" ? "Analysis Report" : "Report Details"}
                      </h2>
                      <p className="text-blue-100">
                        {selectedReport.analysisStatus === "submited" 
                          ? "Detailed medical analysis results" 
                          : "Report information and submitted documents"}
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
              <div className="p-2 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="space-y-6">
                  {/* Doctor Info */}
                  <div className="bg-blue-50 rounded-xl p-2">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Dr. {selectedReport.doctorName}</h3>
                        <p className="text-blue-600 text-sm">{selectedReport.doctorCategory}</p>
                      </div>
                    </div>
                  </div>

                  {/* Medical Concern */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Medical Concern</h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-700 leading-relaxed">{selectedReport.concerns}</p>
                    </div>
                  </div>

                  {/* Files */}
                  {selectedReport.files.length > 0 ? (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Attached Files</h3>
                      <div className="grid gap-3">
                        {selectedReport.files.map((file, index) => (
                          <a
                            key={index}
                            href={file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                          >
                            <div className="p-2 bg-blue-100 group-hover:bg-blue-200 rounded-lg">
                              <FileText className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-blue-600 font-medium group-hover:text-blue-700">
                              Medical File {index + 1}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="p-3 bg-gray-100 rounded-full inline-block mb-2">
                        <FileText className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500">No files attached</p>
                    </div>
                  )}

                  {/* Analysis Result - Only show when status is "submited" */}
                  {selectedReport.analysisStatus === "submited" && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis Result</h3>
                      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedReport.result}</p>
                      </div>
                    </div>
                  )}

                  {/* Status indicator for pending reports */}
                  {selectedReport.analysisStatus === "pending" && (
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-amber-600" />
                        <div>
                          <h4 className="font-semibold text-amber-800">Analysis in Progress</h4>
                          <p className="text-amber-700 text-sm">Your report is being analyzed by the doctor. You will receive the results once the analysis is complete.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 p-4 border-t border-gray-200">
                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserReportAnalysis;