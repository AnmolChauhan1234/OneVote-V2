import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios"


import { refreshToken } from "../utils/refreshToken"
import { handleError } from "../utils/handleError"

import { AppError } from "../errors/AppError"

import {logger} from "../utils/logger";

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}[] = []

function processQueue(error: unknown) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else {
      promise.resolve(true)
    }
  })
  failedQueue = []
}

const axiosClient: AxiosInstance = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
})

// REQUEST INTERCEPTOR
axiosClient.interceptors.request.use((config) => {
  const methodsRequiringCSRF = ["post", "put", "patch", "delete"]

  logger.debug(`→ ${config.method?.toUpperCase()} ${config.url}`, config.data)

  if (methodsRequiringCSRF.includes(config.method || "")) {
    const csrfToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf_token="))
      ?.split("=")[1]

    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken
      logger.debug("CSRF token injected", { url: config.url })
    } else {
      logger.error("CSRF token missing — blocking request", { url: config.url })
      return Promise.reject(new AppError("CSRF token missing", 403, "CSRF_MISSING"))
    }
  }

  return config
})

// RESPONSE INTERCEPTOR
axiosClient.interceptors.response.use(
  (response) => {
    logger.info(`← ${response.status} ${response.config.url}`)
    return response
  },
  async (error: AxiosError) => {
    const originalRequest =
      error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    logger.error(`← ${error.response?.status} ${originalRequest?.url}`, error.response?.data)

    // 401 — attempt token refresh
    if (error.response?.status === 401) {
      if (isRefreshing) {
        logger.debug("401 — refresh already in progress, queuing request", { url: originalRequest?.url })
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(axiosClient(originalRequest)),
            reject: (err) => reject(err),
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true
      logger.warn("401 — access token expired, attempting refresh")

      try {
        await refreshToken()
        logger.info("Token refresh successful — retrying queued requests")
        processQueue(null)
        return axiosClient(originalRequest)

      } catch (refreshError) {
        logger.error("Token refresh failed — clearing queue, redirecting to login", refreshError)
        processQueue(refreshError)
        handleError(refreshError)
        return Promise.reject(refreshError)

      } finally {
        isRefreshing = false
      }
    }

    handleError(error)
    return Promise.reject(error)
  }
)

export default axiosClient;