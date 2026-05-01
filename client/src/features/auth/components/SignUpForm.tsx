"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Lock, Phone } from "lucide-react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { useRegister } from "../hooks/auth.hooks";
import { registerSchema, RegisterFormData } from "../schemas/user.schema";

export default function SignUpForm({
  onSuccess,
}: {
  onSuccess?: (userId: string) => void;
}) {
  const { mutate: register, isPending, error } = useRegister();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      user_type: "voter",
    },
  });

  const {
    formState: { errors },
  } = form;

  const onSubmit = (data: RegisterFormData) => {
    register(data, {
      onSuccess: (data) => {
        onSuccess?.(data.user_id);
      },
    });
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6 w-full max-w-sm"
      autoComplete="off"
    >
      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-sm">
          <p className="text-xs text-red-600 font-medium">
            {error.message}
          </p>
        </div>
      )}
      <div className="space-y-4">
        <Input
          {...form.register("full_name")}
          label="Full Name"
          placeholder="Enter your full name"
          icon={<User size={16} />}
          variant="light"
          error={errors.full_name?.message}
          autoComplete="off"
        />
        <Input
          type="email"
          {...form.register("email")}
          label="Email Address"
          placeholder="Enter your email"
          icon={<Mail size={16} />}
          variant="light"
          error={errors.email?.message}
          autoComplete="off"
        />
        <Input
          type="password"
          {...form.register("password")}
          label="Password"
          placeholder="••••••••"
          icon={<Lock size={16} />}
          variant="light"
          error={errors.password?.message}
          autoComplete="new-password"
        />
        <Input
          {...form.register("phone_number")}
          label="Phone Number"
          placeholder="Enter your phone number"
          icon={<Phone size={16} />}
          variant="light"
          error={errors.phone_number?.message}
          autoComplete="off"
        />
      </div>

      <PrimaryButton type="submit" className="w-full mt-2" disabled={isPending}>
        {isPending ? "Creating Account..." : "Continue"}
      </PrimaryButton>

      <p className="text-center text-[10px] uppercase tracking-[0.2em] text-black/50">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-black font-semibold hover:underline"
        >
          Sign In
        </Link>
      </p>
    </form>
  );
}
