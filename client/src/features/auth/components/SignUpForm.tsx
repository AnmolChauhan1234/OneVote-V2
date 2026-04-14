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
  const { mutate: register, isPending } = useRegister();

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
    >
      <div className="space-y-4">
        <Input
          {...form.register("full_name")}
          label="Full Name"
          placeholder="Enter your full name"
          icon={<User size={16} />}
          variant="light"
          error={errors.full_name?.message}
        />
        <Input
          type="email"
          {...form.register("email")}
          label="Email Address"
          placeholder="Enter your email"
          icon={<Mail size={16} />}
          variant="light"
          error={errors.email?.message}
        />
        <Input
          type="password"
          {...form.register("password")}
          label="Password"
          placeholder="••••••••"
          icon={<Lock size={16} />}
          variant="light"
          error={errors.password?.message}
        />
        <Input
          {...form.register("phone_number")}
          label="Phone Number"
          placeholder="Enter your phone number"
          icon={<Phone size={16} />}
          variant="light"
          error={errors.phone_number?.message}
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
