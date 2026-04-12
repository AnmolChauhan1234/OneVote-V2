"use client";

import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import {
  Plus,
  ArrowUpRight,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import BottomHeader from "@/components/ui/Header";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const handleSignUp = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    alert("Account created successfully!");
  };

  const handleLogin = async () => {
    setIsLoginLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoginLoading(false);
    alert("Logged in successfully!");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <BottomHeader />

      {/* SMALL LABEL */}
      <p className="text-xs uppercase tracking-[0.3em] text-muted mb-6">
        ◆ ABOUT ONE VOTE
      </p>

      {/* HERO TEXT */}
      <h1 className="max-w-4xl text-[clamp(2.5rem,5vw,4rem)] leading-tight font-medium tracking-[-0.02em]">
        We bring secure digital voting to life through precision, simplicity,
        and trust.
      </h1>

      {/* BUTTON SECTION */}
      <div className="mt-12 flex gap-4 flex-wrap justify-center">
        {/* 🔥 PRIMARY (ICON + ANIMATION) */}
        <PrimaryButton variant="dark">WHO WE ARE</PrimaryButton>
        {/* 🔥 PRIMARY (LIGHT VERSION) */}
        <PrimaryButton variant="light">OUR MISSION</PrimaryButton>
        {/* PROTOTYPE: PRIMARY WITH START ICON */}
        <PrimaryButton variant="dark" startIcon={<User size={14} />}>
          PROFILE
        </PrimaryButton>
        {/* PROTOTYPE: PRIMARY WITH END ICON */}
        <PrimaryButton variant="light">EXPLORE</PrimaryButton>
        {/* PROTOTYPE: PRIMARY WITH BOTH ICONS */}
        <PrimaryButton variant="dark" startIcon={<Plus size={14} />}>
          CREATE NEW
        </PrimaryButton>
        {/* ⚪ SECONDARY (INVERT HOVER) */}
        <SecondaryButton variant="light">ADDITIONAL</SecondaryButton>
        {/* ⚫ SECONDARY DARK VERSION */}
        <SecondaryButton variant="dark">CONTACT</SecondaryButton>
      </div>

      {/* INPUT SAMPLES SECTION */}
      <div className="mt-16 w-full max-w-md space-y-6">
        <p className="text-xs uppercase tracking-[0.3em] text-muted mb-4">
          ◆ INPUT SAMPLES
        </p>

        {/* Basic Inputs */}
        <div className="space-y-4">
          <Input variant="dark" placeholder="Enter your email" />
          <Input variant="light" placeholder="Enter your email" />
        </div>

        {/* Inputs with icons */}
        <div className="space-y-4">
          <Input
            variant="dark"
            label="Email Address"
            icon={<Mail size={14} />}
            placeholder="user@example.com"
          />
          <Input
            variant="light"
            label="Username"
            icon={<User size={14} />}
            placeholder="johndoe"
          />
        </div>

        {/* Password Input */}
        <Input
          variant="dark"
          label="Password"
          icon={<Lock size={14} />}
          type="password"
          placeholder="Enter your password"
        />

        {/* Input with error */}
        <Input
          variant="light"
          label="Confirm Password"
          error="Passwords do not match"
          type="password"
          placeholder="Confirm your password"
        />
      </div>

      {/* LOGIN FORM EXAMPLE */}
      <div className="mt-16 w-full max-w-md">
        <p className="text-xs uppercase tracking-[0.3em] text-muted mb-6">
          ◆ LOGIN FORM EXAMPLE
        </p>

        <form
          className="space-y-4 text-left"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <Input
            variant="dark"
            label="Email"
            icon={<Mail size={14} />}
            type="email"
            placeholder="hello@example.com"
            defaultValue="hello@example.com"
          />

          <Input
            variant="dark"
            label="Password"
            icon={<Lock size={14} />}
            type="password"
            placeholder="••••••••"
            defaultValue="password123"
          />

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-xs text-white/60">
              <input
                type="checkbox"
                className="rounded border-white/20 bg-black text-black"
              />
              Remember me
            </label>
            <button
              type="button"
              className="text-xs text-white/60 hover:text-white transition-colors uppercase tracking-[0.15em]"
            >
              Forgot password?
            </button>
          </div>

          <PrimaryButton
            variant="dark"
            className="w-full flex items-center justify-center"
            disabled={isLoginLoading}
          >
            {isLoginLoading ? "SIGNING IN..." : "SIGN IN"}
          </PrimaryButton>

          <p className="text-center text-xs text-white/50 mt-4">
            Don't have an account?{" "}
            <button type="button" className="text-white hover:underline">
              Sign up
            </button>
          </p>
        </form>
      </div>

      {/* REGISTER FORM EXAMPLE WITH LOADING STATE */}
      <div className="mt-16 w-full max-w-md">
        <p className="text-xs uppercase tracking-[0.3em] text-muted mb-6">
          ◆ REGISTER FORM EXAMPLE
        </p>

        <form
          className="space-y-4 text-left"
          onSubmit={(e) => {
            e.preventDefault();
            handleSignUp();
          }}
        >
          <Input
            variant="light"
            label="Full Name"
            icon={<User size={14} />}
            placeholder="John Doe"
          />

          <Input
            variant="light"
            label="Email Address"
            icon={<Mail size={14} />}
            type="email"
            placeholder="john@example.com"
          />

          <Input
            variant="light"
            label="Password"
            icon={<Lock size={14} />}
            type="password"
            placeholder="Create a password"
          />

          <Input
            variant="light"
            label="Confirm Password"
            icon={<Lock size={14} />}
            type="password"
            placeholder="Confirm your password"
          />

          <PrimaryButton
            variant="light"
            className="w-full flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? "CREATING ACCOUNT..." : "SIGN UP"}
          </PrimaryButton>
        </form>
      </div>

      {/* BOTTOM BAR */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-xl border-t border-neutral-200 pt-4 flex items-center justify-between text-sm">
        <span className="uppercase tracking-[0.2em] text-muted">
          ◆ PRODUCT COLLECTION
        </span>

        <div className="flex items-center gap-6">
          <span className="uppercase tracking-[0.2em]">HOME</span>
          <div className="w-5 h-[1px] bg-black" />
          <div className="w-5 h-[1px] bg-black" />
        </div>
      </div>
    </main>
  );
}
