import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import { Plus, ArrowUpRight, User } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
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
