import Input from "../../sharedComponents/Input";
import adminLogin from "../../assets/adminLogin.png";
import applogoWhite from "../../assets/applogoWhite.png";
import Button from "../../sharedComponents/Button";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useEffect, useState } from "react";
import { forgetPassword } from "../../api/admin/adminApi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const adminEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

function AdminForgetPassword() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
  });

  const [errors, setErrors] = useState({
    email: "",
  });

  const [isFormValid, setIsFormValid] = useState(false);

  const [touched, setTouched] = useState({
    email: false,
  });

  useEffect(() => {
    const result = adminEmailSchema.safeParse(formData);
    if (!result.success) {
      const errors: any = {};
      result.error.errors.forEach((err) => {
        errors[err.path[0]] = err.message;
      });
      setErrors(errors);
      setIsFormValid(false);
    } else {
      setErrors({ email: "" });
      setIsFormValid(true);
    }
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = adminEmailSchema.safeParse(formData);
    if (!result.success) {
      const errors: any = {};
      result.error.errors.forEach((err) => {
        errors[err.path[0]] = err.message;
      });
      setErrors(errors);
      return;
    }

    try {
      const response = await forgetPassword(formData.email);
      console.log("Submit successful:", response);

      if (!response) {
        toast.warning("Failed to send recovery email.");
        return;
      }

      localStorage.setItem("adminEmail", response.email);
      toast.info("Check your email to reset your password.");
      navigate("/admin/resetPassword");
    } catch (error: any) {
      console.error("Forgot password failed:", error);
      toast.error("Something went wrong. Please try again later.");
      setErrors({ ...errors, email: "Invalid email address" });
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen mesh-bg">
      <div className="container mx-auto pt-5 flex justify-start items-center">
        <img src={applogoWhite} alt="Admin Logo" className="h-20 object-contain" />
      </div>

      <div className="flex flex-1 justify-center items-center">
        <div className="flex items-center justify-center bg-transparent">
          <div className="flex flex-col md:flex-row bg-blue-200 shadow-lg overflow-hidden max-w-4xl w-full rounded-br-lg rounded-tr-lg">
            <div className="md:w-1/2 hidden md:flex justify-center bg-blue-200">
              <img src={adminLogin} alt="Admin Forgot Password" className="w-full h-full" />
            </div>

            <div className="w-full md:w-1/2 p-8 rounded-lg bg-white">
              <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Forgot Password (Admin)</h2>

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

                <Button
                  type="submit"
                  text="Submit"
                  disabled={!isFormValid}
                  className={`text-white ${
                    isFormValid ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"
                  }`}
                />
              </form>

              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminForgetPassword;
