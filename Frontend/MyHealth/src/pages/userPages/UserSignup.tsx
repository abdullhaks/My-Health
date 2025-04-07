import { useEffect, useState } from "react";
import Input from "../../sharedComponents/Input";
import userLogin from "../../assets/userLogin.png";
import applogoWhite from "../../assets/applogoWhite.png";
import Button from "../../sharedComponents/Button";
import { FcGoogle } from "react-icons/fc";
import PasswordInput from "../../sharedComponents/PasswordInput";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { signupUser } from "../../api/user/userApi";

// ✅ Schema for signup validation
const signupSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    fullName: z
      .string()
      .min(3, "Full name must be at least 3 characters")
      .refine((val) => val.trim() === val, {
        message: "No leading or trailing spaces allowed",
      }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/\d/, "Password must contain at least one digit")
      .regex(/[@$!%*?&#]/, "Include at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupData = z.infer<typeof signupSchema>;

function UserSignup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<SignupData>({
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SignupData, string>>>({});
  const [touched, setTouched] = useState<Record<keyof SignupData, boolean>>({
    email: false,
    fullName: false,
    password: false,
    confirmPassword: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value.startsWith(" ") ? value.trimStart() : value,
    }));

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  useEffect(() => {
    const result = signupSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SignupData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof SignupData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
    } else {
      setErrors({});
    }
  }, [formData]);

  const handleSubmit =async (e: React.FormEvent) => {
    e.preventDefault();
    const result = signupSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SignupData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof SignupData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      setTouched({
        email: true,
        fullName: true,
        password: true,
        confirmPassword: true,
      });
      return;
    }

    // Call the signup API

    try{

      const data = await signupUser(formData)
      .then((response) => {
        console.log("Signup successful", response);
        navigate("/user/login");
      })
      .catch((error) => {
        console.error("Signup error", error);
        setErrors({ email: "Email already exists" });
      });

    console.log("Signup Successful", data);
    navigate("/user/otp");

    }catch(error){

      console.error("Error signing up", error);
      setErrors({ email: "Email already exists" });
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
        <div className="flex items-center justify-center bg-transparent">
          <div className="flex flex-col md:flex-row bg-blue-200 shadow-lg overflow-hidden max-w-4xl w-full rounded-br-lg rounded-tr-lg">
            <div className="md:w-1/2 hidden md:flex justify-center bg-blue-200">
              <img
                src={userLogin}
                alt="Login Illustration"
                className="w-full h-auto"
              />
            </div>

            <div className="w-full md:w-1/2 p-2 rounded-lg bg-white">
              <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
                User Signup
              </h2>

              <form className="space-y-2" onSubmit={handleSubmit}>
                <Input
                  id="email"
                  name="email"
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  error={touched.email ? errors.email : ""}
                />

                <Input
                  id="fullName"
                  name="fullName"
                  label="Full Name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  error={touched.fullName ? errors.fullName : ""}
                />

                <PasswordInput
                  id="password"
                  name="password"
                  label="Password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  error={touched.password ? errors.password : ""}
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
                  text="Sign Up"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                />

                <Button
                  text="Login with Google"
                  icon={<FcGoogle />}
                  className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-200"
                />
              </form>

              <p className="text-center text-sm text-gray-600 mt-4">
                I have an account{" "}
                <span
                  onClick={() => navigate("/user/login")}
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

export default UserSignup;
