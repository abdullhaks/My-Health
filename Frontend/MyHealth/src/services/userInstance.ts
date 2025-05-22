import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { logoutUser } from "../redux/slices/userSlices";
import { store } from "../redux/store/store";
import { HttpStatusCode } from "../utils/enum";
import { refreshToken, logoutUser as logout } from "../api/user/userApi";
import toast from "react-hot-toast";


interface ErrorResponse {
  success: boolean;
  error: {
    message: string;
    code?: string;
  };
}

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    isRetry?: boolean;
  }
}

const apiUrl = import.meta.env.VITE_API_URL as string;
export const userInstance: AxiosInstance = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

// Request interceptor (uncomment if using Authorization header)
// userInstance.interceptors.request.use(
//   (config) => {
//     const accessToken = store.getState().user.accessToken;
//     if (accessToken) {
//       config.headers.Authorization = `Bearer ${accessToken}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

const handleTokenRefresh = async (originalRequest: InternalAxiosRequestConfig) => {
  try {
    console.log("Handling token refresh...");
    const response = await refreshToken();
    console.log("Response from refresh token:", response);

    // Assume refreshToken updates the cookie; retry original request
    return userInstance(originalRequest);
  } catch (error) {
    await handleTokenErrors(error as AxiosError<ErrorResponse>);
    throw error;
  }
};

const handleTokenErrors = async (error: AxiosError<ErrorResponse>) => {
  console.log("Handling token error:", error);

  store.dispatch(logoutUser());
  try {
    await logout();
    
    toast.error(error.message);
    localStorage.removeItem("userEmail");
  } catch (logoutError) {
    console.error("Logout failed:", logoutError);
    toast.error("Failed to log out. Please try again.");
  }
};

userInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig;

    if (error.response?.status === HttpStatusCode.UNAUTHORIZED && !originalRequest.isRetry) {
      originalRequest.isRetry = true;
      console.log("Received 401, attempting token refresh...");
      return handleTokenRefresh(originalRequest);
    } else if (error.response?.status === HttpStatusCode.FORBIDDEN) {
      await handleTokenErrors(error);
    }

    return Promise.reject(error);
  }
);