

import Input from "../../sharedComponents/Input";
import userLogin from "../../assets/userLogin.png"
import applogoWhite from "../../assets/applogoWhite.png"
import Button from "../../sharedComponents/Button";
import { useNavigate } from "react-router-dom";
import {z} from "zod"
import { useEffect, useState } from "react";
import { verifyRecoveryPassword } from "../../api/user/userApi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const userRecPassSchema = z.object({
    recPass: z
    .string()
    .min(10, "Full name must be  10 characters")
    .max(10,"Full name must be 10 characters")
    .refine((val) => val.trim() === val, {
      message: "No leading or trailing spaces allowed",
    }),
});


function UserRecoveryPassword() {
  
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    recPass: "",
  });
  const [errors, setErrors] = useState({  
    recPass: "",
  });

  const [isFormValid, setIsFormValid] = useState(false);

  const [touched, setTouched] = useState({
    recPass: false,
  });

  const email = localStorage.getItem("userEmail") || "";

    // Validate on change
    useEffect(() => {
      const result = userRecPassSchema.safeParse(formData);
      if (!result.success) {
        const errors: any = {};
        result.error.errors.forEach((err) => {
          errors[err.path[0]] = err.message;
        });
        setErrors(errors);
        setIsFormValid(false);
      } else {
        setErrors({ recPass: ""});
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
        const result = userRecPassSchema.safeParse(formData);
      
        if (!result.success) {
          const errors: any = {};
          result.error.errors.forEach((err) => {
            errors[err.path[0]] = err.message;
          });
          setErrors(errors);
          return;
        }
      
        try {
          const response = await verifyRecoveryPassword({
            email,
            recoveryCode: formData.recPass,
          });
      
          console.log("response is ",response);

          if (response) {
            toast.success("Recovery code verified!");
            navigate("/user/resetPassword");
          } else {
            toast.error("Invalid recovery code");
          }
      
        } catch (error: any) {
          console.error("Verification failed:", error);
          toast.error("Something went wrong. Please try again later.");
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
                  <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Recovery Password</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">

                  <Input
                    id="recPass"
                    name="recPass"
                    label="recovery password"
                    type="text"
                    placeholder="Enter recovery password"
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

export default UserRecoveryPassword;
