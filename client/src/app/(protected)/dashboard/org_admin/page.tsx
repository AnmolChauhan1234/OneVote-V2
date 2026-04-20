"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMe } from "@/features/auth/hooks";
import { useOrganisation } from "@/features/organisation/hooks/organisation.hooks";
import { OrgDashboardOverview } from "@/features/organisation/components/OrgDashboardOverview";
import { OrgEmptyState } from "@/features/organisation/components/OrgEmptyState";
import { CreateOrganisationForm } from "@/features/organisation/components/CreateOrganisationForm";
import { OrgPendingState } from "@/features/organisation/components/OrgPendingState";
import { Loader2 } from "lucide-react";

export default function OrgAdminPage() {
  const { data: user, isLoading: isUserLoading } = useMe();
  const [isCreating, setIsCreating] = useState(false);

  const hasOrgId = user?.org_ids && user.org_ids.length > 0;
  const primaryOrgId = hasOrgId ? user.org_ids[0] : "";

  // Wait, the useOrganisation hook is enabled if primaryOrgId exists.
  const { data: orgData, isLoading: isOrgLoading } = useOrganisation(primaryOrgId);

  if (isUserLoading || (hasOrgId && isOrgLoading)) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="animate-spin text-black/50" size={32} />
      </div>
    );
  }

  // State Machine Render Logic
  const renderContent = () => {
    // 1. If currently creating an organisation (Form View)
    if (isCreating && !hasOrgId) {
      return <CreateOrganisationForm onCancel={() => setIsCreating(false)} />;
    }

    // 2. If no organisation exists at all
    if (!hasOrgId || !orgData) {
      return <OrgEmptyState onCreateClick={() => setIsCreating(true)} />;
    }

    // 3. If organisation is created but pending verification
    if (orgData.status === "PENDING_VERIFICATION") {
      return <OrgPendingState />;
    }

    // 4. Default verified view
    return <OrgDashboardOverview />;
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <AnimatePresence mode="wait">
        <motion.div
          key={isCreating ? "form" : orgData?.status || "empty"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
