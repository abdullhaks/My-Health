import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";

interface BankDetails {
    bankAccNo?:string,
    bankAccHolderName?:string,
    bankIfscCode?: string
}


interface PayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profileData: BankDetails) => void;
  initialData: BankDetails;
}


const DoctorPayoutModal = ({ isOpen, onClose, onSave,initialData }: PayoutModalProps) => {

  const [formData, setFormData] = useState<BankDetails>(initialData);

  const [errors, setErrors] = useState<Partial<BankDetails>>({});
 

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
      setErrors({});
    }
  }, [isOpen, initialData]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    let error: string | undefined;
    switch (name) {
      
      case "bankAccNo":
        if (value && !/^[0-9]{9,18}$/.test(value)) error = "Bank account number must be 9-18 digits";
        break;
      case "bankAccHolderName":
        if (value && !/^[a-zA-Z\s.-]+$/.test(value))
          error = "Account holder name can only contain letters, spaces, periods, or hyphens";
        break;
      case "bankIfscCode":
        if (value && !/^[A-Z]{4}[0][A-Z0-9]{6}$/.test(value)) error = "Invalid IFSC code format (e.g., SBIN0001234)";
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  
const validateForm = (): boolean => {

    const newErrors: Partial<BankDetails> = {};

    if (formData.bankAccNo && !/^[0-9]{9,18}$/.test(formData.bankAccNo)) {
      newErrors.bankAccNo = "Bank account number must be 9-18 digits";
    }

    // Bank Account Holder Name (optional)
    if (formData.bankAccHolderName && !/^[a-zA-Z\s.-]+$/.test(formData.bankAccHolderName)) {
      newErrors.bankAccHolderName = "Account holder name can only contain letters, spaces, periods, or hyphens";
    }

    // IFSC Code (optional)
    if (formData.bankIfscCode && !/^[A-Z]{4}[0][A-Z0-9]{6}$/.test(formData.bankIfscCode)) {
      newErrors.bankIfscCode = "Invalid IFSC code format (e.g., SBIN0001234)";
    }

    setErrors(newErrors);

    console.log(Object.entries(newErrors));
    return Object.keys(newErrors).length === 0;
  };


const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {

      console.log("after vaidation.........");
       await onSave(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative animate-fadeIn">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Payout Request</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
         <div>
              <label htmlFor="bankAccNo">Bank Account Number</label>
              <input
                type="text"
                name="bankAccNo"
                value={formData.bankAccNo || ""}
                onChange={handleChange}
                placeholder="Your bank account number"
                className={`w-full px-3 py-2 border rounded-md ${errors.bankAccNo ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.bankAccNo && <p className="text-sm text-red-600">{errors.bankAccNo}</p>}
            </div>

            {/* Bank Account Holder Name */}
            <div>
              <label htmlFor="bankAccHolderName">Account Holder Name</label>
              <input
                type="text"
                name="bankAccHolderName"
                value={formData.bankAccHolderName || ""}
                onChange={handleChange}
                placeholder="Account holder name"
                className={`w-full px-3 py-2 border rounded-md ${errors.bankAccHolderName ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.bankAccHolderName && <p className="text-sm text-red-600">{errors.bankAccHolderName}</p>}
            </div>

            {/* IFSC Code */}
            <div>
              <label htmlFor="bankIfscCode">IFSC Code</label>
              <input
                type="text"
                name="bankIfscCode"
                value={formData.bankIfscCode || ""}
                onChange={handleChange}
                placeholder="e.g. SBIN0001234"
                className={`w-full px-3 py-2 border rounded-md ${errors.bankIfscCode ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.bankIfscCode && <p className="text-sm text-red-600">{errors.bankIfscCode}</p>}
            </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Submit
            </button>
          </div>

        </form>
        
      </div>
    </div>
  );
};

export default DoctorPayoutModal;
