import { useEffect, useState } from "react";
import { getAnalysisReports,submitAnalysisReports,cancelAnalysisReports } from "../../api/doctor/doctorApi";
import { useSelector } from "react-redux";
import { message } from "antd";


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

export function DoctorReportAnalysis() {
  const [reports,setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [resultText, setResultText] = useState("");
  const doctor = useSelector((state: any) => state.doctor.doctor);



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
    }
  };



  const handleSubmitResult = () => {
    console.log("Submit result:", resultText);

    if (!resultText.trim()) {
      message.error("Result cannot be empty");
      return;
    };
    const analysisId = selectedReport?._id;

    const submitResult = async () => {
      if (!analysisId) {
        message.error("Invalid report ID.");
        return;
      }
      try {
        const response = await submitAnalysisReports(analysisId, resultText);
        setSelectedReport(null);
        setResultText("");
        // Update only the submitted report in the state
        if (response && response._id) {
        message.success("Result submitted successfully");
          setReports((prevReports) =>
            prevReports.map((report) =>
              report._id === response._id ? { ...report, ...response } : report
            )
          );
        }
      } catch (error) {
        console.error("Error submitting result:", error);
        message.error("Failed to submit result. Please try again later.");
      }
    }

    submitResult();
    setSelectedReport(null);
    setResultText("");
  };

   useEffect(() => {
      const fetchReports = async () => {
        try {
          const response = await getAnalysisReports(doctor._id);
          setReports(response);
        } catch (error) {
          console.error("Error fetching reports:", error);
          message.error("Failed to fetch reports. Please try again later.");
        }
      };
  
      fetchReports();
    }
    , [doctor._id]);

  return (
    <div className="p-4 space-y-4">

      {reports.length === 0 && (
        <div className="text-center text-gray-500">
          <p>No reports available</p>
        </div>
      )}

      {reports.map((report) => (
        <div key={report._id} className="border rounded-xl shadow p-4 bg-white">
          <h2 className="text-lg font-semibold">User Report</h2>
          <p className="text-sm">Concern: {report.concerns}</p>
          <p className="text-sm">Status: {report.analysisStatus}</p>
          {report.analysisStatus === "pending" && (
            <div className="flex gap-2 mt-2">
              <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={() => handleCancel(report)}>Cancel</button>
              <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={() => setSelectedReport(report)}>Add Result</button>
            </div>
          )}
          {report.analysisStatus === "submited" && (
            <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setSelectedReport(report)}>View Result</button>
          )}
        </div>
      ))}

      {selectedReport && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {selectedReport.analysisStatus === "pending" ? "Add Result" : "Report Details"}
            </h2>
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
            {selectedReport.analysisStatus === "submited" ? (
              <p><strong>Result:</strong> {selectedReport.result}</p>
            ) : (
              <textarea
                className="mt-2 w-full border p-2 rounded resize-none"
                rows={8}
                value={resultText}
                onChange={(e) => setResultText(e.target.value)}
                placeholder="Enter result here..."
              />
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 bg-gray-500 text-white rounded" onClick={() => setSelectedReport(null)}>Close</button>
              {selectedReport.analysisStatus === "pending" && (
                <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={handleSubmitResult}>Submit</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}