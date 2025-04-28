
import { useState } from "react";
import Input from "../../sharedComponents/Input";
import PasswordInput from "../../sharedComponents/PasswordInput";
import Button from "../../sharedComponents/Button";
import FileUploadInput from "../../sharedComponents/FileUploadInput"; 
import { useNavigate } from "react-router-dom";
import { z } from "zod";
// import { signupDoctor } from "../../api/doctor/doctorApi"; 
import applogoWhite from "../../assets/applogoWhite.png";
// import doctorSignupImg from "../../assets/doctorLogin.png"; 


const personalDetailsSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "At least one lowercase letter")
    .regex(/[A-Z]/, "At least one uppercase letter")
    .regex(/\d/, "At least one number")
    .regex(/[@$!%*?&#]/, "At least one special character"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// ✅ Medical Details Schema
const medicalDetailsSchema = z.object({
  category: z.string().nonempty("Please select a category"),
  registrationNumber: z.string().nonempty("Registration number is required"),
  experience: z.string().nonempty("Experience is required"),
  specialization: z.string().optional(),
  graduationCertificate: z.instanceof(File),
  registrationCertificate: z.instanceof(File),
  specializationCertificate: z.instanceof(File).optional(),
  verificationId: z.instanceof(File),
});

// Types
type PersonalDetails = z.infer<typeof personalDetailsSchema>;
type MedicalDetails = z.infer<typeof medicalDetailsSchema>;

function DoctorSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [medicalDetails, setMedicalDetails] = useState<Partial<MedicalDetails>>({});

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleMedicalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (files && files.length > 0) {
      setMedicalDetails((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setMedicalDetails((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleNext = () => {
    const result = personalDetailsSchema.safeParse(personalDetails);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
    } else {
      setErrors({});
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = medicalDetailsSchema.safeParse(medicalDetails);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // Combine form data for API
    const formData = new FormData();
    formData.append("fullName", personalDetails.fullName);
    formData.append("email", personalDetails.email);
    formData.append("password", personalDetails.password);
    formData.append("category", medicalDetails.category!);
    formData.append("registrationNumber", medicalDetails.registrationNumber!);
    formData.append("experience", medicalDetails.experience!);
    if (medicalDetails.specialization) {
      formData.append("specialization", medicalDetails.specialization);
    }
    formData.append("graduationCertificate", medicalDetails.graduationCertificate!);
    formData.append("registrationCertificate", medicalDetails.registrationCertificate!);
    if (medicalDetails.specializationCertificate) {
      formData.append("specializationCertificate", medicalDetails.specializationCertificate);
    }
    formData.append("verificationId", medicalDetails.verificationId!);

    try {
      // await signupDoctor(formData);
      console.log("Signup successful");
      navigate("/doctor/otp");
    } catch (error) {
      console.error("Signup error", error);
      setErrors({ email: "Email already exists or network error" });
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-screen mesh-bg">
      <div className="container mx-auto pt-5 flex justify-start items-center">
        <img
          src={applogoWhite}
          alt="MyHealth Logo"
          className="h-20 object-cover"
        />
      </div>

      <div className="flex flex-1 justify-center items-center">
        <div className="flex flex-col bg-blue-100 shadow-lg rounded-lg p-6 w-full max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
            Doctor Signup
          </h2>

          {step === 1 && (
            <form className="space-y-4">
              <Input
                id="fullName"
                name="fullName"
                label="Full Name"
                type="text"
                placeholder="Enter your full name"
                value={personalDetails.fullName}
                onChange={handlePersonalChange}
                error={errors.fullName}
              />

              <Input
                id="email"
                name="email"
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                value={personalDetails.email}
                onChange={handlePersonalChange}
                error={errors.email}
              />

              <PasswordInput
                id="password"
                name="password"
                label="Password"
                placeholder="Enter your password"
                value={personalDetails.password}
                onChange={handlePersonalChange}
                error={errors.password}
              />

              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={personalDetails.confirmPassword}
                onChange={handlePersonalChange}
                error={errors.confirmPassword}
              />

              <Button
                type="button"
                text="Next"
                className="bg-blue-600 text-white hover:bg-blue-700 w-full"
                onClick={handleNext}
              />
            </form>
          )}

          {step === 2 && (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <select
                name="category"
                className="border p-2 rounded w-full"
                value={medicalDetails.category || ""}
                onChange={handleMedicalChange}
              >
                <option value="">Select Category</option>
                <option value="General">General</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Gynecologist">Gynecologist</option>
                {/* Add more categories */}
              </select>
              {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}

              <Input
                id="registrationNumber"
                name="registrationNumber"
                label="Registration Number"
                type="text"
                placeholder="Enter your registration number"
                value={medicalDetails.registrationNumber || ""}
                onChange={handleMedicalChange}
                error={errors.registrationNumber}
              />

              <Input
                id="experience"
                name="experience"
                label="Experience (in years)"
                type="text"
                placeholder="Enter your experience"
                value={medicalDetails.experience || ""}
                onChange={handleMedicalChange}
                error={errors.experience}
              />

              <Input
                id="specialization"
                name="specialization"
                label="Specialization (optional)"
                type="text"
                placeholder="Enter your specialization"
                value={medicalDetails.specialization || ""}
                onChange={handleMedicalChange}
              />

              <FileUploadInput
                label="Graduation Certificate"
                name="graduationCertificate"
                onChange={handleMedicalChange}
                error={errors.graduationCertificate}
              />

              <FileUploadInput
                label="Registration Certificate"
                name="registrationCertificate"
                onChange={handleMedicalChange}
                error={errors.registrationCertificate}
              />

              <FileUploadInput
                label="Specialization Certificate (optional)"
                name="specializationCertificate"
                onChange={handleMedicalChange}
              />

              <FileUploadInput
                label="Verification ID"
                name="verificationId"
                onChange={handleMedicalChange}
                error={errors.verificationId}
              />

              <div className="flex justify-between">
                <Button
                  type="button"
                  text="Back"
                  className="bg-gray-400 text-white hover:bg-gray-500 w-1/2 mr-2"
                  onClick={() => setStep(1)}
                />
                <Button
                  type="submit"
                  text="Submit"
                  className="bg-green-600 text-white hover:bg-green-700 w-1/2"
                />
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorSignup