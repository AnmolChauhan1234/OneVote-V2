"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { electionUpdateSchema, ElectionUpdateFormData } from "../schemas/election.schema";
import { useUpdateElection } from "../hooks/election.hooks";
import { Input } from "@/components/ui/input";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { toast } from "sonner";
import { ElectionResponse } from "../types/types";

interface Props {
  election: ElectionResponse;
  onSuccess?: () => void;
}

export function UpdateElectionForm({ election, onSuccess }: Props) {
  const { mutate: update, isPending } = useUpdateElection(election.id);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ElectionUpdateFormData>({
    resolver: zodResolver(electionUpdateSchema),
    defaultValues: {
      title: election.title,
      description: election.description || "",
      start_date: new Date(election.start_date).toISOString().slice(0, 16),
      end_date: new Date(election.end_date).toISOString().slice(0, 16),
      status: election.status as any,
    },
  });

  const onSubmit = (data: ElectionUpdateFormData) => {
    update(data, {
      onSuccess: () => {
        toast.success("Election updated successfully!");
        onSuccess?.();
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to update election");
      },
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border border-black/5 p-6 md:p-10 shadow-sm relative group overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-700" />

      <div className="mb-10 relative z-10">
        <h2 className="text-3xl font-bold tracking-tighter text-black uppercase italic">Election Settings</h2>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 mt-2">
          Management & Configuration
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 relative z-10">
        <div className="grid grid-cols-1 gap-8">
          <Input
            {...register("title")}
            label="Election Title"
            placeholder="e.g. Student Council 2024"
            variant="light"
            error={errors.title?.message}
            className="w-full"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-black/40">
              Description
            </label>
            <textarea
              {...register("description")}
              className="w-full px-4 py-4 text-sm font-medium outline-none transition-all duration-300 bg-white text-black border border-black/10 focus:border-black h-32 resize-none"
              placeholder="Provide context for the voters..."
            />
            {errors.description && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-black/40">
              Election Status
            </label>
            <select
              {...register("status")}
              className="w-full px-4 py-4 text-sm font-bold outline-none transition-all duration-300 bg-white text-black border border-black/10 focus:border-black appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23000\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}
            >
              <option value="UPCOMING">UPCOMING</option>
              <option value="ONGOING">ONGOING</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
            {errors.status && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{errors.status.message}</p>}
          </div>
        </div>

        <div className="pt-6">
          <PrimaryButton
            type="submit"
            disabled={isPending}
            className="w-full py-6 text-sm font-black tracking-[0.3em]"
          >
            {isPending ? "Configuring Ledger..." : "Update Election Manifest"}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
