import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useDispatch } from "react-redux";
import Input from "../../sharedComponents/Input";
import PasswordInput from "../../sharedComponents/PasswordInput";
import Button from "../../sharedComponents/Button";
import { FcGoogle } from "react-icons/fc";
import { loginUser } from "../../api/user/userApi";
import { loginUser as login, logoutUser } from "../../redux/slices/userSlices";
import toast from "react-hot-toast";
import applogoWhite from "../../assets/applogoWhite.png";
import userLogin from "../../assets/userLogin.png";
import "react-toastify/dist/ReactToastify.css";
import { IUser } from "../../interfaces/user";

// Validation schema
const userLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type UserLoginData = z.infer<typeof userLoginSchema>;

// Type for the expected API response
interface LoginResponse {
  user: IUser
}
// Type for the Redux login action payload
// interface LoginActionPayload {
//   user: LoginResponse["user"];
// }

function UserLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState<UserLoginData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UserLoginData, string>>>({
    email: "",
    password: "",
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [touched, setTouched] = useState<Record<keyof UserLoginData, boolean>>({
    email: false,
    password: false,
  });

  // Validate on change
  useEffect(() => {
    const result = userLoginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof UserLoginData, string>> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as keyof UserLoginData] = err.message;
      });
      setErrors(fieldErrors);
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
      [name as keyof UserLoginData]: true,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = userLoginSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof UserLoginData, string>> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as keyof UserLoginData] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      const response: LoginResponse = await loginUser(formData);
      console.log("Login successful:", response);

      // Check if user is blocked
      if (response.user.isBlocked) {
        toast.error("Your account has been blocked. Please contact support.");
        return;
      }

      // Check if user is verified
      if (!response.user.isVerified) {
        toast.error("Please verify your account via OTP sent to your email.");
        localStorage.setItem("userEmail", response.user.email);
        navigate("/user/otp");
        return;
      }

      dispatch(logoutUser());
      dispatch(login({ user: response.user }));

      toast.success("Logged in successfully");
      navigate("/user/dashboard");
    } catch (error: unknown) {
      console.error("Login failed:", error);

      // Handle specific error cases
      let errorMessage = "Something went wrong. Please try again later.";
      if (error instanceof Error && "response" in error) {
        const axiosError = error as { response?: { status: number } };
        if (axiosError.response?.status === 401) {
          errorMessage = "Invalid email or password";
          setErrors({ ...errors, password: errorMessage });
        } else {
          setErrors({ ...errors, email: " " });
        }
      } else {
        setErrors({ ...errors, email: " " });
      }
      toast.error(errorMessage);
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
              <img src={userLogin} alt="Login Illustration" className="w-full h-full" />
            </div>

            <div className="w-full md:w-1/2 p-8 rounded-lg bg-white">
              <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">User Login</h2>

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

                <span
                  onClick={() => navigate("/user/forgetPassword")}
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

                <Button
                  text="Login with Google"
                  icon={<FcGoogle />}
                  className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-200"
                  onClick={() => {
                    window.location.href = "http://localhost:3000/api/user/google";
                  }}
                />
              </form>

              <p className="text-center text-sm text-gray-600 mt-4">
                Don't have an account?{" "}
                <span
                  onClick={() => navigate("/user/signup")}
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

export default UserLogin;