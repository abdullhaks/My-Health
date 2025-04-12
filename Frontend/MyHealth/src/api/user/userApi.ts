const apiUrl = import.meta.env.VITE_API_URL;
import {message} from "antd";
import axios from "axios";

console.log(`API URL: ${apiUrl}`);


export const signupUser = async (userData: any) => {
  try {
    const response = await axios.post(`${apiUrl}/user/signup`, userData, {
      withCredentials: true,
    });
    message.success("Signup successful!");

    return response.data;
  } catch (error) {
    console.error("Error signing up user:", error);
    throw error;
  }
}
export const loginUser = async (userData: any) => {
    try {

        console.log("User data:", userData); // Log the user data
        
        const response = await axios.post(`${apiUrl}/user/login`, userData, {
        withCredentials: true,
        });

        console.log("Login response:", response.data); // Log the response data

        return response.data;
    } catch (error) {
        console.error("Error logging in user:", error);
        throw error;
    }
    }

export const verifyOtp = async (otpData: any) => {
    try {

        console.log("OTP data:", otpData); // Log the OTP data;
        
        const response = await axios.post(`${apiUrl}/user/verifyOtp`, otpData, {
        withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error("Error verifying OTP:", error);
        throw error;
    }
};
export const resentOtp = async (email: string) => {
    try {
        const response = await axios.get(`${apiUrl}/user/resentOtp`, {
            params: { email },
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error("Error resending OTP:", error);
        throw error;
    }
};
export const recoveryPassword = async (email: string) => {
    try {
        const response = await axios.get(`${apiUrl}/user/recoveryPassword`, {
            params: { email },
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error("Error recovering password:", error);
        throw error;
    }
}
export const resetPassword = async (email: string, newPassword: string) => {
    try {
        const response = await axios.patch(`${apiUrl}/user/resetPassword/${email}`, { newPassword }, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error("Error resetting password:", error);
        throw error;
    }
};
