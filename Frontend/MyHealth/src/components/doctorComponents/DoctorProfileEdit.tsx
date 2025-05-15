import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import GeoapifyAutocomplete from "../../sharedComponents/GeoapifyAutocomplete";

interface EditDoctorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profileData: DoctorProfileData) => void;
  initialData: DoctorProfileData;
}

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
  qualification: string;
  locationText?: string;
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

    setFormData(prev => ({ ...prev, [name]: value }));

    let error: string | undefined;
    switch (name) {
      case "fullName":
        if (!value.trim()) error = "Full name is required";
        break;
      case "phone":
        if (!/^\+?[0-9\s]{10,15}$/.test(value.replace(/\s/g, "")))
          error = "Invalid phone number format";
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<DoctorProfileData> = {};

    if (!formData.fullName || formData.fullName.trim().length < 3) {
      newErrors.fullName = "Full name is required";
    }

    

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => { 
    e.preventDefault();

    if (validateForm()) {
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
                value={formData.location.text || ""}
                onChange={(val) => setFormData(prev => ({ ...prev, location: val }))}
                setError={(error) => setErrors(prev => ({ ...prev, locationText: error }))}
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
                className="w-full px-3 py-2 border rounded-md"
              />
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
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Specialization */}
            {/* <div>
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
            </div> */}

            {/* Years of Experience */}
            <div>
              <label htmlFor="experience">Years of Experience</label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border rounded-md"
              />
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
                className="w-full px-3 py-2 border rounded-md"
              />
            </div> */}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn border-gray-300 bg-white text-gray-700">Cancel</button>
            <button type="submit" className="btn bg-blue-600 text-white">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDoctorProfileModal;
