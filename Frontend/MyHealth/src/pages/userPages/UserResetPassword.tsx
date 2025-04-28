
import userLogin from "../../assets/userLogin.png"
import applogoWhite from "../../assets/applogoWhite.png"
import Button from "../../sharedComponents/Button";
import { useNavigate } from "react-router-dom";
import {z} from "zod"
import { useEffect, useState } from "react";
import { resetPassword } from "../../api/user/userApi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PasswordInput from "../../sharedComponents/PasswordInput";


const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/\d/, "Password must contain at least one digit")
      .regex(/[@$!%*?&#]/, "Include at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });


function UserResetPassword() {
  
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword:""
  });
  const [errors, setErrors] = useState({  
    newPassword: "",
    confirmPassword:""
  });

  const [isFormValid, setIsFormValid] = useState(false);

  const [touched, setTouched] = useState({
    newPassword: false,
    confirmPassword:false
  });

  const email = localStorage.getItem("userEmail") || "";

    // Validate on change
    useEffect(() => {
      const result = resetPasswordSchema.safeParse(formData);
      if (!result.success) {
        const errors: any = {};
        result.error.errors.forEach((err) => {
          errors[err.path[0]] = err.message;
        });
        setErrors(errors);
        setIsFormValid(false);
      } else {
        setErrors({ newPassword: "",confirmPassword:""});
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
      const result = resetPasswordSchema.safeParse(formData);
    
      if (!result.success) {
        const errors: any = {};
        result.error.errors.forEach((err) => {
          errors[err.path[0]] = err.message;
        });
        setErrors(errors);
        return;
      }
    
      try {
        const response = await resetPassword(email,formData);
        console.log("submit successful:", response);
    
        // Check if user is blocked
        if (!response) {
          toast.warning("resetin password has been failed.");
          return;
        }
    
        toast.info("password reset successfuly");
        navigate("/user/login");
    
      } catch (error: any) {
        console.error("Login failed:", error);
    
          toast.error("Something went wrong. Please try again later.");
          setErrors({ ...errors, newPassword: "Invalid email or password" });
       
      }
    };
    

  
  return (
    <div className="flex flex-col h-screen w-screen mesh-bg">

          <div className="container mx-auto pt-5  flex justify-start items-center">
            <img
              src={applogoWhite}
              alt="MyHealth Logo"
              className="h-20 object-contain"
            />
          </div>
    

      <div className=" flex flex-1 justify-center items-center">

        <div className="flex items-center justify-center bg-transparent ">
              <div className="flex flex-col md:flex-row bg-blue-200  shadow-lg  overflow-hidden max-w-4xl w-full rounded-br-lg rounded-tr-lg">
                
               
                <div className="md:w-1/2 hidden md:flex  justify-center bg-blue-200 ">
                  <img src={userLogin} alt="Login Illustration" className="w-full h-full" />
                </div>
                
                
                <div className="w-full md:w-1/2 p-8 rounded-lg bg-white">
                  <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Forgot Password</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">

                  <PasswordInput
                  id="password"
                  name="newPassword"
                  label="Password"
                  placeholder="Enter your password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  error={touched.newPassword ? errors.newPassword : ""}
                />

                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
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
                    Don't have an account?  <span
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
