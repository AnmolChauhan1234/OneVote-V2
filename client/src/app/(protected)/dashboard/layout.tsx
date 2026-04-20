"use client";

import { useMe } from "@/features/auth/hooks";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: user, isLoading } = useMe();
  const router = useRouter();
  const pathname = usePathname();

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

      // ONLY redirect if they land on the exact "/dashboard" root
      if (pathname === "/dashboard") {
        if (user.user_type === "org_admin") {
          router.replace("/dashboard/org_admin");
        } else {
          router.replace("/dashboard/user");
        }
      }
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading) return null;

  return <>{children}</>;
}
