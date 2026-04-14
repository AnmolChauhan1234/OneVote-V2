"use client";

import { useMe } from "@/features/auth/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: user, isLoading } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "super_admin") {
        router.replace("/dashboard/super_admin");
        return;
      }

      if (user.role === "admin") {
        router.replace("/dashboard/admin");
        return;
      }

      if (user.user_type === "org_admin") {
        router.replace("/dashboard/org_admin");
        return;
      }

      if (user.user_type !== "voter") {
        router.replace("/unauthorized");
        return;
      }

      router.replace("/dashboard/user");
    }
  }, [user, isLoading, router]);

  if (isLoading) return null;

  return <>{children}</>;
}
