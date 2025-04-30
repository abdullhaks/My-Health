import { useEffect, useState } from "react";
import Input from "../../sharedComponents/Input";
import PasswordInput from "../../sharedComponents/PasswordInput";
import Button from "../../sharedComponents/Button";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import applogoWhite from "../../assets/applogoWhite.png";
// import userLogin from "../../assets/userLogin.png";
import doctorLogin from "../../assets/doctorLogin.png"
import { signupDoctor } from "../../api/doctor/doctorApi"; // You should implement this
// import GeoapifyAutocomplete from "../../sharedComponents/GeoapifyAutocomplete";
import toast from "react-hot-toast";

// Your validation schema
const doctorSignupSchema = z
  .object({
    fullName: z.string().min(3, "Full name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "At least one lowercase letter")
      .regex(/[A-Z]/, "At least one uppercase letter")
      .regex(/\d/, "At least one digit")
      .regex(/[@$!%*?&#]/, "Include at least one special character"),
    confirmPassword: z.string(),
    graduation: z.string(),
    graduationCertificate: z.any(),
    category: z.string(),
    registerNo: z.string().min(6, "not valied"),
    registrationCertificate: z.any(),
    verificationId: z.any(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type DoctorSignupData = z.infer<typeof doctorSignupSchema>;

function DoctorSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<DoctorSignupData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    graduation: "",
    graduationCertificate: null,
    category: "",
    registerNo: "",
    registrationCertificate: null,
    verificationId: null,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof DoctorSignupData, string>>>({});
  const [touched, setTouched] = useState<Record<keyof DoctorSignupData, boolean>>(
    Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: false }), {} as any)
  );

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: files?.[0] || null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

 

  useEffect(() => {
    const result = doctorSignupSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof DoctorSignupData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof DoctorSignupData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
    } else {
      setErrors({});
    }
  }, [formData]);

  const nextStep = () => {
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = doctorSignupSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof DoctorSignupData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof DoctorSignupData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
  
    setLoading(true); // Start loader
  
    try {
      const formDataToSend = new FormData();
      for (const key in formData) {
        const value = (formData as any)[key];
        formDataToSend.append(key, value);
      }
  
      await signupDoctor(formDataToSend)
        .then((response) => {
          console.log("Signup successful", response);
          navigate("/doctor/login");
        })
        .catch((error) => {
          console.error("Signup error", error);
          setErrors({ email: "Email already exists" });
        });
  
    } catch (error) {
      console.error("Doctor signup error:", error);
      toast.error("Invalid inputs. Try again.");
      setErrors({ email: "Signup failed. Try again." });
    } finally {
      setLoading(false); // Stop loader
    }
  };
  

  // Function to check if the current step is valid
  const isStepValid = (step: number) => {
    if (step === 1) {
      return (
        formData.fullName.length >= 3 &&
        formData.email.length > 0 &&
        formData.password.length >= 8 &&
        formData.confirmPassword.length >= 8 &&
        formData.password === formData.confirmPassword
      );
    }
    if (step === 2) {
      return (
        
        formData.graduation.length > 0 &&
        formData.category.length > 0 &&
        formData.graduationCertificate 
      );
    }
    if (step === 3) {
      return formData.verificationId &&formData.registerNo.length > 5 && formData.registrationCertificate
    }
    return false;
  };

  return (
    <div className="flex flex-col min-h-screen w-screen mesh-bg">
      <div className="container mx-auto pt-5 flex justify-start items-center">
        <img src={applogoWhite} alt="MyHealth Logo" className="h-20 object-cover" />
      </div>

      <div className="flex flex-1 justify-center items-center">
        <div className="flex items-center justify-center bg-transparent">
          <div className="flex flex-col md:flex-row bg-blue-200 shadow-lg overflow-hidden max-w-4xl w-full rounded-br-lg rounded-tr-lg">
            <div className="md:w-1/2 hidden md:flex justify-center bg-blue-200">
              <img src={doctorLogin} alt="Login Illustration" className="w-full h-auto" />
            </div>

            <div className="w-full md:w-1/2 p-2 rounded-lg bg-white">
              <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
                Doctor Signup
              </h2>

              <form className="space-y-2" onSubmit={handleSubmit}>
                {step === 1 && (
                  <>
                    <Input
                      id="fullName"
                      name="fullName"
                      label="Full Name"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      required
                      error={touched.fullName ? errors.fullName : ""}
                    />
                    <Input
                      id="email"
                      name="email"
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email"
                      required
                      error={touched.email ? errors.email : ""}
                    />
                    <PasswordInput
                      id="password"
                      name="password"
                      label="Password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                      error={touched.password ? errors.password : ""}
                    />
                    <PasswordInput
                      id="confirmPassword"
                      name="confirmPassword"
                      label="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
                      error={touched.confirmPassword ? errors.confirmPassword : ""}
                    />
                  </>
                )}

                {step === 2 && (
                  <>
                    
                    <Input
                      id="graduation"
                      name="graduation"
                      label="Graduation"
                      value={formData.graduation}
                      onChange={handleChange}
                      placeholder="Enter graduation"
                      required
                      error={touched.graduation ? errors.graduation : ""}
                    />
                    <Input
                      id="graduationCertificate"
                      name="graduationCertificate"
                      type="file"
                      onChange={handleChange}
                      required
                    />
                    <Input
                      id="category"
                      name="category"
                      label="Category"
                      value={formData.category}
                      onChange={handleChange}
                      placeholder="General,ortho..."
                      required
                      error={touched.category ? errors.category : ""}
                    />
                 
                  </>
                )}

                {step === 3 && (
                  <>
                   
                   <Input
                      id="registerNo"
                      name="registerNo"
                      label="Register Number"
                      value={formData.registerNo}
                      onChange={handleChange}
                      placeholder="Enter register number"
                      required
                      error={touched.registerNo ? errors.registerNo : ""}
                    />
                    <Input
                      id="registrationCertificate"
                      name="registrationCertificate"
                      label="Registration Certificate"
                      type="file"
                      onChange={handleChange}
                      required
                    />

                    <Input
                      id="verificationId"
                      name="verificationId"
                      label="Verification ID"
                      type="file"
                      onChange={handleChange}
                      required
                    />

                  </>
                )}

                <div className="flex justify-between mt-4">
                  {step > 1 && (
                    <Button
                      type="button"
                      text="Back"
                      className="bg-gray-500 text-white hover:bg-gray-600"
                      onClick={prevStep}
                    />
                  )}
                  {step < 3 ? (
                    <Button
                      type="button"
                      text="Next"
                      className="bg-blue-600 text-white hover:bg-blue-700"
                      onClick={nextStep}
                      disabled={!isStepValid(step)} // Disable if step isn't valid
                    />
                  ) : (
                    <Button
                      type="submit"
                      text={loading ? "Signing up..." : "Signup"}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                      disabled={!isStepValid(step)} // Disable if last step isn't valid
                    />
                  )}
                </div>
              </form>

              <p className="text-center text-sm text-gray-600 mt-4">
                Already have an account?{" "}
                <span
                  onClick={() => navigate("/doctor/login")}
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  Login
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorSignup;
