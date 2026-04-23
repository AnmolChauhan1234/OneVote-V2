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
      <div className="flex h-[300px] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-black/50">
          <Loader2 className="animate-spin" size={32} />
          <p className="text-[10px] font-black tracking-widest uppercase">Syncing Queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {!pendingOrgs || pendingOrgs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/[0.02] rounded-[2rem] p-12 text-center border border-black/5"
        >
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/[0.02]">
            <Check className="text-black/20" size={32} />
          </div>
          <h3 className="text-xl font-black text-black mb-2 tracking-tight">Queue Empty</h3>
          <p className="text-black/40 text-sm font-medium max-w-xs mx-auto">
            All organization verification requests have been processed. 
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {pendingOrgs.map((org, i) => (
            <motion.div
              key={org.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-[2rem] p-8 border border-black/5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-black/10 transition-all duration-300"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-black text-black tracking-tight">{org.name}</h3>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase rounded-md">Pending</span>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-black/40 font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-1.5">
                    <FileText size={14} className="text-black/20" /> {org.id.slice(0, 8)}
                  </span>
                  <span>•</span>
                  <span>{new Date(org.submittedAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <DocsButton orgId={org.id} />

                <button
                  onClick={() => handleReject(org.id)}
                  disabled={isApproving || isRejecting}
                  className="h-12 px-5 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
                >
                  <X size={16} /> Reject
                </button>
                <button
                  onClick={() => handleApprove(org.id)}
                  disabled={isApproving || isRejecting}
                  className="h-12 px-5 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-black text-white hover:bg-black/80 transition-all flex items-center gap-2 shadow-xl shadow-black/10"
                >
                  <Check size={16} /> Verify
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
      className="h-12 px-5 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2"
    >
      <FileArchive size={16} /> Documents
    </button>
  );
};
