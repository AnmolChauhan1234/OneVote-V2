"use client";

import { VotingBooth } from "@/features/voting/components/VotingBooth";
import { useParams } from "next/navigation";

export default function VotePage() {
  const params = useParams();
  const election_id = params.election_id as string;

  return <VotingBooth electionId={election_id} />;
}
