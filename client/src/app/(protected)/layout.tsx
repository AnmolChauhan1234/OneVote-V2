import { redirect } from "next/navigation";
import { getMeServer } from "@/lib/ssr/auth.server";
import BottomHeader from "@/components/ui/Header";

import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();

  try {
    // Prefetch user on server
    const user = await queryClient.fetchQuery({
      queryKey: queryKeys.auth.me,
      queryFn: getMeServer,
    });

    if (!user) {
      redirect("/login");
    }
  } catch {
    redirect("/login");
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex min-h-screen flex-col">
        <BottomHeader />
        <main className="flex-1">{children}</main>
      </div>
    </HydrationBoundary>
  );
}
