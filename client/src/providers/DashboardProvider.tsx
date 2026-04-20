"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type DashboardMode = "voter" | "org";

interface DashboardContextType {
  activeTab: DashboardMode;
  setActiveTab: (mode: DashboardMode) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<DashboardMode>("voter");

  // Optional: Persist choice in session
  useEffect(() => {
    const saved = localStorage.getItem("dashboard_mode") as DashboardMode;
    if (saved && (saved === "voter" || saved === "org")) {
      setActiveTab(saved);
    }
  }, []);

  const handleSetTab = (mode: DashboardMode) => {
    setActiveTab(mode);
    localStorage.setItem("dashboard_mode", mode);
  };

  return (
    <DashboardContext.Provider value={{ activeTab, setActiveTab: handleSetTab }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    // Return a fallback context if used outside the DashboardProvider
    // This allows the BottomHeader to be used safely on public pages like the Home page.
    return { activeTab: "voter" as DashboardMode, setActiveTab: () => { } };
  }
  return context;
}
