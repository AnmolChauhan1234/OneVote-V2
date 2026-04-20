"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, UploadCloud, X, ArrowLeft, Loader2 } from "lucide-react";
import { 
  OrganisationCreateFormData, 
  organisationCreateSchema 
} from "../schemas/organisation.schema";
import { 
  useCreateOrganisation, 
  useUpdateOrganisationDocuments 
} from "../hooks/organisation.hooks";
import { useMe } from "@/features/auth/hooks";
import { queryClient } from "@/lib/instances/queryClient";
import { queryKeys } from "@/constants/queryKeys";

interface CreateOrganisationFormProps {
  onCancel: () => void;
}

export function CreateOrganisationForm({ onCancel }: CreateOrganisationFormProps) {
  const { data: user } = useMe();
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");

  const { mutateAsync: createOrg } = useCreateOrganisation();
  const { mutateAsync: uploadDocs } = useUpdateOrganisationDocuments("");

  const { register, handleSubmit, formState: { errors } } = useForm<OrganisationCreateFormData>({
    resolver: zodResolver(organisationCreateSchema),
    defaultValues: { owner_id: user?.id }
  });

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(Array.from(e.dataTransfer.files));
  };

  const handleFiles = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: OrganisationCreateFormData) => {
    if (files.length === 0) {
      setErrorText("You must upload at least one official document for verification.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorText("");
      
      // The backend strictly requires the primary document in the initial creation request.
      const org = await createOrg({ payload: data, document: files[0] });
      
      // Step 3: Refresh Global User State (to pick up the new org status)
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      
    } catch (err: any) {
      console.error(err);
      setErrorText(err?.response?.data?.detail || "Failed to create organization. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      <button 
        onClick={onCancel}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/50 hover:text-black mb-8 transition"
      >
        <ArrowLeft size={14} /> Back
      </button>

      <div className="bg-white border border-black/5 p-8 sm:p-12">
        <div className="mb-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-black text-white flex items-center justify-center">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Register Organization</h1>
            <p className="text-sm font-medium text-black/50">Submit details for verification.</p>
          </div>
        </div>

        {errorText && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
            {errorText}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Section 1: Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-black/40 border-b border-black/5 pb-2">
              1. Basic Information
            </h3>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-black">Organization Name *</label>
              <input 
                {...register("name")}
                className="w-full border border-black/10 p-3 text-sm focus:border-black outline-none transition"
                placeholder="E.g., Stanford University"
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-black">Organization Type</label>
              <input 
                {...register("type")}
                className="w-full border border-black/10 p-3 text-sm focus:border-black outline-none transition"
                placeholder="E.g., University, Corporate, Non-Profit"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-black">Description</label>
              <textarea 
                {...register("description")}
                rows={3}
                className="w-full border border-black/10 p-3 text-sm focus:border-black outline-none transition resize-none"
                placeholder="Tell us about the purpose of your organization..."
              />
            </div>
          </div>

          {/* Section 2: Documents */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-black/40 border-b border-black/5 pb-2">
              2. Legal Documents
            </h3>
            <p className="text-[11px] font-medium text-black/50">
              Upload official institutional documents (e.g., registration certificate, tax ID, authorization letter) to speed up verification.
            </p>
            
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-black/10 p-10 flex flex-col items-center justify-center text-center bg-black/[0.02] hover:bg-black/[0.04] transition cursor-pointer"
            >
              <UploadCloud size={32} className="text-black/30 mb-3" />
              <p className="text-sm font-bold text-black">Drag & drop files here</p>
              <p className="text-xs text-black/50 mt-1 mb-4">or click to browse</p>
              <label className="bg-black text-white px-6 py-2 text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-black/80 transition">
                Select Files
                <input 
                  type="file" 
                  multiple 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files) handleFiles(Array.from(e.target.files));
                  }}
                />
              </label>
            </div>

            {files.length > 0 && (
              <ul className="space-y-2 mt-4">
                {files.map((file, idx) => (
                  <motion.li 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-between items-center p-3 text-sm bg-black/5 border border-black/5"
                  >
                    <span className="truncate font-medium pr-4">{file.name}</span>
                    <button 
                      type="button" 
                      onClick={() => removeFile(idx)}
                      className="text-black/50 hover:text-black shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>

          <div className="pt-6 border-t border-black/5">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white px-8 py-4 font-bold uppercase tracking-[0.2em] text-xs transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Loader2 size={16} />
                  </motion.div>
                  Submitting Details...
                </>
              ) : (
                "Submit for Verification"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
