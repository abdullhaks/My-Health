import axios , { AxiosError , AxiosInstance , InternalAxiosRequestConfig , AxiosResponse } from "axios";
import {logoutAdmin} from "../redux/slices/adminSlices"; 
import { store } from "../redux/store/store";
import { HttpStatusCode } from "../utils/enum";
import { refreshToken,logoutAdmin as logout  } from "../api/admin/adminApi";

declare module 'axios' {
    interface InternalAxiosRequestConfig {
        isRetry?: boolean;
    }
};

const apiUrl = import.meta.env.VITE_API_URL as string;
export const adminInstance: AxiosInstance = axios.create({
    baseURL: apiUrl,
    withCredentials: true,      
});


adminInstance.interceptors.request.use(
    (config) => {
      const accessToken = store.getState().admin.accessToken;
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );



const handleTokenRefresh = async (originalRequest: InternalAxiosRequestConfig) => {
    try{
        const response =   await refreshToken();
        const{accessToken} = response;

        store.dispatch({
            type: "admin/login",
            payload: {
                admin: store.getState().admin.admin,
                accessToken,
              },
        });

        originalRequest.headers.set('Authorization', `Bearer ${accessToken}`);

        return adminInstance(originalRequest);

    }catch(error) {
        await handleTokenErrors(error as AxiosError);
        throw error;   
    }
};



const handleTokenErrors = async (error: AxiosError) => {
    console.log("Token error trying to logout...",error);
    store.dispatch(logoutAdmin());
    try {
      const result = await logout();
      console.log("Logout successful:", result.data.message);
      localStorage.removeItem("adminEmail");
    //   toast.success(result.data.message);
    } catch (logoutError) {
      console.error("Logout failed:", logoutError);
    }
  };


  adminInstance.interceptors.response.use(
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