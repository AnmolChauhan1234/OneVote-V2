import axios from "axios";

import getCookie from "./getCookie";

export async function refreshToken() {
  const csrfToken = getCookie("csrf_token");
  const headers: Record<string, string> = {};

  if (csrfToken) {
    headers["X-CSRF-Token"] = csrfToken;
  }

  const response = await axios.post(
    "/api/v1/auth/refresh",
    {},
    {
      withCredentials: true,
      headers,
    }
  );

  return response.data;
}