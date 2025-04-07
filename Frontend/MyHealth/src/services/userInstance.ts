import axios , { AxiosError , AxiosInstance , InternalAxiosRequestConfig , AxiosResponse } from "axios";
import {logout} from "../redux/slices/userSlices"; 
import { store } from "../redux/store/store";
import { HttpStatusCode } from "../utils/enum";



declare module 'axios' {
    interface InternalAxiosRequestConfig {
        isRetry?: boolean;
    }
};

const apiUrl = import.meta.env.VITE_API_URL as string;
export const userInstance: AxiosInstance = axios.create({
    baseURL: apiUrl,
    withCredentials: true,      
});

const handleTokenRefresh = async (originalRequest: InternalAxiosRequestConfig) => {

    try{

        await userInstance.post("/user/refreshToken")
        return userInstance(originalRequest);

    }catch(error) {

        await handleTokenErrors(error as AxiosError);
        throw error;
        
    }





};


const handleTokenErrors = async (error: AxiosError) => {
    console.log("Token error trying to logout...",error);
    store.dispatch(logout());
    try {
      const result = await userInstance.post("/employee-service/api/employee/logout");
      console.log("Logout successful:", result.data.message);
      
    //   toast.success(result.data.message);
    } catch (logoutError) {
      console.error("Logout failed:", logoutError);
    }
  };


  userInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig;
        if (error.response?.status === HttpStatusCode.UNAUTHORIZED && !originalRequest.isRetry) {
            originalRequest.isRetry = true;
            return handleTokenRefresh(originalRequest);
        } else if (error.response?.status === HttpStatusCode.FORBIDDEN) {
            await handleTokenErrors(error);
        }
        return Promise.reject(error);
    })