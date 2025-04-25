import axios , { AxiosError , AxiosInstance , InternalAxiosRequestConfig , AxiosResponse } from "axios";
import { logoutUser } from "../redux/slices/userSlices";
import { store } from "../redux/store/store";
import { HttpStatusCode } from "../utils/enum";
import { refreshToken,logoutUser as logout  } from "../api/user/userApi";
import toast from "react-hot-toast";

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


// userInstance.interceptors.request.use(
//     (config) => {
//       const accessToken = store.getState().user.accessToken;
//       if (accessToken) {
//         config.headers.Authorization = `Bearer ${accessToken}`;
//       }
//       return config;
//     },
//     (error) => Promise.reject(error)
//   );



const handleTokenRefresh = async (originalRequest: InternalAxiosRequestConfig) => {
    try{

      console.log("handletoken refresh is running..... ")
        const response =   await refreshToken();

      console.log("reponse from handle referese token... ",response)

      return userInstance(originalRequest);

    }catch(error) {
        await handleTokenErrors(error as AxiosError);
        throw error;   
    }
};




const handleTokenErrors = async (error: AxiosError) => {
    console.log("Token error trying to logout...",error);
    store.dispatch(logoutUser());
    try {
      await logout();
      toast.success("Please login")
      localStorage.removeItem("userEmail");
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

            console.log("got 401....................")
            return handleTokenRefresh(originalRequest);
        } else if (error.response?.status === HttpStatusCode.FORBIDDEN) {
            await handleTokenErrors(error);
        }
        return Promise.reject(error);
    })