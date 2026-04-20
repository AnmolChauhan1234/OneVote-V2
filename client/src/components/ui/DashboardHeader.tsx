"use client";

import { useLogout, useMe } from "@/features/auth/hooks";
import { motion } from "framer-motion";
import { Diamond, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function DashboardHeader() {
  const { data: user } = useMe();
  const { mutate: logout } = useLogout();
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Determine active tab based on the current URL
  let activeTab = "voter";
  if (pathname.includes("/org_admin")) activeTab = "org";
  if (pathname.includes("/admin") && !pathname.includes("/org_admin")) activeTab = "admin";

  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin = user?.role === "admin";
  const isSystemAdmin = isSuperAdmin || isAdmin;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* LEFT: Logo */}
          <div className="flex items-center gap-2">
            <Link
              href={!mounted ? "#" : (isSuperAdmin ? "/dashboard/super_admin" : isAdmin ? "/dashboard/admin" : "/dashboard/user")}
              className="flex items-center gap-2 text-black hover:opacity-70 transition"
            >
              <Diamond size={24} />
              <span className="font-bold tracking-widest uppercase text-sm">OneVote</span>
            </Link>
          </div>

          {/* CENTER: Switcher (Available to regular users only) */}
          <div className="flex-1 flex justify-center">
            {!isSystemAdmin && mounted && (
              <div className="flex bg-black/5 rounded-full p-1 relative items-center">
                <motion.div
                  className="absolute bg-white shadow-sm h-7 rounded-full"
                  initial={false}
                  animate={{
                    x: activeTab === "voter" ? 4 : 74,
                    width: 62,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <button
                  onClick={() => router.push("/dashboard/user")}
                  className={`relative z-10 w-[62px] py-1 text-[10px] font-bold uppercase tracking-wider transition-colors duration-200 ${activeTab === "voter" ? "text-black" : "text-black/50 hover:text-black"
                    }`}
                >
                  Voter
                </button>
                <button
                  onClick={() => router.push("/dashboard/org_admin")}
                  className={`relative z-10 w-[62px] py-1 text-[10px] font-bold uppercase tracking-wider transition-colors duration-200 ${activeTab === "org" ? "text-black" : "text-black/50 hover:text-black"
                    }`}
                >
                  Org
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: User Profile & Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-black">
                {mounted ? (user?.full_name || "User") : "User"}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-black/50 font-bold">
                {mounted ? (
                  isSuperAdmin ? "Super Admin" :
                    isAdmin ? "Admin" :
                      user?.user_type === "org_admin" ? "Org Admin" : "Voter"
                ) : "Voter"}
              </span>
            </div>
            <div className="w-8 h-8 bg-black/5 flex items-center justify-center text-black">
              <User size={16} />
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 text-black/50 hover:text-black transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
