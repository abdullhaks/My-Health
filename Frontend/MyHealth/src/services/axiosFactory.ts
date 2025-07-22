import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";

import { store } from "../redux/store/store";
import { logoutUser } from "../redux/slices/userSlices";
import { logoutDoctor } from "../redux/slices/doctorSlices";
import { logoutAdmin } from "../redux/slices/adminSlices";

import {
  refreshToken as userRefreshToken,
  logoutUser as userLogout,
} from "../api/user/userApi";

import {
  refreshToken as doctorRefreshToken,
  logoutDoctor as doctorLogout,
} from "../api/doctor/doctorApi";

import {
  refreshToken as adminRefreshToken,
  logoutAdmin as adminLogout,
} from "../api/admin/adminApi";

import toast from "react-hot-toast";
import { HttpStatusCode } from "../utils/enum";

interface ErrorResponse {
  success: boolean;
  error: {
    message: string;
    code?: string;
  };
}

declare module "axios" {
  interface InternalAxiosRequestConfig {
    isRetry?: boolean;
  }
}

const apiUrl = import.meta.env.VITE_API_URL as string;


 //Helper to determine role from URL path

const getRoleFromURL = (url?: string): "user" | "doctor" | "admin" | null => {
  
  if (!url) return null;
  if (url.includes("api/user")) return "user";
  if (url.includes("api/doctor")) return "doctor";
  if (url.includes("api/admin")) return "admin";
  return null;
};

/**
 * Logout logic for each role
 */
const handleLogout = async (role: string, error: AxiosError<ErrorResponse>) => {
  switch (role) {
    case "user":
      store.dispatch(logoutUser());
      await userLogout();
      localStorage.removeItem("userEmail");
      break;
    case "doctor":
      store.dispatch(logoutDoctor());
      await doctorLogout();
      localStorage.removeItem("doctorEmail");
      break;
    case "admin":
      store.dispatch(logoutAdmin());
      await adminLogout();
      localStorage.removeItem("adminEmail");
      break;
  }

  toast.error(error.message || "Session expired. Please login again.");
};

/**
 * Token refresh per role
 */
const handleTokenRefresh = async (
  originalRequest: InternalAxiosRequestConfig,
  role: "user" | "doctor" | "admin"
) => {
  try {
    let response;

    switch (role) {
      case "user":
        response = await userRefreshToken();
        break;
      case "doctor":
        response = await doctorRefreshToken();
        break;
      case "admin":
        response = await adminRefreshToken();
        break;
    }

    console.log(`Token refreshed for ${role}:`, response);
    return axios(originalRequest);
  } catch (err) {
    await handleLogout(role, err as AxiosError<ErrorResponse>);
    throw err;
  }
};


  //Factory for role-based axios instances
 
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: apiUrl,
    withCredentials: true,
  });

  instance.interceptors.response.use( 
    (response: AxiosResponse) => response,
    async (error: AxiosError<ErrorResponse>) => {
      const originalRequest = error.config as InternalAxiosRequestConfig;

      console.log("original request is ",originalRequest);
      const role = getRoleFromURL(`${originalRequest?.baseURL}${originalRequest?.url}`);
      if (!role) return Promise.reject(error);

      if (
        error.response?.status === HttpStatusCode.UNAUTHORIZED &&
        !originalRequest.isRetry
      ) {
        originalRequest.isRetry = true;
        console.log(`401 for ${role}. Attempting token refresh...`);
        return handleTokenRefresh(originalRequest, role);
      } else if (error.response?.status === HttpStatusCode.FORBIDDEN) {
        await handleLogout(role, error);
      }

      return Promise.reject(error);
    }
  );

  return instance;
  
};


export const userInstance = createAxiosInstance();
export const doctorInstance = createAxiosInstance();
export const adminInstance = createAxiosInstance();
