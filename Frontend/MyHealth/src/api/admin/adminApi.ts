const apiUrl = import.meta.env.VITE_API_URL;
// import {message} from "antd";
import { adminInstance } from "../../services/adminInstance";
console.log(`API URL: ${apiUrl}`);



export const loginAdmin = async (adminData: any) => {
    try {
        const response = await adminInstance.post("/admin/login", adminData);
        return response.data;
    } catch (error) {
        console.error("Error logging in admin:", error);
        throw error;
    }
};

export const forgetPassword = async (email: string) => {
    try {
        const response = await adminInstance.get("/admin/forgotPassword", {
            params: { email },
        });
        return response.data;
    } catch (error) {
        console.error("Error sending forgot password email:", error);
        throw error;
    }
};

export const recoveryPassword = async (email: string) => {
    try {
        const response = await adminInstance.get("/admin/recoveryPassword", {
            params: { email },
        });
        return response.data;
    } catch (error) {
        console.error("Error recovering password:", error);
        throw error;
    }
};

export const verifyRecoveryPassword = async (adminData: any) => {
    try {
        const response = await adminInstance.post("/admin/login", adminData);
        return response.data;
    } catch (error) {
        console.error("Error verifying recovery password:", error);
        throw error;
    }
};

export const resetPassword = async (email: string, newPassword: string) => {
    try {
        const response = await adminInstance.patch(`/admin/resetPassword/${email}`, { newPassword });
        return response.data;
    } catch (error) {
        console.error("Error resetting password:", error);
        throw error;
    }
};

export const refreshToken = async () => {
    try {
        const response = await adminInstance.post("/admin/refreshToken");
        return response.data;
    } catch (error) {
        console.error("Error refreshing token:", error);
        throw error;
    }
};

export const logoutAdmin = async () => {
    try {
        const response = await adminInstance.post("/admin/logout");
        return response.data;
    } catch (error) {
        console.error("Error logging out admin:", error);
        throw error;
    }
};


export const getUsers = async (search: string, page: number, limit: number) => {

    console.log("serach,page,and limit from api",search,page,limit);
    try {

        const response = await adminInstance.get("/admin/users", {
            params: { search, page, limit }
        });

        console.log("response from api..",response);
        return response.data;
    } catch (error) { 
        console.error("Error logging out admin:", error);
        throw error;
    }
};

export const getDoctors= async(search:string,page:number , limit:number)=>{
    try{

        const response = await adminInstance.get("/admin/doctors" ,{
            params:{search,page,limit}
        })

        return response.data
    }catch(error){
        console.log("error in fetchin doctors");
        throw error
        
    }
}




