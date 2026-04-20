"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { candidateCreateSchema, CandidateCreateFormData } from "../schemas/election.schema";
import { useCreateCandidate } from "../hooks/election.hooks";
import { Input } from "@/components/ui/input";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { toast } from "sonner";
import { X, Image as ImageIcon } from "lucide-react";

interface Props {
  positionId: string;
  onCancel: () => void;
  onSuccess?: () => void;
}

export function CreateCandidateForm({ positionId, onCancel, onSuccess }: Props) {
  const { mutate: create, isPending } = useCreateCandidate(positionId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CandidateCreateFormData>({
    resolver: zodResolver(candidateCreateSchema),
    defaultValues: {
      name: "",
      biography: "",
      image_url: "",
    }
  });

  const onSubmit: SubmitHandler<CandidateCreateFormData> = (data) => {
    create(data, {
      onSuccess: () => {
        toast.success("Candidate added successfully!");
        onSuccess?.();
        onCancel();
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to add candidate");
      },
    });
  };

  return (
    <div className="bg-white border border-black p-8 shadow-2xl relative overflow-hidden group max-w-lg w-full mx-auto">
      <div className="absolute top-0 left-0 w-1 h-full bg-black" />

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-black">New Candidate</h2>
          <p className="text-[10px] uppercase tracking-widest text-black/40 mt-1 font-bold">
            Add a candidate profile for this position.
          </p>
        </div>
        <button onClick={onCancel} className="text-black/30 hover:text-black transition">
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          {...register("name")}
          label="Full Name"
          placeholder="e.g. Jane Doe"
          variant="light"
          error={errors.name?.message}
        />

        <Input
          {...register("image_url")}
          label="Image URL (Optional)"
          placeholder="https://example.com/photo.jpg"
          variant="light"
          icon={<ImageIcon size={14} />}
          error={errors.image_url?.message}
        />

        <div className="w-full">
          <label className="block text-[11px] uppercase tracking-[0.2em] font-medium mb-2 text-black/70">
            Biography (Optional)
          </label>
          <textarea
            {...register("biography")}
            className="w-full px-4 py-3 text-sm font-normal outline-none transition-all duration-200 bg-white text-black placeholder:text-black/30 border border-black/10 focus:border-black/30 h-32 resize-none"
            placeholder="A short bio to help voters get to know the candidate..."
          />
        </div>

        <div className="pt-4 flex gap-4">
          <PrimaryButton type="submit" disabled={isPending} className="flex-1">
            {isPending ? "Adding Candidate..." : "Add Candidate"}
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
