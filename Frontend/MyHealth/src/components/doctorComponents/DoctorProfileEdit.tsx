import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import GeoapifyAutocomplete from "../../sharedComponents/GeoapifyAutocomplete";


interface ILocation {
  type: "Point";
  coordinates: [number, number];
  text: string;
}

interface DoctorProfileData {
  fullName: string;
  location: ILocation;
  dob: string;
  phone: string;
  gender: string;
  specialization: string;
  experience: string;
  qualification?: string;
  locationText?: string;
  bankAccNo?: string;
  bankAccHolderName?: string;
  bankIfscCode?: string;
}

interface EditDoctorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profileData: DoctorProfileData) => void;
  initialData: DoctorProfileData;
}



const EditDoctorProfileModal = ({ isOpen, onClose, onSave, initialData }: EditDoctorProfileModalProps) => {
  const [formData, setFormData] = useState<DoctorProfileData>(initialData);
  const [errors, setErrors] = useState<Partial<DoctorProfileData>>({});

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
      case "fullName":
        if (!value.trim()) error = "Full name is required";
        else if (value.length < 3) error = "Full name must be at least 3 characters";
        else if (!/^[a-zA-Z\s.-]+$/.test(value)) error = "Full name can only contain letters, spaces, periods, or hyphens";
        break;
      case "phone":
        if (!value.trim()) error = "Phone number is required";
        else if (!/^\+?[0-9\s]{10,15}$/.test(value.replace(/\s/g, "")))
          error = "Invalid phone number format (10-15 digits)";
        break;
      case "dob":
        if (!value) error = "Date of birth is required";
        else {
          const dob = new Date(value);
          const today = new Date("2025-08-12");
          let age = today.getFullYear() - dob.getFullYear();
          const monthDiff = today.getMonth() - dob.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
          if (age < 18) error = "Doctor must be at least 18 years old";
        }
        break;
      case "gender":
        if (!value) error = "Gender is required";
        break;
      case "specialization":
        if (!value.trim()) error = "Specialization is required";
        else if (!/^[a-zA-Z\s-]+$/.test(value)) error = "Specialization can only contain letters, spaces, or hyphens";
        break;
      case "experience":
        if (!value) error = "Experience is required";
        else if (isNaN(Number(value)) || Number(value) < 0) error = "Experience must be a non-negative number";
        else if (Number(value) > 50) error = "Experience cannot exceed 50 years";
        break;
      case "qualification":
        if (!value.trim()) error = "Qualification is required";
        else if (!/^[a-zA-Z\s,]+$/.test(value)) error = "Qualification can only contain letters, spaces, or commas";
        break;
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

    console.log("form validation............");
    const newErrors: Partial<DoctorProfileData> = {};

    // Full Name
    if (!formData.fullName || formData.fullName.trim().length < 3) {
      newErrors.fullName = "Full name must be at least 3 characters";
    } else if (!/^[a-zA-Z\s.-]+$/.test(formData.fullName)) {
      newErrors.fullName = "Full name can only contain letters, spaces, periods, or hyphens";
    }

    // Location
    if (!formData.location || !formData.location.text || !formData.location.coordinates) {
      newErrors.locationText = "Location is required";
    }


    // Date of Birth
    if (!formData.dob) {
      newErrors.dob = "Date of birth is required";
    } else {
      const dob = new Date(formData.dob);
      const today = new Date("2025-08-12");
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
      if (age < 18) newErrors.dob = "Doctor must be at least 18 years old";
    }

    // Phone Number
    if (!formData.phone) {
      // newErrors.phone = "Phone number is required";
    } else if (!/^\+?[0-9\s]{10,15}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Invalid phone number format (10-15 digits)";
    }

    // Gender
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    // Specialization
    // if (!formData.specialization || formData.specialization.trim().length === 0) {
    //   newErrors.specialization = "Specialization is required";
    // } else 
      
      if (!/^[a-zA-Z\s-]+$/.test(formData.specialization)) {
      newErrors.specialization = "Specialization can only contain letters, spaces, or hyphens";
    }

    // Experience
    if (!formData.experience) {
      // newErrors.experience = "Experience is required";
    } else if (isNaN(Number(formData.experience)) || Number(formData.experience) < 0) {
      newErrors.experience = "Experience must be a non-negative number";
    } else if (Number(formData.experience) > 90) {
      newErrors.experience = "Experience cannot exceed 50 years";
    }

    // Qualification
    // if (!formData.qualification || formData.qualification.trim().length === 0) {
    //   newErrors.qualification = "Qualification is required";
    // } else if (!/^[a-zA-Z\s,]+$/.test(formData.qualification)) {
    //   newErrors.qualification = "Qualification can only contain letters, spaces, or commas";
    // }

    // Bank Account Number (optional)
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
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto relative animate-fadeIn max-h-[90vh] flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white z-10 p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Edit Doctor Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.fullName ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.fullName && <p className="text-sm text-red-600">{errors.fullName}</p>}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location">Location</label>
              <GeoapifyAutocomplete
                value={formData.location.text}
                onChange={(val) => setFormData((prev) => ({ ...prev, location: val }))}
                setError={(error) => setErrors((prev) => ({ ...prev, locationText: error }))}
                className={errors.locationText ? "border-red-500" : "border-gray-300"}
              />
              {errors.locationText && <p className="text-sm text-red-600">{errors.locationText}</p>}
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="dob">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.dob ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.dob && <p className="text-sm text-red-600">{errors.dob}</p>}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +91 9876543210"
                className={`w-full px-3 py-2 border rounded-md ${errors.phone ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.gender ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <p className="text-sm text-red-600">{errors.gender}</p>}
            </div>

            {/* Specialization */}
            <div>
              <label htmlFor="specialization">Specialization</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                placeholder="e.g. Cardiology, Pediatrics"
                className={`w-full px-3 py-2 border rounded-md ${errors.specialization ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.specialization && <p className="text-sm text-red-600">{errors.specialization}</p>}
            </div>

            {/* Years of Experience */}
            <div>
              <label htmlFor="experience">Years of Experience</label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                min="0"
                className={`w-full px-3 py-2 border rounded-md ${errors.experience ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.experience && <p className="text-sm text-red-600">{errors.experience}</p>}
            </div>

            {/* Qualification */}
            {/* <div>
              <label htmlFor="qualification">Qualification</label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                placeholder="e.g. MBBS, MD"
                className={`w-full px-3 py-2 border rounded-md ${errors.qualification ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.qualification && <p className="text-sm text-red-600">{errors.qualification}</p>}
            </div> */}

            {/* Bank Account Number */}
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
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn border-gray-300 bg-white text-gray-700">
              Cancel
            </button>
            <button type="submit" className="p-1 rounded-sm btn bg-blue-600 text-white cursor-pointer hover:bg-blue-800">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDoctorProfileModal;