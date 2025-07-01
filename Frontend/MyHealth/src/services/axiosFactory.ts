// src/services/axiosFactory.ts
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { store } from "../redux/store/store";
import { HttpStatusCode } from "../utils/enum";
import toast from "react-hot-toast";
import { logoutUser } from "../redux/slices/userSlices";
import { logoutDoctor } from "../redux/slices/doctorSlices";
import { logoutAdmin } from "../redux/slices/adminSlices";
import { refreshToken as userRefreshToken, logoutUser as userLogout } from "../api/user/userApi";
import { refreshToken as doctorRefreshToken, logoutDoctor as doctorLogout } from "../api/doctor/doctorApi";
import { refreshToken as adminRefreshToken, logoutAdmin as adminLogout } from "../api/admin/adminApi";

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

type EntityType = "user" | "doctor" | "admin";

interface EntityConfig {
  entity: EntityType;
  logoutAction: () => void;
  refreshTokenApi: () => Promise<any>;
  logoutApi: () => Promise<any>;
  emailStorageKey: string;
  updateTokenAction?: (accessToken: string) => void; // Optional for admin
}

const apiUrl = import.meta.env.VITE_API_URL as string;

const entityConfigs: Record<EntityType, EntityConfig> = {
  user: {
    entity: "user",
    logoutAction: logoutUser,
    refreshTokenApi: userRefreshToken,
    logoutApi: userLogout,
    emailStorageKey: "userEmail",
  },
  doctor: {
    entity: "doctor",
    logoutAction: logoutDoctor,
    refreshTokenApi: doctorRefreshToken,
    logoutApi: doctorLogout,
    emailStorageKey: "doctorEmail",
  },
  admin: {
    entity: "admin",
    logoutAction: logoutAdmin,
    refreshTokenApi: adminRefreshToken,
    logoutApi: adminLogout,
    emailStorageKey: "adminEmail",
    updateTokenAction: (accessToken: string) =>
      store.dispatch({
        type: "admin/login",
        payload: {
          admin: store.getState().admin.admin,
          accessToken,
        },
      }),
  },
};

const createAxiosInstance = (config: EntityConfig): AxiosInstance => {
  const instance = axios.create({
    baseURL: apiUrl,
    withCredentials: true,
  });

  const handleTokenRefresh = async (originalRequest: InternalAxiosRequestConfig) => {
    try {
      console.log(`Handling token refresh for ${config.entity}...`);
      const response = await config.refreshTokenApi();
      console.log(`Response from refresh token for ${config.entity}:`, response);

      if (config.entity === "admin" && response.accessToken && config.updateTokenAction) {
        config.updateTokenAction(response.accessToken);
        originalRequest.headers.set("Authorization", `Bearer ${response.accessToken}`);
      }

      return instance(originalRequest);
    } catch (error) {
      await handleTokenErrors(error as AxiosError<ErrorResponse>);
      throw error;
    }
  };

  const handleTokenErrors = async (error: AxiosError<ErrorResponse>) => {
    console.log(`Handling token error for ${config.entity}:`, error);
    store.dispatch(config.logoutAction());
    try {
      await config.logoutApi();
      toast.error(config.entity === "doctor" ? "Please login" : error.response?.data?.error?.message || "Session expired");
      localStorage.removeItem(config.emailStorageKey);
    } catch (logoutError) {
      console.error(`Logout failed for ${config.entity}:`, logoutError);
      toast.error("Failed to log out. Please try again.");
    }
  };

  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError<ErrorResponse>) => {
      const originalRequest = error.config as InternalAxiosRequestConfig;

      if (error.response?.status === HttpStatusCode.UNAUTHORIZED && !originalRequest.isRetry) {
        originalRequest.isRetry = true;
        console.log(`Received 401 for ${config.entity}, attempting token refresh...`);
        return handleTokenRefresh(originalRequest);
      } else if (error.response?.status === HttpStatusCode.FORBIDDEN) {
        await handleTokenErrors(error);
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

export const userInstance = createAxiosInstance(entityConfigs.user);
export const doctorInstance = createAxiosInstance(entityConfigs.doctor);
export const adminInstance = createAxiosInstance(entityConfigs.admin);