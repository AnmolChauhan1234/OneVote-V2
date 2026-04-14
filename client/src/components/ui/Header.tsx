"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogIn, Diamond } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { ROUTES } from "@/constants/routes";
import { useLogout, useMe } from "@/features/auth/hooks";
import path from "path";

// Menu items configuration
const MENU_ITEMS = [
  { name: "About", path: "/login" },
  { name: "Dashboard", path: ROUTES.DASHBOARD.PROTECTED },
  { name: "Projects", path: "/login" },
  { name: "Approach", path: "/login" },
  { name: "Contact", path: "/login" },
  { name: "Test", path: "/test" },
] as const;

export function BottomHeader() {
  const { data: user } = useMe();
  const { mutate: logout } = useLogout();

  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Explicitly close menu on route change (handles browser back/forward)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // HANDLE LOGOUT
  const handleLogout = () => {
    logout();
    setOpen(false);
  };

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  const handleNavigation = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  // Text slide animation variants (same as PrimaryButton)
  const textVariants = {
    rest: { y: 0 },
    hover: { y: "120%" },
  };

  const textRevealVariants = {
    rest: { y: "-120%" },
    hover: { y: 0 },
  };

  return (
    <>
      {/* 🔥 FLOATING HEADER (BOTTOM CENTER) - HIDDEN WHEN MENU OPEN */}
      {!open && (
        <motion.div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] sm:w-auto px-4 sm:px-0">
          <motion.div
            layout
            className="grid grid-cols-3 items-center px-4 sm:px-8 py-3 bg-black/90 backdrop-blur-md text-white shadow-lg"
            style={{ width: "280px" }}
          >
            {/* LEFT — LOGO */}
            <div className="flex justify-start">
              <div
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="flex items-center gap-2 text-sm font-medium tracking-wide cursor-pointer hover:opacity-70 transition"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <Diamond />
                </div>
              </div>
            </div>

            {/* CENTER — HOME */}
            <div className="flex justify-center">
              <div
                onClick={() => router.push("/")}
                className="text-xs tracking-[0.25em] uppercase opacity-80 cursor-pointer hover:opacity-100 transition"
              >
                Home
              </div>
            </div>

            {/* RIGHT — MENU */}
            <div className="flex justify-end">
              <button
                onClick={() => setOpen(true)}
                className="flex flex-col gap-1.5 cursor-pointer group px-2 py-1 rounded-sm transition-all duration-200 ease-out hover:scale-105 hover:bg-white/5"
              >
                <span className="w-5 h-px bg-white transition-all duration-200 group-hover:w-6 opacity-90" />
                <span className="w-5 h-px bg-white transition-all duration-200 group-hover:w-4 opacity-70" />
                <span className="w-5 h-px bg-white transition-all duration-200 group-hover:w-6 opacity-90" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            key="menu-overlay-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center px-4 sm:px-6"
          >
            {/* Background blur - darker for better contrast */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Menu Card - Above the X button with better visibility */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 100 }}
              transition={{
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="bg-[#0a0a0a] text-white w-full max-w-lg p-6 sm:p-8 shadow-2xl border border-white/20 rounded-none mb-4 z-10"
              style={{
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              }}
            >
              {/* Header with Menu title */}
              <div className="mb-8">
                <div className="text-[10px] tracking-[0.3em] opacity-60 uppercase text-left">
                  Navigation
                </div>
              </div>

              {/* MENU ITEMS - Left aligned with text animation */}
              <div className="space-y-4">
                {MENU_ITEMS.map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ x: -40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -40, opacity: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    onClick={() => handleNavigation(item.path)}
                    className="group cursor-pointer text-left relative overflow-hidden py-1"
                    whileHover="hover"
                    // initial="rest"
                  >
                    <div className="relative h-[1.4em] overflow-hidden">
                      <motion.span
                        variants={textVariants}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="block text-base sm:text-lg font-medium tracking-tight text-white"
                      >
                        {item.name}
                      </motion.span>
                      <motion.span
                        variants={textRevealVariants}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-0 text-base sm:text-lg font-medium tracking-tight text-white/40"
                      >
                        {item.name}
                      </motion.span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA Button - Centered, 90% width */}
              <div className="mt-10 flex justify-center">
                <div className="w-[90%]">
                  <PrimaryButton
                    variant="dark"
                    className="w-full py-3 text-sm"
                    onClick={() => {
                      if (user) {
                        handleLogout();
                      } else {
                        setOpen(false);
                        router.push("/login");
                      }
                    }}
                  >
                    {user ? (
                      <span className="flex items-center justify-center gap-2 whitespace-nowrap">
                        {/* <User size={14} /> */}
                        Logout
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2 whitespace-nowrap">
                        {/* <LogIn size={14} /> */}
                        Login / Signup
                      </span>
                    )}
                  </PrimaryButton>
                </div>
              </div>
            </motion.div>

            {/* X Button - EXACT position where home tray was (bottom-6) */}
            <motion.button
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, y: 20 }}
              transition={{
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.1,
              }}
              onClick={() => setOpen(false)}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-black/90 backdrop-blur-md text-white flex items-center justify-center cursor-pointer hover:bg-black transition shadow-lg border border-white/20"
            >
              <X size={20} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
