const apiUrl = import.meta.env.VITE_API_URL;
// import {message} from "antd";
import axios from "axios";

console.log(`API URL: ${apiUrl}`);



export const loginAdmin = async (adminData: any) => {
    try {

        console.log("User data:", adminData); // Log the user data
        
        const response = await axios.post(`${apiUrl}/admin/login`, adminData, {
        withCredentials: true,
        });

        console.log("Login response:", response.data); // Log the response data

        return response.data;
    } catch (error) {
        console.error("Error logging in user:", error);
        throw error;
    }
    }



  export const forgetPassword = async (email: string) => {
    try {
        const response = await axios.get(`${apiUrl}/admin/forgotPassword`,{
            params:{email},
            withCredentials: true,
        });
        return response.data;
    }
    catch (error) {
        console.error("Error sending forgot password email:", error);
        throw error;
    }
};
  


export const recoveryPassword = async (email: string) => {
    try {
        const response = await axios.get(`${apiUrl}/admin/recoveryPassword`, {
            params: { email },
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error("Error recovering password:", error);
        throw error;
    }
};

export const verifyRecoveryPassword = async (adminData:any)=>{

    console.log("User data:",adminData); // Log the user data
        
    const response = await axios.post(`${apiUrl}/admin/login`, adminData, {
    withCredentials: true,
    });

    console.log("Login response:", response.data); // Log the response data

    return response.data;
}



export const resetPassword = async (email: string, newPassword: string) => {
    try {
        const response = await axios.patch(`${apiUrl}/admin/resetPassword/${email}`, { newPassword }, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error("Error resetting password:", error);
        throw error;
    }
};
