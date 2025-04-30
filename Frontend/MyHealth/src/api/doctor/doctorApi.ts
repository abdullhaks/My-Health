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