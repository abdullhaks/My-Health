import Input from "../../sharedComponents/Input";
import doctorLogin from "../../assets/doctorLogin.png";
import applogoWhite from "../../assets/applogoWhite.png";
import Button from "../../sharedComponents/Button";
import PasswordInput from "../../sharedComponents/PasswordInput";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useEffect, useState } from "react";
import { loginDoctor } from "../../api/doctor/doctorApi";
import { useDispatch } from "react-redux";
import { loginDoctor as login, logoutDoctor } from "../../redux/slices/doctorSlices";
import toast from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import { AxiosError } from "axios"; // Import AxiosError
import { ApiError } from "../../interfaces/error";

// Define the validation schema
const doctorLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

// Define interfaces for form data, errors, and API response
interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email: string;
  password: string;
}

interface Doctor {
  email: string;
  isVerified: boolean;
  isBlocked: boolean;
  adminVerified: number;
  // Add other doctor properties as needed
}

interface LoginDoctorResponse {
  doctor: Doctor;
  message?: string;
}

interface ApiErrorResponse {
  msg?: string;
}

function DoctorLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  const [reason, setReason] = useState("");

  const [errors, setErrors] = useState<FormErrors>({
    email: "",
    password: "",
  });

  const [isFormValid, setIsFormValid] = useState(false);

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  // Validate on change
  useEffect(() => {
    const result = doctorLoginSchema.safeParse(formData);
    if (!result.success) {
      const errors: FormErrors = { email: "", password: "" };
      result.error.errors.forEach((err) => {
        errors[err.path[0] as keyof FormErrors] = err.message;
      });
      setErrors(errors);
      setIsFormValid(false);
    } else {
      setErrors({ email: "", password: "" });
      setIsFormValid(true);
    }
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = doctorLoginSchema.safeParse(formData);

    if (!result.success) {
      const errors: FormErrors = { email: "", password: "" };
      result.error.errors.forEach((err) => {
        errors[err.path[0] as keyof FormErrors] = err.message;
      });
      setErrors(errors);
      return;
    }

    try {
      setReason("");
      const response = await loginDoctor(formData);
      console.log("Login successful:", response);

      if (!response.doctor.isVerified) {
        toast.error("Please verify your account via OTP sent to your email.");
        localStorage.setItem("doctorEmail", response.doctor.email);
        navigate("/doctor/otp");
        return;
      }

      // Check if user is blocked
      if (response.doctor.isBlocked) {
        toast.error("Your account has been blocked. Please contact support.");
        return;
      }

      if (response.doctor.adminVerified === 0) {
        toast.error("Your signup credentials are waiting for verification. Please be patient.");
        return;
      }

      if (response.doctor.adminVerified === 3) {
        setReason(response.message || "Verification failed.");
        toast.error(response.message || "Verification failed.");
        return;
      }

      dispatch(logoutDoctor());
      dispatch(
        login({
          doctor: response.doctor,
        })
      );

      toast.success("Logged in successfully");
      navigate("/doctor/dashboard");
    } catch (error) {
      console.error("Login failed:", error);

      if ((error as ApiError).response && (error as ApiError).response?.data?.status === 401) {
        toast.error("Invalid email or password");
        setErrors({ ...errors, password: "Invalid email or password" });
      } else {
        toast.error((error as ApiError).response?.data?.msg || "Something went wrong. Please try again later.");
        setErrors({ ...errors, email: " " });
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen mesh-bg">
      <div className="container mx-auto pt-5 flex justify-start items-center">
        <img src={applogoWhite} alt="MyHealth Logo" className="h-20 object-contain" />
      </div>

      <div className="flex flex-1 justify-center items-center">
        <div className="flex items-center justify-center bg-transparent">
          <div className="flex flex-col md:flex-row bg-blue-200 shadow-lg overflow-hidden max-w-4xl w-full rounded-br-lg rounded-tr-lg">
            <div className="md:w-1/2 hidden md:flex justify-center bg-blue-200">
              <img src={doctorLogin} alt="Login Illustration" className="w-full h-full" />
            </div>

            <div className="w-full md:w-1/2 p-8 rounded-lg bg-white">
              <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Doctor Login</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  id="email"
                  name="email"
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={touched.email && errors.email ? "border-red-500" : ""}
                  error={touched.email ? errors.email : ""}
                />

                <PasswordInput
                  id="password"
                  name="password"
                  label="Password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className={touched.password && errors.password ? "border-red-500" : ""}
                  error={touched.password ? errors.password : ""}
                />

                <p className="text-red-700">{reason}</p>
                <span
                  onClick={() => navigate("/doctor/forgetPassword")} // Updated to doctor-specific route
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  Forgot password
                </span>

                <Button
                  type="submit"
                  text="Login"
                  disabled={!isFormValid}
                  className={`text-white ${
                    isFormValid ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"
                  }`}
                />
              </form>

              <p className="text-center text-sm text-gray-600 mt-4">
                Don’t have an account?{" "}
                <span
                  onClick={() => navigate("/doctor/signup")}
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  Signup
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorLogin;