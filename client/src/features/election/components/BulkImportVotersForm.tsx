"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAddVoters } from "../hooks/election.hooks";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { toast } from "sonner";
import { X, Upload, FileType, CheckCircle2, AlertCircle } from "lucide-react";
import axiosClient from "@/lib/instances/axios";
import { API_URLS } from "@/constants/apiURLs";

interface Props {
  electionId: string;
  onCancel: () => void;
  onSuccess?: () => void;
}

export function BulkImportVotersForm({ electionId, onCancel, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [identifierColumn, setIdentifierColumn] = useState("email");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a CSV file");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("identifier_column", identifierColumn);

    try {
      // Using direct axios call for multipart/form-data
      const res = await axiosClient.post(
        API_URLS.ELECTION.ADD_VOTERS(electionId),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(`Successfully processed ${res.data.total_processed} voters!`);
      onSuccess?.();
      onCancel();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to upload voters");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white border border-black p-8 shadow-2xl relative overflow-hidden group max-w-lg w-full mx-auto">
      <div className="absolute top-0 left-0 w-1 h-full bg-black" />
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-black">Bulk Import Voters</h2>
          <p className="text-[10px] uppercase tracking-widest text-black/40 mt-1 font-bold">
            Upload a CSV file containing your eligible voters.
          </p>
        </div>
        <button onClick={onCancel} className="text-black/30 hover:text-black transition">
            <X size={18} />
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Upload Area */}
        <div 
          className={`border-2 border-dashed p-10 text-center transition-all ${
            file ? 'border-black bg-black/5' : 'border-black/10 hover:border-black/30'
          }`}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer space-y-4 block">
            <div className="mx-auto w-12 h-12 bg-black flex items-center justify-center text-white rounded-none">
                {file ? <CheckCircle2 size={24} /> : <Upload size={24} />}
            </div>
            <div>
                <p className="text-sm font-bold">{file ? file.name : "Select CSV File"}</p>
                <p className="text-[10px] uppercase tracking-widest text-black/40 mt-1">
                    {file ? `${(file.size / 1024).toFixed(2)} KB` : "Drag and drop or click to browse"}
                </p>
            </div>
          </label>
        </div>

        {/* Configuration */}
        <div className="space-y-4">
            <label className="block text-[11px] uppercase tracking-[0.2em] font-medium text-black/70">
                Identifier Column Name
            </label>
            <input
                type="text"
                value={identifierColumn}
                onChange={(e) => setIdentifierColumn(e.target.value)}
                className="w-full px-4 py-3 text-sm font-normal outline-none transition-all duration-200 bg-white text-black placeholder:text-black/30 border border-black/10 focus:border-black/30"
                placeholder="e.g. email, student_id"
            />
            <div className="flex items-start gap-2 p-3 bg-black/5">
                <AlertCircle size={14} className="mt-0.5 text-black/40" />
                <p className="text-[10px] text-black/60 leading-normal">
                    The identifier column must contain unique values for each voter. These will be used to verify eligibility.
                </p>
            </div>
        </div>

        <div className="pt-4 flex gap-4">
          <PrimaryButton type="submit" disabled={isUploading || !file} className="flex-1">
            {isUploading ? "Uploading..." : "Start Import"}
          </PrimaryButton>
           <button 
            type="button" 
            onClick={onCancel}
            className="px-6 py-3 text-[10px] uppercase font-bold tracking-[0.2em] border border-black/5 hover:bg-black/5 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
