"use client";

import { motion } from "framer-motion";
import { usePendingOrganisations, useApproveOrganisation, useRejectOrganisation, useOrganisationDocuments } from "../hooks/admin.hooks";
import { Check, X, ShieldAlert, FileText, Loader2, FileArchive } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const AdminDashboardOverview = () => {
  const { data: pendingOrgs, isLoading } = usePendingOrganisations();
  const { mutate: approve, isPending: isApproving } = useApproveOrganisation();
  const { mutate: reject, isPending: isRejecting } = useRejectOrganisation();
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  const handleApprove = (orgId: string) => {
    approve({ orgId, payload: { remarks: "Approved by Super Admin" } }, {
      onSuccess: () => {
        toast.success("Organization approved successfully!");
      },
      onError: (err: any) => {
        toast.error(err?.message || "Failed to approve organization.");
      }
    });
  };

  const handleReject = (orgId: string) => {
    reject({ orgId, payload: { reason: "Did not meet criteria." } }, {
      onSuccess: () => {
        toast.success("Organization rejected successfully!");
      },
      onError: (err: any) => {
        toast.error(err?.message || "Failed to reject organization.");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-black/50">
          <Loader2 className="animate-spin" size={32} />
          <p className="text-sm font-medium tracking-widest uppercase">Loading Pending Requests</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="mb-12">
        <h1 className="text-3xl font-black tracking-tight text-black mb-2 flex items-center gap-3">
          <ShieldAlert size={32} />
          Admin Verification Queue
        </h1>
        <p className="text-black/60 max-w-2xl text-lg">
          Review and verify pending organizations applying for node representation on the OneVote ledger.
        </p>
      </div>

      {!pendingOrgs || pendingOrgs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/5 rounded-3xl p-16 text-center border border-black/5"
        >
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Check className="text-black/40" size={32} />
          </div>
          <h3 className="text-xl font-bold text-black mb-2">You're all caught up!</h3>
          <p className="text-black/50 max-w-sm mx-auto">
            There are currently no organizations awaiting verification. 
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-6">
          {pendingOrgs.map((org, i) => (
            <motion.div
              key={org.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl p-8 border border-black/10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-shadow"
            >
              <div>
                <h3 className="text-2xl font-bold text-black mb-1">{org.name}</h3>
                <div className="flex items-center gap-3 text-sm text-black/50 font-medium">
                  <span className="flex items-center gap-1">
                    <FileText size={16} /> Documents Attached
                  </span>
                  <span>•</span>
                  <span>Submitted: {new Date(org.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <DocsButton orgId={org.id} />

                <button
                  onClick={() => handleReject(org.id)}
                  disabled={isApproving || isRejecting}
                  className="px-6 py-3 rounded-xl font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-2"
                >
                  <X size={18} /> Reject
                </button>
                <button
                  onClick={() => handleApprove(org.id)}
                  disabled={isApproving || isRejecting}
                  className="px-6 py-3 rounded-xl font-bold bg-black text-white hover:bg-black/90 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Check size={18} /> Verify & Approve
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

const DocsButton = ({ orgId }: { orgId: string }) => {
  const { data: docs } = useOrganisationDocuments(orgId);
  
  if (!docs || docs.length === 0) return null;

  return (
    <button
      onClick={() => window.open(docs[0].file_url, '_blank')}
      className="px-6 py-3 rounded-xl font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center gap-2"
    >
      <FileArchive size={18} /> View Docs
    </button>
  );
};
