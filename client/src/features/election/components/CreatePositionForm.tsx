"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { positionCreateSchema, PositionCreateFormData } from "../schemas/election.schema";
import { useCreatePosition } from "../hooks/election.hooks";
import { Input } from "@/components/ui/input";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { toast } from "sonner";
import { X } from "lucide-react";

interface Props {
  electionId: string;
  onCancel: () => void;
  onSuccess?: () => void;
}

export function CreatePositionForm({ electionId, onCancel, onSuccess }: Props) {
  const { mutate: create, isPending } = useCreatePosition(electionId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PositionCreateFormData>({
    resolver: zodResolver(positionCreateSchema),
    defaultValues: {
      max_candidates_selectable: 1,
    },
  });

  const onSubmit = (data: PositionCreateFormData) => {
    create(data, {
      onSuccess: () => {
        toast.success("Position added successfully!");
        onSuccess?.();
        onCancel();
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to add position");
      },
    });
  };

  return (
    <div className="bg-white border border-black p-8 shadow-2xl relative overflow-hidden group max-w-lg w-full mx-auto">
      <div className="absolute top-0 left-0 w-1 h-full bg-black" />

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-black">Add Position</h2>
          <p className="text-[10px] uppercase tracking-widest text-black/40 mt-1 font-bold">
            Define a role for this election (e.g., President).
          </p>
        </div>
        <button onClick={onCancel} className="text-black/30 hover:text-black transition">
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          {...register("name")}
          label="Position Name"
          placeholder="e.g. Student Council President"
          variant="light"
          error={errors.name?.message}
        />

        <Input
          {...register("max_candidates_selectable", { valueAsNumber: true })}
          label="Max Selections"
          type="number"
          min={1}
          variant="light"
          error={errors.max_candidates_selectable?.message}
          placeholder="How many candidates can a voter pick?"
        />

        <div className="w-full">
          <label className="block text-[11px] uppercase tracking-[0.2em] font-medium mb-2 text-black/70">
            Description (Optional)
          </label>
          <textarea
            {...register("description")}
            className="w-full px-4 py-3 text-sm font-normal outline-none transition-all duration-200 bg-white text-black placeholder:text-black/30 border border-black/10 focus:border-black/30 h-24 resize-none"
            placeholder="Briefly describe the responsibilities of this role..."
          />
        </div>

        <div className="pt-4 flex gap-4">
          <PrimaryButton type="submit" disabled={isPending} className="flex-1">
            {isPending ? "Adding..." : "Add Position"}
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
