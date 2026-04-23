"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { electionUpdateSchema, ElectionUpdateFormData } from "../schemas/election.schema";
import { useUpdateElection } from "../hooks/election.hooks";
import { useMe } from "@/features/auth/hooks/auth.hooks";
import { ROLES } from "@/constants/roles";
import { Input } from "@/components/ui/input";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { toast } from "sonner";
import { ElectionResponse } from "../types/types";
import { ChevronRight } from "lucide-react";

interface Props {
  election: ElectionResponse;
  onSuccess?: () => void;
  disabled?: boolean;
}

export function UpdateElectionForm({ election, onSuccess, disabled }: Props) {
  const { data: user } = useMe();
  const isSuperAdmin = user?.role === ROLES.SUPERADMIN;
  const { mutate: update, isPending } = useUpdateElection(election.id);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ElectionUpdateFormData>({
    resolver: zodResolver(electionUpdateSchema),
    defaultValues: {
      title: election.title,
      description: election.description || "",
      start_date: new Date(election.start_date).toISOString().slice(0, 16),
      end_date: new Date(election.end_date).toISOString().slice(0, 16),
      status: election.status as any,
      manual_override: election.manual_override,
      override_reason: election.override_reason || "",
    },
  });

  const watchManualOverride = watch("manual_override");

  const onSubmit = (data: ElectionUpdateFormData) => {
    // If not super admin, we shouldn't send manual_override fields at all to avoid potential 400s if schema is strict
    const payload = { ...data };
    if (!isSuperAdmin) {
      delete payload.manual_override;
      delete payload.override_reason;
    }

    update(payload, {
      onSuccess: () => {
        toast.success("Election manifest synchronized.");
        onSuccess?.();
      },
      onError: (err: any) => {
        toast.error(err.message || "Ledger update failed");
      },
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border border-black/5 p-6 md:p-12 rounded-[2.5rem] shadow-2xl shadow-black/[0.02] relative group overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-black/[0.02] rounded-full -translate-y-32 translate-x-32 group-hover:scale-110 transition-transform duration-1000" />

      <div className="mb-12 relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 bg-black rounded-full" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30">System Configuration</span>
        </div>
        <h2 className="text-4xl font-bold tracking-tighter text-black uppercase italic">Election Manifest</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 relative z-10">
        <div className="grid grid-cols-1 gap-10">
          <Input
            {...register("title")}
            label="Election Identity"
            placeholder="Official Election Title"
            variant="light"
            error={errors.title?.message}
            className="w-full"
            disabled={disabled || (election.status === "ONGOING" && !isSuperAdmin)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <Input
              {...register("start_date")}
              label="Activation Timestamp"
              type="datetime-local"
              variant="light"
              error={errors.start_date?.message}
              disabled={disabled || (election.status === "ONGOING" && !isSuperAdmin)}
            />
            <Input
              {...register("end_date")}
              label="Termination Timestamp"
              type="datetime-local"
              variant="light"
              error={errors.end_date?.message}
              disabled={disabled || (election.status === "COMPLETED" && !isSuperAdmin)}
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-black/40">
              Contextual Description
            </label>
            <textarea
              {...register("description")}
              className={`w-full px-6 py-5 text-sm font-medium outline-none transition-all duration-500 bg-black/[0.02] text-black border border-black/5 focus:border-black/20 focus:bg-white focus:ring-4 focus:ring-black/5 h-32 rounded-2xl resize-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="Provide the official purpose and context for this election node..."
              disabled={disabled}
            />
            {errors.description && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Governance State</label>
              <div className="relative group/select">
                <select
                  {...register("status")}
                  className={`w-full px-6 py-5 text-sm font-bold outline-none transition-all duration-500 bg-black/[0.02] text-black border border-black/5 focus:border-black/20 focus:bg-white focus:ring-4 focus:ring-black/5 rounded-2xl appearance-none ${(disabled || (election.status === "ONGOING" && !isSuperAdmin)) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={disabled || (election.status === "ONGOING" && !isSuperAdmin)}
                >
                  <option value="UPCOMING">UPCOMING</option>
                  <option value="ONGOING">ONGOING</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-black/20 group-focus-within/select:text-black transition-colors">
                  <ChevronRight size={18} className="rotate-90" />
                </div>
              </div>
              {errors.status && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{errors.status.message}</p>}
            </div>

            {isSuperAdmin && (
              <div className="space-y-3 bg-orange-50/30 p-6 rounded-3xl border border-orange-100/50">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-orange-900/40">Manual Override</label>
                  <input
                    type="checkbox"
                    {...register("manual_override")}
                    className="w-10 h-5 appearance-none bg-orange-200 rounded-full relative cursor-pointer outline-none transition-colors checked:bg-orange-500 before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-5"
                  />
                </div>
                <p className="text-[9px] text-orange-900/30 font-medium leading-relaxed">
                  Bypass time-based state transitions and force the selected governance state.
                </p>

                {watchManualOverride && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="pt-4 space-y-2"
                  >
                    <label className="text-[9px] font-black uppercase tracking-widest text-orange-900/60">Override Rationale</label>
                    <input
                      {...register("override_reason")}
                      placeholder="e.g. Early activation per committee request"
                      className="w-full bg-white border border-orange-200 px-4 py-2 text-xs rounded-xl outline-none focus:ring-2 focus:ring-orange-200 text-orange-950 font-medium"
                    />
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="pt-6">
          <PrimaryButton
            type="submit"
            disabled={isPending || disabled}
            className="w-full py-6 text-sm font-black tracking-[0.4em] rounded-2xl shadow-xl shadow-black/5 hover:shadow-black/10 transition-all active:scale-[0.99] uppercase italic"
          >
            {isPending ? "Syncing Ledger..." : "Update Election Manifest"}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
