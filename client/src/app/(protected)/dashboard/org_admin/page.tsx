"use client";

import { useState } from "react";
import UserDashboard from "../user/page";
import OrgAdminDashboard from "./OrgAdminDashboard";

export default function OrgAdminPage() {
  const [view, setView] = useState<"org" | "user">("org");

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <button onClick={() => setView("org")}>Org Dashboard</button>

        <button onClick={() => setView("user")}>Voter View</button>
      </div>

      {view === "org" ? <OrgAdminDashboard /> : <UserDashboard />}
    </div>
  );
}
