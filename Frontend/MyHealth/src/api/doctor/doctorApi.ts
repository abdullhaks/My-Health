import { message } from "antd";
import { doctorInstance } from "../../services/doctorInstance";



export const signupDoctor = async (doctorData: any) => {
  try {

    for (const [key, value] of doctorData.entries()) {
        console.log(`api side...${key}:`, value);
      }

    
    const response = await doctorInstance.post("/doctor/signup", doctorData);
    message.success("Signup successful!");
    return response.data;
  } catch (error) {
    console.error("Error signing up doctor:", error);
    throw error;
  }
};

export const getMe = async ()=>{
  try{

    console.log("get me calling......")
    const response = await doctorInstance.get("/doctor/me");
    console.log("me me me...",response.data);

    return response.data
  }catch(error){
    console.error("Error signing up user:", error);
    throw error;
  }
  

}

export const loginDoctor = async (doctorData: any) => {
  try {
    const response = await doctorInstance.post("/doctor/login", doctorData);
    console.log("Login response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
};


export const verifyDoctorOtp = async (otpData: any) => {
  try {
    console.log("OTP data:", otpData);
    const response = await doctorInstance.post("/doctor/verifyOtp", otpData);
    return response.data;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
};

export const resendDoctorOtp = async (email: string) => {
  try {
    const response = await doctorInstance.get("/doctor/resentOtp", {
      params: { email },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error resending OTP:", error);
    throw error.response?.data?.msg || "Something went wrong";
  }
};


export const refreshToken = async () => {
  try {
    const response = await doctorInstance.post("/doctor/refreshToken");

    console.log("user api response is ",response);

    return response.data;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
};

export const logoutDoctor = async () => {
  try {
    await doctorInstance.post("/doctor/logout");
    // return response.data;
  } catch (error) {
    console.error("Error logging out user:", error);
    throw error;
  }
};