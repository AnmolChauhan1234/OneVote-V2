// import axios, {
//   AxiosError,
//   AxiosInstance,
//   InternalAxiosRequestConfig,
// } from "axios";

// import { refreshToken } from "../utils/refreshToken";
// import { handleError } from "../utils/handleError";
// import { AppError } from "../errors/AppError";
// import { logger } from "../utils/logger";
// import getCookie from "../utils/getCookie";

// import { STATUSCODES } from "@/constants/statusCode";
// import { queryClient } from "./queryClient";

// let isRefreshing = false;
// let isLoggingOut = false;

// let failedQueue: {
//   resolve: (value?: unknown) => void;
//   reject: (reason?: unknown) => void;
// }[] = [];

// function processQueue(error: unknown) {
//   failedQueue.forEach((promise) => {
//     if (error) {
//       promise.reject(error);
//     } else {
//       promise.resolve(true);
//     }
//   });
//   failedQueue = [];
// }

// const axiosClient: AxiosInstance = axios.create({
//   baseURL: "/api/v1",
//   withCredentials: true,
// });

// // REQUEST INTERCEPTOR
// axiosClient.interceptors.request.use((config) => {
//   const methodsRequiringCSRF = ["post", "put", "patch", "delete"];

//   logger.debug(`→ ${config.method?.toUpperCase()} ${config.url}`, config.data);

//   if (methodsRequiringCSRF.includes(config.method || "")) {
//     const csrfToken = getCookie("csrf_token");

//     if (csrfToken) {
//       config.headers["X-CSRF-Token"] = csrfToken;
//       logger.debug("CSRF token injected", { url: config.url });
//     }
//     // else {
//     //   logger.error("CSRF token missing — blocking request", {
//     //     url: config.url,
//     //   });
//     //   return Promise.reject(
//     //     new AppError(
//     //       "CSRF token missing",
//     //       STATUSCODES.FORBIDDEN,
//     //       "CSRF_MISSING",
//     //     ),
//     //   );
//     // }
//   }

//   return config;
// });

// // RESPONSE INTERCEPTOR
// axiosClient.interceptors.response.use(
//   (response) => {
//     logger.info(`← ${response.status} ${response.config.url}`);
//     return response;
//   },
//   async (error: AxiosError) => {
//     const originalRequest = error.config as InternalAxiosRequestConfig & {
//       _retry?: boolean;
//     };

//     logger.error(
//       `← ${error.response?.status} ${originalRequest?.url}`,
//       error.response?.data,
//     );

//     // 401 — attempt token refresh (ONLY ONCE)
//     if (error.response?.status === 401 && !originalRequest?._retry) {

//       const skipUrls = [
//         "/auth/logout",
//         "/auth/login",
//         "/auth/signup",
//         "/auth/refresh",
//       ];

//       if (skipUrls.some((url) => originalRequest?.url?.includes(url))) {
//         return Promise.reject(error);
//       }

//       if (isRefreshing) {
//         logger.debug("401 — refresh already in progress, queuing request", {
//           url: originalRequest?.url,
//         });

//         return new Promise((resolve, reject) => {
//           failedQueue.push({
//             resolve: () => resolve(axiosClient(originalRequest)),
//             reject: (err) => reject(err),
//           });
//         });
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       logger.warn("401 — access token expired, attempting refresh");

//       try {
//         await refreshToken();

//         logger.info("Token refresh successful — retrying queued requests");

//         processQueue(null);
//         return axiosClient(originalRequest);
//       } catch (refreshError) {
//         logger.error("Token refresh failed — forcing logout", refreshError);

//         processQueue(refreshError);

//         if (!isLoggingOut) {
//           isLoggingOut = true;

//           //clear client state
//           queryClient.clear();

//           //est-effort server logout (clears cookies)
//           try {
//             await fetch("/api/v1/auth/logout", {
//               method: "POST",
//               credentials: "include",
//             });
//           } catch {
//             // ignore failure — we still force logout
//           }

//           //hard redirect
//           window.location.href = "/login";
//         }

//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     handleError(error);
//     return Promise.reject(error);
//   },
// );

// export default axiosClient;

import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

import { refreshToken } from "../utils/refreshToken";
import { handleError } from "../utils/handleError";
import { logger } from "../utils/logger";
import getCookie from "../utils/getCookie";

import { queryClient } from "./queryClient";

let isRefreshing = false;
let isLoggingOut = false;

let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}[] = [];

function processQueue(error: unknown) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(true);
    }
  });
  failedQueue = [];
}

const axiosClient: AxiosInstance = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
});

// ================= REQUEST INTERCEPTOR =================

axiosClient.interceptors.request.use((config) => {
  const methodsRequiringCSRF = ["post", "put", "patch", "delete"];

  logger.debug(`→ ${config.method?.toUpperCase()} ${config.url}`, config.data);

  if (methodsRequiringCSRF.includes(config.method || "")) {
    const csrfToken = getCookie("csrf_token");

    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
      logger.debug("CSRF token injected", { url: config.url });
    }
  }

  return config;
});

// ================= RESPONSE INTERCEPTOR =================

axiosClient.interceptors.response.use(
  (response) => {
    logger.info(`← ${response.status} ${response.config.url}`);
    return response;
  },

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!originalRequest) return Promise.reject(error);

    const isMeCheck401 = error.response?.status === 401 && originalRequest.url?.includes("/auth/me");

    if (isMeCheck401) {
      logger.debug(`← 401 ${originalRequest.url} (Guest/Logged out)`);
    } else {
      logger.error(
        `← ${error.response?.status} ${originalRequest.url}`,
        error.response?.data,
      );
    }

    // ================= 401 HANDLING =================

    if (error.response?.status === 401 && !originalRequest._retry) {
      const url = originalRequest.url || "";

      const skipUrls = [
        "/auth/login",
        "/auth/logout",
        "/auth/signup",
        "/auth/refresh", //refresh handled separately
      ];

      // Skip certain routes completely
      if (skipUrls.some((skip) => url.includes(skip))) {
        return Promise.reject(error);
      }

      // IMPORTANT: Do NOT refresh for /me
      if (url.includes("/auth/me")) {
        logger.warn("User not authenticated — skipping refresh");
        return Promise.reject(error);
      }

      // If already refreshing → queue request
      if (isRefreshing) {
        logger.debug("Refresh in progress — queueing request", { url });

        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(axiosClient(originalRequest)),
            reject,
          });
        });
      }

      // 🔥 Start refresh
      originalRequest._retry = true;
      isRefreshing = true;

      logger.warn("401 — access token expired, attempting refresh");

      try {
        await refreshToken(); // uses separate axios instance

        logger.info("Token refresh successful");

        processQueue(null);

        return axiosClient(originalRequest);
      } catch (refreshError) {
        logger.error("Token refresh failed — forcing logout", refreshError);

        processQueue(refreshError);

        if (!isLoggingOut) {
          isLoggingOut = true;

          // Clear React Query cache
          queryClient.clear();

          // Best-effort server logout
          try {
            await fetch("/api/v1/auth/logout", {
              method: "POST",
              credentials: "include",
            });
          } catch {
            // ignore
          }

          // Hard redirect
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ================= OTHER ERRORS =================

    // Skip global error handling for /me 401s (expected behavior)
    if (error.response?.status === 401 && originalRequest.url?.includes("/auth/me")) {
      return Promise.reject(error);
    }

    handleError(error);
    return Promise.reject(error);
  },
);

export default axiosClient;
