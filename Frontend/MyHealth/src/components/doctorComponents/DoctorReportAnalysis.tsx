import { useState } from "react";

const dummyReports = [
  {
    _id: "1",
    doctorName: "Ravi K",
    doctorCategory: "Ayurvedha",
    fee: 50,
    concerns: "Headache",
    result: "Patient shows improvement...",
    files: ["https://myhealth-app-storage.s3.ap-south-1.amazonaws.com/healthReports/393482cb-5592-4336-9484-eb31a38020e8.jpg"],
    analysisStatus: "submited",
  },
  {
    _id: "2",
    doctorName: "Ravi K",
    doctorCategory: "Ayurvedha",
    fee: 50,
    concerns: "Back pain",
    result: "",
    files:  ["https://myhealth-app-storage.s3.ap-south-1.amazonaws.com/healthReports/393482cb-5592-4336-9484-eb31a38020e8.jpg"],
    analysisStatus: "pending",
  },
  {
    _id: "3",
    doctorName: "Ravi K",
    doctorCategory: "Ayurvedha",
    fee: 50,
    concerns: "Fever",
    result: "",
    files: [],
    analysisStatus: "cancelled",
  },
];


type Report = {
  _id: string;
  doctorName: string;
  doctorCategory: string;
  fee: number;
  concerns: string;
  result: string;
  files: string[];
  analysisStatus: string;
};

export function DoctorReportAnalysis() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [resultText, setResultText] = useState("");

  const handleSubmitResult = () => {
    console.log("Submit result:", resultText);
    setSelectedReport(null);
    setResultText("");
  };

  return (
    <div className="p-4 space-y-4">
      {dummyReports.map((report) => (
        <div key={report._id} className="border rounded-xl shadow p-4 bg-white">
          <h2 className="text-lg font-semibold">User Report</h2>
          <p className="text-sm">Concern: {report.concerns}</p>
          <p className="text-sm">Status: {report.analysisStatus}</p>
          {report.analysisStatus === "pending" && (
            <div className="flex gap-2 mt-2">
              <button className="px-4 py-2 bg-red-500 text-white rounded">Cancel</button>
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