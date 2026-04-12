import { redirect } from "next/navigation";
import { getMeServer } from "@/lib/ssr/auth.server";
import BottomHeader from "@/components/ui/Header";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getMeServer();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <BottomHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
