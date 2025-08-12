import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, message } from "antd";
import { ArrowLeft, Download, Pill, Calendar, User, FileText } from "lucide-react";
import moment from "moment";
import { jsPDF } from "jspdf";
import { getPrescription } from "../../api/user/userApi";
import appLogoblue from "../../assets/appLogoblue.png";

interface Prescription {
  _id: string;
  appointmentId: string;
  userId: string;
  doctorId: string;
  medicalCondition: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    notes: string;
  }[];
  createdAt: string;
  user: {
    fullName: string;
    dob: Date;
  };
  doctor: {
    fullName: string;
    graduation: string;
    category: string;
    registerNo: string;
  };
}

const UserPrescriptionDetails = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const logoUrl = "https://myhealth-app-storage.s3.ap-south-1.amazonaws.com/app-images/applogoblue.png";

  const fetchPrescription = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      if (!appointmentId) return;

      const response = await getPrescription(appointmentId);
      if (response) {
        console.log("prescription response is:", response);
        setPrescription({
          ...response.prescription,
          user: response.user,
          doctor: response.doctor,
        });
      } else {
        setErrorMessage("Failed to load prescription details.");
      }
    } catch (error) {
      console.error("Error fetching prescription:", error);
      setErrorMessage("Failed to load prescription details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (appointmentId) fetchPrescription();
  }, [appointmentId]);

  const calculateAge = (dob: Date) => {
    return moment().diff(moment(dob), "years");
  };

  const downloadPDF = () => {
    if (!prescription) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let y = margin;

    // Header border
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(1);
    doc.line(margin, 15, pageWidth - margin, 15);

    // Add logo and clinic header
    try {
      doc.addImage(appLogoblue, "PNG", margin, y, 35, 18);
    } catch (e) {
      console.log("Logo not loaded");
    }
    
    // Clinic name and details
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185);
    doc.text("MyHealth App", pageWidth - margin, y + 5, { align: "right" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Digital Healthcare Solutions", pageWidth - margin, y + 12, { align: "right" });
    doc.text("Registration: MH-2025-DIGITAL", pageWidth - margin, y + 18, { align: "right" });

    y += 35;

    // Prescription header
  
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(14);
    doc.setFont("helvetica",);
    doc.text("PRESCRIPTION", margin + 15, y);
    
    // Date and Prescription ID
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Date: ${moment(prescription.createdAt).format("DD/MM/YYYY")}`, pageWidth - margin, y - 8, { align: "right" });
    doc.text(`Rx No: ${prescription._id.slice(-8).toUpperCase()}`, pageWidth - margin, y + 2, { align: "right" });

    y += 25;

    // Patient Information Box
    doc.setFillColor(248, 249, 250);
    doc.rect(margin, y - 5, pageWidth - 2 * margin, 35, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.rect(margin, y - 5, pageWidth - 2 * margin, 35);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("PATIENT INFORMATION", margin + 5, y + 5);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${prescription.user.fullName}`, margin + 5, y + 15);
    doc.text(`Age: ${calculateAge(prescription.user.dob)} years`, margin + 5, y + 23);
    doc.text(`Patient ID: ${prescription.userId.slice(-8).toUpperCase()}`, pageWidth/2 + 10, y + 15);
    doc.text(`Date of Birth: ${moment(prescription.user.dob).format("DD/MM/YYYY")}`, pageWidth/2 + 10, y + 23);

    y += 45;

    // Doctor Information Box
    doc.setFillColor(235, 247, 255);
    doc.rect(margin, y - 5, pageWidth - 2 * margin, 35, 'F');
    doc.setDrawColor(41, 128, 185);
    doc.rect(margin, y - 5, pageWidth - 2 * margin, 35);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("PRESCRIBING PHYSICIAN", margin + 5, y + 5);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Dr. ${prescription.doctor.fullName}`, margin + 5, y + 15);
    doc.text(`${prescription.doctor.graduation}`, margin + 5, y + 23);
    doc.text(`Specialty: ${prescription.doctor.category}`, pageWidth/2 + 10, y + 15);
    doc.text(`Reg. No: ${prescription.doctor.registerNo}`, pageWidth/2 + 10, y + 23);

    y += 45;

    // Diagnosis
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("DIAGNOSIS:", margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const diagnosisLines = doc.splitTextToSize(prescription.medicalCondition, pageWidth - 2 * margin);
    doc.text(diagnosisLines, margin, y);
    y += diagnosisLines.length * 5 + 10;

    // Medications Header
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("MEDICATIONS PRESCRIBED:", margin, y);
    y += 12;

    // Medications Table Header
    doc.setFillColor(41, 128, 185);
    doc.rect(margin, y - 5, pageWidth - 2 * margin, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("S.No", margin + 3, y + 2);
    doc.text("MEDICATION", margin + 20, y + 2);
    doc.text("DOSAGE", margin + 80, y + 2);
    doc.text("FREQUENCY", margin + 115, y + 2);
    doc.text("DURATION", margin + 155, y + 2);
    y += 12;

    // Medications List
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    prescription.medications.forEach((med, index) => {
      if (y > pageHeight - 40) {
        doc.addPage();
        y = margin;
      }

      // Alternating row colors
      if (index % 2 === 0) {
        doc.setFillColor(248, 249, 250);
        doc.rect(margin, y - 2, pageWidth - 2 * margin, 25, 'F');
      }

      doc.setFontSize(9);
      doc.text(`${index + 1}.`, margin + 3, y + 5);
      
      // Medication name (bold)
      doc.setFont("helvetica", "bold");
      const medNameLines = doc.splitTextToSize(med.name, 55);
      doc.text(medNameLines, margin + 20, y + 5);
      
      doc.setFont("helvetica", "normal");
      doc.text(med.dosage, margin + 80, y + 5);
      doc.text(med.frequency, margin + 115, y + 5);
      doc.text(med.duration, margin + 155, y + 5);

      // Instructions
      if (med.instructions) {
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        const instrLines = doc.splitTextToSize(`Instructions: ${med.instructions}`, pageWidth - 2 * margin - 20);
        doc.text(instrLines, margin + 20, y + 12);
      }

      // Notes
      if (med.notes) {
        doc.setFontSize(8);
        doc.setTextColor(200, 100, 100);
        const notesLines = doc.splitTextToSize(`Notes: ${med.notes}`, pageWidth - 2 * margin - 20);
        doc.text(notesLines, margin + 20, y + 18);
      }

      y += 30;
      doc.setTextColor(0, 0, 0);
    });

    // Footer
    y = pageHeight - 40;
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("This is a digitally generated prescription. Please consult your physician before making any changes.", margin, y + 8);
    doc.text(`Generated on: ${moment().format("DD/MM/YYYY HH:mm")}`, margin, y + 15);
    
    // Doctor signature placeholder
    doc.setFont("helvetica", "italic");
    doc.text("Dr. " + prescription.doctor.fullName, pageWidth - margin, y + 8, { align: "right" });
    doc.setFontSize(7);
    doc.text("Digital Signature", pageWidth - margin, y + 15, { align: "right" });

    // Save PDF
    doc.save(`Prescription_${prescription.user.fullName.replace(/\s+/g, '_')}_${moment().format("DDMMYYYY")}.pdf`);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white min-h-screen">
      {/* Navigation Bar */}
      <div className="border-b border-blue-100 sticky top-0 z-10 backdrop-blur-md bg-white/90 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-full transition-all duration-200 flex items-center gap-2"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back</span>
            </button>
            <Button
              type="primary"
              icon={<Download size={18} />}
              onClick={downloadPDF}
              disabled={!prescription}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 border-none shadow-lg h-10 px-6 font-medium"
            >
              Download Prescription
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-3">
            <FileText className="text-red-500" size={20} />
            {errorMessage}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading prescription...</p>
          </div>
        ) : !prescription ? (
          <div className="text-center py-12">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 text-lg">No prescription found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-blue-100">
            {/* Medical Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <img src={appLogoblue} alt="MyHealth App" className=" h-16 bg-white p-2 rounded-lg shadow-lg" />
                  <div>
                    <h1 className="text-2xl font-bold">MyHealth App</h1>
                    <p className="text-blue-100">Digital Healthcare Solutions</p>
                    <p className="text-blue-200 text-sm">Registration: MH-2025-DIGITAL</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold mb-2">℞</div>
                  <p className="text-blue-100">Prescription</p>
                  <p className="text-blue-200 text-sm">Rx No: {prescription._id.slice(-8).toUpperCase()}</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Date and Basic Info */}
              <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={20} />
                  <span className="font-medium">Date:</span>
                  <span>{moment(prescription.createdAt).format("MMMM DD, YYYY")}</span>
                </div>
                <div className="text-gray-500 text-sm">
                  Generated at {moment(prescription.createdAt).format("HH:mm")}
                </div>
              </div>

              {/* Patient Information */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <User className="text-blue-600" size={24} />
                  <h3 className="text-xl font-semibold text-blue-900">Patient Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Full Name</p>
                    <p className="font-semibold text-gray-900 text-lg">{prescription.user.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Age</p>
                    <p className="font-semibold text-gray-900">{calculateAge(prescription.user.dob)} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Date of Birth</p>
                    <p className="font-semibold text-gray-900">{moment(prescription.user.dob).format("MMMM DD, YYYY")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Patient ID</p>
                    <p className="font-semibold text-gray-900 font-mono">{prescription.userId.slice(-8).toUpperCase()}</p>
                  </div>
                </div>
              </div>

              {/* Doctor Information */}
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-600 text-white p-2 rounded-full">
                    <User size={20} />
                  </div>
                  <h3 className="text-xl font-semibold text-green-900">Prescribing Physician</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Doctor Name</p>
                    <p className="font-semibold text-gray-900 text-lg">Dr. {prescription.doctor.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Qualification</p>
                    <p className="font-semibold text-gray-900">{prescription.doctor.graduation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Specialty</p>
                    <p className="font-semibold text-gray-900">{prescription.doctor.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Registration Number</p>
                    <p className="font-semibold text-gray-900 font-mono">{prescription.doctor.registerNo}</p>
                  </div>
                </div>
              </div>

              {/* Medical Condition/Diagnosis */}
              <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="text-amber-600" size={24} />
                  <h3 className="text-xl font-semibold text-amber-900">Diagnosis</h3>
                </div>
                <p className="text-gray-800 leading-relaxed text-lg bg-white p-4 rounded-lg border border-amber-100">
                  {prescription.medicalCondition}
                </p>
              </div>

              {/* Medications */}
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center gap-3 mb-6">
                  <Pill className="text-purple-600" size={24} />
                  <h3 className="text-xl font-semibold text-purple-900">Medications Prescribed</h3>
                </div>
                <div className="space-y-4">
                  {prescription.medications.map((med, index) => (
                    <div key={index} className="bg-white rounded-lg border border-purple-100 shadow-sm overflow-hidden">
                      <div className="bg-purple-600 text-white px-6 py-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-lg">{index + 1}. {med.name}</h4>
                          <span className="bg-purple-500 px-3 py-1 rounded-full text-sm font-medium">{med.dosage}</span>
                        </div>
                      </div>
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Frequency</p>
                          <p className="font-semibold text-gray-900 mb-3">{med.frequency}</p>
                          <p className="text-sm text-gray-600 mb-1">Duration</p>
                          <p className="font-semibold text-gray-900">{med.duration}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Instructions</p>
                          <p className="text-gray-800 mb-3 bg-gray-50 p-3 rounded text-sm leading-relaxed">{med.instructions}</p>
                          {med.notes && (
                            <>
                              <p className="text-sm text-gray-600 mb-1">Additional Notes</p>
                              <p className="text-red-700 bg-red-50 p-3 rounded text-sm leading-relaxed border border-red-200">{med.notes}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 pt-6 text-center text-gray-500">
                <p className="text-sm mb-2">This is a digitally generated prescription. Please consult your physician before making any changes.</p>
                <p className="text-xs">Generated on {moment().format("MMMM DD, YYYY [at] HH:mm")}</p>
                <div className="mt-4 text-right">
                  <p className="text-gray-700 font-medium">Dr. {prescription.doctor.fullName}</p>
                  <p className="text-xs text-gray-500 italic">Digital Signature</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPrescriptionDetails;