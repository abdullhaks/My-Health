
// import {message} from "antd";
import { ROUTES } from "../../constants/routes";
import { adminInstance } from "../../services/axiosFactory";
import { subscriptionFormData } from "../../interfaces/subscription";
import { transactionsFilter } from "../../interfaces/transaction";
import { payoutFilter } from "../../interfaces/payout";
import { payoutUpdateDto } from "../../interfaces/payout";

export const loginAdmin = async (adminData: {email:string,password:string}) => {
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

export const verifyRecoveryPassword = async (adminData: {email:string,password:string}) => {
    try {
        const response = await adminInstance.post(ROUTES.admin.login, adminData);
        return response.data;
    } catch (error) {
        console.error("Error verifying recovery password:", error);
        throw error;
    }
};

export const resetPassword = async (email: string, newPassword: string) => {
    try {
        const response = await adminInstance.patch(ROUTES.admin.resetPassword(email), { newPassword });
        return response.data;
    } catch (error) {
        console.error("Error resetting password:", error);
        throw error;
    }
};

export const refreshToken = async () => {
    try {
        const response = await adminInstance.post(ROUTES.admin.refreshToken);
        return response.data;
    } catch (error) {
        console.error("Error refreshing token:", error);
        throw error;
    }
};

export const logoutAdmin = async () => {
    try {
        const response = await adminInstance.post(ROUTES.admin.logout);
        return response.data;
    } catch (error) {
        console.error("Error logging out admin:", error);
        throw error;
    }
};


export const getUsers = async (search: string, page: number, limit: number) => {

    console.log("serach,page,and limit from api",search,page,limit);
    try {

        const response = await adminInstance.get(ROUTES.admin.users, {
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

        const response = await adminInstance.get(ROUTES.admin.doctors,{
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
            ? ROUTES.admin.manageUsers.unblock(id)
            : ROUTES.admin.manageUsers.block(id)

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
            ? ROUTES.admin.manageDoctors.unblock(id)
            : ROUTES.admin.manageDoctors.block(id)

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
        const response = await adminInstance.get(ROUTES.admin.doctor(id));
        return response.data;
    } catch (error) {
        console.log("error in get doctor details");
        throw error;
    }
};

export const verifyDoctor = async (id: string) => {
    try {
        const response = await adminInstance.patch(ROUTES.admin.verifyDoctor(id));
        return response.data;
    } catch (error) {
        console.log("error in verify doctor");
        throw error;
    }
};

export const declineDoctor = async (id: string, reason: string ) => {
    try {
        const response = await adminInstance.patch(ROUTES.admin.declineDoctor(id),{reason});
        return response.data;
    } catch (error) {
        console.log("error in verify doctor");
        throw error;
    }
};

interface FilterParams {
  status?: string;
  doctorCategory?: string;
  startDate?: string;
  endDate?: string;
}

export const getAppointments = async(page:number,limit:number,filters: FilterParams = {}) => {
  try{
    const response = await adminInstance.get(ROUTES.admin.getAppointments,{
      params: {
        page,
        limit,
        ...filters,
      }
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


export const createSubscription = async(payload:subscriptionFormData) => {
  try{
    const response = await adminInstance.post(ROUTES.admin.createSubscription,payload);
    console.log("response data is ....",response.data)
    return response.data;
  }catch(error){
    console.error("Error in create subscription..:", error);
    throw error;
  }
};


export const updateSubscription = async(payload:subscriptionFormData) => {
  try{
    const response = await adminInstance.put(ROUTES.admin.updateSubscription,payload);
    console.log("response data is ....",response.data)
    return response.data;
  }catch(error){
    console.error("Error in update subscription..:", error);
    throw error;
  }
};


export const deActivateSubscription = async(productId:string) => {
  try{
    const response = await adminInstance.delete(`${ROUTES.admin.deActivateSubscription}/${productId}`);
    console.log("response data is ....",response.data)
    return response.data;
  }catch(error){
    console.error("Error in delete subscription..:", error);
    throw error;
  }
};


export const ActivateSubscription = async(productId:string) => {
  try{
    const response = await adminInstance.delete(`${ROUTES.admin.activateSubscription}/${productId}`);
    console.log("response data is ....",response.data)
    return response.data;
  }catch(error){
    console.error("Error in delete subscription..:", error);
    throw error;
  }
};


export const getUserAnalytics = async(filter:string) =>{
try{

    const response = await adminInstance.get(ROUTES.admin.getUserAnalytics(filter));
    return response.data;
    
}catch(error){
    console.error("error in getUserAnalytics");
    throw error;
}
};

export const getDoctorAnalytics = async(filter:string) =>{
try{

    const response = await adminInstance.get(ROUTES.admin.getDoctorAnalytics(filter));
    return response.data;
    
}catch(error){
    console.error("error in getUserAnalytics");
    throw error;
}
};

export const getTotalAnalytics = async ()=>{
    try{

        const response = await adminInstance.get(ROUTES.admin.getTotalAnalytics);
        return response.data;

    }catch(err){
        console.log("error in get total analytics");
        throw err
        
    }
}

export const getTransactions = async (page:number, limit:number,filters:transactionsFilter)=>{
    try{

        const response = await adminInstance.get(ROUTES.admin.getTransactions,{
      params: {
        page,
        limit,
        ...filters,
      }});
        return response.data;

    }catch(err){
        console.log("error in get total analytics");
        throw err
        
    }
};

export const getPayouts = async (page:number, limit:number,filters:payoutFilter)=>{
    try{

        const response = await adminInstance.get(ROUTES.admin.payouts,{
      params: {
        page,
        limit,
        ...filters,
      }});
        return response.data;

    }catch(err){
        console.log("error in get total analytics");
        throw err
        
    }
};



export const updatePayout = async (id:string, updateData:payoutUpdateDto)=>{
    try{

        const response = await adminInstance.post(ROUTES.admin.payouts,{
            id,
            ...updateData
        });
        return response.data;

    }catch(err){
        console.log("error in get total analytics");
        throw err
        
    }
};






