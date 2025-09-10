import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import PasswordInput from "../../sharedComponents/PasswordInput";
import Button from "../../sharedComponents/Button";
import { resetPassword } from "../../api/user/userApi";
import { toast } from "react-toastify";
import applogoWhite from "../../assets/applogoWhite.png";
import userLogin from "../../assets/userLogin.png";
import "react-toastify/dist/ReactToastify.css";

// Validation schema
const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/\d/, "Password must contain at least one digit")
      .regex(/[@$!%*?&#]/, "Password must include at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

// Type for the expected API response
interface ResetPasswordResponse {
  success: boolean;
  [key: string]: unknown; // Allow additional properties
}

function UserResetPassword() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ResetPasswordData>({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ResetPasswordData, string>>>({
    newPassword: "",
    confirmPassword: "",
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [touched, setTouched] = useState<Record<keyof ResetPasswordData, boolean>>({
    newPassword: false,
    confirmPassword: false,
  });

  const email = localStorage.getItem("userEmail") || "";

  // Validate on change
  useEffect(() => {
    const result = resetPasswordSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ResetPasswordData, string>> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as keyof ResetPasswordData] = err.message;
      });
      setErrors(fieldErrors);
      setIsFormValid(false);
    } else {
      setErrors({ newPassword: "", confirmPassword: "" });
      setIsFormValid(true);
    }
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    setTouched((prev) => ({
      ...prev,
      [name as keyof ResetPasswordData]: true,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = resetPasswordSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ResetPasswordData, string>> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as keyof ResetPasswordData] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!email) {
      toast.error("No email found. Please start the recovery process again.");
      navigate("/user/forgetPassword");
      return;
    }

    try {
      const response: ResetPasswordResponse = await resetPassword(email, formData);
      console.log("submit successful:", response);

      if (!response.success) {
        toast.warning("Resetting password has failed.");
        setErrors({ newPassword: "Failed to reset password" });
        return;
      }

      toast.success("Password reset successfully");
      navigate("/user/login");
    } catch (error: unknown) {
      console.error("Reset password failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong. Please try again later.";
      toast.error(errorMessage);
      setErrors({ newPassword: "Failed to reset password" });
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
              <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Reset Password</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <PasswordInput
                  id="newPassword"
                  name="newPassword"
                  label="New Password"
                  placeholder="Enter your new password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={touched.newPassword && errors.newPassword ? "border-red-500" : ""}
                  error={touched.newPassword ? errors.newPassword : ""}
                />

                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm Password"
                  placeholder="Re-enter your new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={touched.confirmPassword && errors.confirmPassword ? "border-red-500" : ""}
                  error={touched.confirmPassword ? errors.confirmPassword : ""}
                />

                <Button
                  type="submit"
                  text="Submit"
                  disabled={!isFormValid}
                  className={`text-white ${
                    isFormValid ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"
                  }`}
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

export default UserResetPassword;