"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ElectionManagementHub } from "@/features/election/components/ElectionManagementHub";

export default function ElectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const electionId = params.electionId as string;
  const currentTab = (searchParams.get("tab") || "overview") as any;

  const handleTabChange = (tab: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("tab", tab);
    router.replace(`/dashboard/org_admin/election/${electionId}?${newParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ElectionManagementHub
          electionId={electionId}
          activeTab={currentTab}
          onTabChange={handleTabChange}
          onBack={() => router.push("/dashboard/org_admin")}
        />
      </div>
    </div>
  );
}
