
// import {message} from "antd";
import { ROUTES } from "../../constants/routes";
import { adminInstance } from "../../services/axiosFactory";

export const loginAdmin = async (adminData: any) => {
    try {
        const response = await adminInstance.post(ROUTES.admin.login, adminData);
        return response.data;
    } catch (error) {
        console.error("Error logging in admin:", error);
        throw error;
    }
};

export const forgetPassword = async (email: string) => {
    try {
        const response = await adminInstance.get(ROUTES.admin.forgotPassword, {
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
        const response = await adminInstance.get(ROUTES.admin.recoveryPassword, {
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

        console.log("users response from api..",response);
        return response.data;
    } catch (error) { 
        console.error("error in fetchin users");
        throw error;
    }
};

export const getDoctors= async(search:string,page:number , limit:number ,onlyPremium:boolean)=>{
    try{

        const response = await adminInstance.get("/admin/doctors" ,{
            params:{search,page,limit,onlyPremium} 
        })

        console.log("doctors response from api..",response);
        return response.data
    }catch(error){
        console.log("error in fetchin doctors");
        throw error
        
    }
};

export const manageUsers = async (id: string, isBlocked: boolean) => {
    try {
        const url = isBlocked
            ? `/admin/users/${id}/unblock`
            : `/admin/users/${id}/block`;

        const response = await adminInstance.patch(url);

        console.log("user management response from api..", response);
        return response.data;
    } catch (error) {
        console.log("error in manage users");
        throw error;
    }
};


export const manageDoctors = async (id: string, isBlocked: boolean) => {
    try {
        const url = isBlocked
            ? `/admin/doctors/${id}/unblock`
            : `/admin/doctors/${id}/block`;

        const response = await adminInstance.patch(url);

        console.log("doctor management response from api..", response);
        return response.data;
    } catch (error) {
        console.log("error in manage doctors");
        throw error;
    }
};

export const doctorDetails = async (id: string) => {
    try {
        const response = await adminInstance.get(`/admin/doctor/${id}`);
        return response.data;
    } catch (error) {
        console.log("error in get doctor details");
        throw error;
    }
};

export const verifyDoctor = async (id: string) => {
    try {
        const response = await adminInstance.patch(`/admin/doctor/${id}/verify`);
        return response.data;
    } catch (error) {
        console.log("error in verify doctor");
        throw error;
    }
};

export const declineDoctor = async (id: string, reason: string ) => {
    try {
        const response = await adminInstance.patch(`/admin/doctor/${id}/decline`,{reason});
        return response.data;
    } catch (error) {
        console.log("error in verify doctor");
        throw error;
    }
};


export const getAppointments = async(page:number,limit:number) => {
  try{
    const response = await adminInstance.get("/admin/getAppointments",{
      params: { page,limit}
    });
    console.log("response data is ....",response.data)
    return response.data;
  }catch(error){
    console.error("Error in get doctor's appointments..:", error);
    throw error;
  }
};


export const getSubscriptions = async() => {
  try{
    const response = await adminInstance.get(ROUTES.admin.getSubscriptions);
    console.log("response data is ....",response.data)
    return response.data;
  }catch(error){
    console.error("Error in get subscriptions..:", error);
    throw error;
  }
};


export const createSubscription = async(payload:any) => {
  try{
    const response = await adminInstance.post(ROUTES.admin.createSubscription,payload);
    console.log("response data is ....",response.data)
    return response.data;
  }catch(error){
    console.error("Error in create subscription..:", error);
    throw error;
  }
};


export const updateSubscription = async(payload:any) => {
  try{
    const response = await adminInstance.put(ROUTES.admin.updateSubscription,payload);
    console.log("response data is ....",response.data)
    return response.data;
  }catch(error){
    console.error("Error in update subscription..:", error);
    throw error;
  }
};


export const deleteSubscription = async(productId:string) => {
  try{
    const response = await adminInstance.delete(`${ROUTES.admin.deleteSubscription}/${productId}`);
    console.log("response data is ....",response.data)
    return response.data;
  }catch(error){
    console.error("Error in delete subscription..:", error);
    throw error;
  }
};






