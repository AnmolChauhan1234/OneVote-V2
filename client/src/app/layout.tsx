import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

import { QueryProvider } from "@/providers/QueryProvider";
import { ToastProvider } from "@/providers/ToastProvider";

import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";

import { getMeServer } from "@/lib/ssr/auth.server";
import { queryKeys } from "@/constants/queryKeys";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OneVote",
  description: "OneVote",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();
  //  GLOBAL USER PREFETCH
  await queryClient.prefetchQuery({
    queryKey: queryKeys.auth.me,
    queryFn: getMeServer,
  });

  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <HydrationBoundary state={dehydrate(queryClient)}>
            <ToastProvider />
            {children}
          </HydrationBoundary>
        </QueryProvider>
      </body>
    </html>
  );
}
