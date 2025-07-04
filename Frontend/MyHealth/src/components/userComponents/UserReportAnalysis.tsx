import { useEffect, useState } from "react";
import { getAnalysisReports,cancelAnalysisReports } from "../../api/user/userApi";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";
import { updateUser } from "../../redux/slices/userSlices";



type Report = {
  _id: string;
  doctorName: string;
  userId:string;
  doctorId: string;
  doctorCategory: string;
  fee: number;
  concerns: string;
  result: string;
  files: string[];
  analysisStatus: string;
};

export function UserReportAnalysis() {
  const [reports,setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const user = useSelector((state: any) => state.user.user);
  const dispatch = useDispatch();



   const handleCancel = async (report: Report) => {
      const analysisId = report._id;
      const userId = report.userId; 
      const fee = report.fee; 
      if (!analysisId) {
        message.error("Invalid report ID.");
        return;
      }
      try {
        const response = await cancelAnalysisReports(analysisId,userId,fee);
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
      }
    };


  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await getAnalysisReports(user._id);
        setReports(response);
      } catch (error) {
        console.error("Error fetching reports:", error);
        message.error("Failed to fetch reports. Please try again later.");
      }
    };

    fetchReports();
  }
  , [user._id]);

  return (
    <div className="p-4 space-y-4">
      {reports.length === 0 && (
        <div className="text-center text-gray-500">
          <p>No reports available</p>
        </div>
      )}
      {reports.length > 0 && <h1 className="text-2xl font-bold mb-4">Your Analysis Reports</h1>}

      {
      reports.map((report) => (
        <div key={report._id} className="border rounded-xl shadow p-4 bg-white">
          <h2 className="text-lg font-semibold">Doctor: {report.doctorName} ({report.doctorCategory})</h2>
          <p className="text-sm">Fee: ₹{report.fee}</p>
          <p className="text-sm">Concern: {report.concerns}</p>
          <p className="text-sm">Status: {report.analysisStatus}</p>
          {report.analysisStatus === "pending" && (
            <button className="mt-2 px-4 py-2 bg-red-500 text-white rounded" onClick={() => handleCancel(report)}>Cancel</button>
          )}
          {report.analysisStatus === "submited" && (
            <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setSelectedReport(report)}>View Result</button>
          )}
        </div>
      ))}

      {selectedReport && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Report Details</h2>
            <p><strong>Concern:</strong> {selectedReport.concerns}</p>
            {selectedReport.files.length > 0 ? (
              <div className="mt-2">
                <strong>Files:</strong>
                <ul className="list-disc pl-5">
                  {selectedReport.files.map((file, index) => (
                    <li key={index} className="text-blue-500 hover:underline">
                      <a href={file} target="_blank" rel="noopener noreferrer">
                        View File {index + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>No files available</p>
            )}
            <p className="mt-2"><strong>Doctor:</strong> {selectedReport.doctorName} ({selectedReport.doctorCategory})</p>
            <p><strong>Result:</strong> {selectedReport.result}</p>
            <button className="mt-4 px-4 py-2 bg-gray-700 text-white rounded" onClick={() => setSelectedReport(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
