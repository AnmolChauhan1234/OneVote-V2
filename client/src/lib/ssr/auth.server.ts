import { cookies } from "next/headers"
import { API_URLS } from "@/constants/apiURLs"
import type { User } from "@/types"
import { logger } from "@/lib/utils/logger"

export const getMeServer = async (): Promise<User | null> => {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("access_token")?.value

    if (!token) {
      logger.warn("getMeServer — no access_token found in cookies")
      return null
    }

    logger.debug("getMeServer — token found, calling backend")

    const res = await fetch(`${process.env.API_URL}/api/v1${API_URLS.AUTH.ME}`, {
      method: "GET",
      headers: {
        Cookie: `access_token=${token}`,
      },
      cache: "no-store",
    })

    if (!res.ok) {
      logger.error("getMeServer — backend responded not ok", { status: res.status })
      return null
    }

    const user = await res.json() as User
    logger.info("getMeServer — user fetched successfully", { userId: user.id, role: user.role })
    return user

  } catch (err) {
    logger.error("getMeServer — unexpected error", err)
    return null
  }
}