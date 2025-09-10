import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import Input from "../../sharedComponents/Input";
import Button from "../../sharedComponents/Button";
import { verifyRecoveryPassword } from "../../api/user/userApi";
import { toast } from "react-toastify";
import applogoWhite from "../../assets/applogoWhite.png";
import userLogin from "../../assets/userLogin.png";
import "react-toastify/dist/ReactToastify.css";

// Validation schema
const userRecPassSchema = z.object({
  recPass: z
    .string()
    .length(10, "Recovery code must be exactly 10 characters")
    .refine((val) => val.trim() === val, {
      message: "Recovery code must not have leading or trailing spaces",
    }),
});

type UserRecPassData = z.infer<typeof userRecPassSchema>;

// Type for the expected API response
interface VerifyRecoveryResponse {
  success: boolean;
  [key: string]: unknown; // Allow additional properties
}

function UserRecoveryPassword() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<UserRecPassData>({
    recPass: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UserRecPassData, string>>>({
    recPass: "",
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [touched, setTouched] = useState<Record<keyof UserRecPassData, boolean>>({
    recPass: false,
  });

  const email = localStorage.getItem("userEmail") || "";

  // Validate on change
  useEffect(() => {
    const result = userRecPassSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof UserRecPassData, string>> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as keyof UserRecPassData] = err.message;
      });
      setErrors(fieldErrors);
      setIsFormValid(false);
    } else {
      setErrors({ recPass: "" });
      setIsFormValid(true);
    }
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    setTouched((prev) => ({
      ...prev,
      [name as keyof UserRecPassData]: true,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = userRecPassSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof UserRecPassData, string>> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as keyof UserRecPassData] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      const response: VerifyRecoveryResponse = await verifyRecoveryPassword({
        email,
        recoveryCode: formData.recPass,
      });

      console.log("response is ", response);

      if (response.success) {
        toast.success("Recovery code verified!");
        navigate("/user/resetPassword");
      } else {
        toast.error("Invalid recovery code");
        setErrors({ recPass: "Invalid recovery code" });
      }
    } catch (error: unknown) {
      console.error("Verification failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong. Please try again later.";
      toast.error(errorMessage);
      setErrors({ recPass: "Failed to verify recovery code" });
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
              <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Recovery Password</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  id="recPass"
                  name="recPass"
                  label="Recovery Code"
                  type="text"
                  placeholder="Enter recovery code"
                  value={formData.recPass}
                  onChange={handleChange}
                  required
                  className={touched.recPass && errors.recPass ? "border-red-500" : ""}
                  error={touched.recPass ? errors.recPass : ""}
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

export default UserRecoveryPassword;