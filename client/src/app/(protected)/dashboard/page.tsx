import { redirect } from "next/navigation";
import { getMeServer } from "@/lib/ssr/auth.server";

export default async function DashboardPage() {
  const user = await getMeServer();

  if (!user) {
    redirect("/login");
  }

  // 🔥 role-based routing
  if (user.role === "super_admin") {
    redirect("/dashboard/super_admin");
  }

  if (user.role === "admin") {
    redirect("/dashboard/admin");
  }

  if (user.user_type === "org_admin") {
    redirect("/dashboard/org_admin");
  }

  if (user.user_type !== "voter" && user.user_type !== "org_admin") {
    redirect("/unauthorized");
  }

  redirect("/dashboard/user");
}
