"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userOrgIdentifierCreateSchema, UserOrgIdentifierCreateData } from "../schemas/identifier.schema";
import { useAddUserOrgIdentifier, useUserOrgIdentifiers } from "../hooks/auth.hooks";
import { Input } from "@/components/ui/input";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { toast } from "sonner";
import { ShieldCheck, Fingerprint, Plus, AlertCircle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function IdentifierMapper() {
  const { data: identifiers, isLoading: isIdentifiersLoading } = useUserOrgIdentifiers();
  const { mutate: addIdentifier, isPending } = useAddUserOrgIdentifier();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserOrgIdentifierCreateData>({
    resolver: zodResolver(userOrgIdentifierCreateSchema),
  });

  const onSubmit = (data: UserOrgIdentifierCreateData) => {
    addIdentifier(data, {
      onSuccess: () => {
        toast.success("Identity mapped successfully!");
        reset();
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to map identity");
      },
    });
  };

  return (
    <div className="space-y-10">
      <div className="bg-white border border-black p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-black" />
        
        <div className="flex items-center gap-4 mb-8">
           <div className="p-3 bg-black text-white">
              <Fingerprint size={24} />
           </div>
           <div>
              <h2 className="text-2xl font-bold tracking-tight text-black">Identity Mapping</h2>
              <p className="text-xs uppercase tracking-widest text-black/40 mt-1 font-bold">
                Link your organizational credentials (e.g. Roll Number) to participate in specific elections.
              </p>
           </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              {...register("org_id")}
              label="Organization ID"
              placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
              variant="light"
              error={errors.org_id?.message}
            />
            <Input
              {...register("identifier_value")}
              label="Unique ID (Roll No / Email)"
              placeholder="e.g. 21CS1001"
              variant="light"
              error={errors.identifier_value?.message}
            />
          </div>

          <div className="flex items-start gap-3 p-4 bg-black/5">
             <AlertCircle size={16} className="mt-0.5 text-black/40 shrink-0" />
             <p className="text-[11px] text-black/60 leading-relaxed uppercase tracking-tighter">
                Note: This ID must exactly match the one uploaded by your organization admin in the eligible voters list.
             </p>
          </div>

          <PrimaryButton type="submit" disabled={isPending} className="w-full md:w-auto px-12">
            {isPending ? "Linking..." : "Link Identity"}
          </PrimaryButton>
        </form>
      </div>

      {/* Linked Identifiers List */}
      <div className="space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <ShieldCheck size={20} className="text-black/40" />
            Active Mappings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {isIdentifiersLoading ? (
               <div className="col-span-2 py-10 text-center text-black/20 font-bold uppercase tracking-widest animate-pulse">
                  Loading persistent identities...
               </div>
             ) : identifiers?.length === 0 ? (
               <div className="col-span-2 py-10 border border-dashed border-black/10 text-center text-black/40 font-medium italic">
                  No identities mapped yet. Link one above to start voting.
               </div>
             ) : (
               identifiers?.map((id: any) => (
                 <motion.div 
                   key={id.id}
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="bg-white border border-black/5 p-5 flex items-center justify-between group hover:border-black/20 transition-all"
                 >
                   <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-black/40">Org: {id.org_id.substring(0, 8)}...</p>
                      <p className="text-lg font-bold tracking-tight">{id.identifier_value}</p>
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                      <button className="p-2 text-black/20 hover:text-red-500 transition opacity-0 group-hover:opacity-100">
                        <Trash2 size={16} />
                      </button>
                   </div>
                 </motion.div>
               ))
             )}
          </div>
      </div>
    </div>
  );
}
