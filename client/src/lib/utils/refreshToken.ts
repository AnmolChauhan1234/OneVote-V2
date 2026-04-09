import axios from "axios";

import getCookie from "./getCookie";

export async function refreshToken() {
  const csrfToken = getCookie("csrf_token");

  const response = await axios.post(
    "/api/v1/auth/refresh",
    {},
    {
      withCredentials: true,
      headers: {
        "X-CSRF-Token": csrfToken || "",
      },
    }
  );

  return response.data;
}