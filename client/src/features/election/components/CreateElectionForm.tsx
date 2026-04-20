"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { electionCreateSchema, ElectionCreateFormData } from "../schemas/election.schema";
import { useCreateElection } from "../hooks/election.hooks";
import { Input } from "@/components/ui/input";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { toast } from "sonner";
import { X } from "lucide-react";

interface Props {
  orgId: string;
  onCancel: () => void;
  onSuccess?: () => void;
}

export function CreateElectionForm({ orgId, onCancel, onSuccess }: Props) {
  const { mutate: create, isPending } = useCreateElection();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ElectionCreateFormData>({
    resolver: zodResolver(electionCreateSchema),
    defaultValues: {
      org_id: orgId,
    },
  });

  const onSubmit = (data: ElectionCreateFormData) => {
    create(data, {
      onSuccess: () => {
        toast.success("Election created successfully!");
        onSuccess?.();
        onCancel();
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to create election");
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border border-black/5 p-8 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-black transition-all duration-300 group-hover:w-2" />
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-black">Launch Election</h2>
          <p className="text-xs uppercase tracking-widest text-black/40 mt-1 font-bold">
            Fill in the details to launch your custom election instance.
          </p>
        </div>
        <button onClick={onCancel} className="text-black/30 hover:text-black transition p-2 hover:bg-black/5 rounded-full">
            <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          {...register("title")}
          label="Election Title"
          placeholder="e.g. Student Council 2024"
          variant="light"
          error={errors.title?.message}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Input
            {...register("start_date")}
            label="Start Date & Time"
            type="datetime-local"
            variant="light"
            error={errors.start_date?.message}
          />
           <Input
            {...register("end_date")}
            label="End Date & Time"
            type="datetime-local"
            variant="light"
            error={errors.end_date?.message}
          />
        </div>

        <div className="w-full">
            <label className="block text-[11px] uppercase tracking-[0.2em] font-medium mb-2 text-black/70">
                Description (Optional)
            </label>
            <textarea
                {...register("description")}
                className="w-full px-4 py-3 text-sm font-normal outline-none transition-all duration-200 bg-white text-black placeholder:text-black/30 border border-black/10 focus:border-black/30 h-32 resize-none"
                placeholder="Give voters more context about this election..."
            />
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-4">
          <PrimaryButton type="submit" disabled={isPending} className="flex-1 order-1 sm:order-2">
            {isPending ? "Creating..." : "Initialize Election"}
          </PrimaryButton>
          <button 
            type="button" 
            onClick={onCancel}
            className="px-8 py-3 text-[11px] uppercase font-bold tracking-[0.2em] border border-black/5 hover:bg-black/5 transition order-2 sm:order-1"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
