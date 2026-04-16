import type { Metadata } from "next";
import "./globals.css";
import { PrivacyBanner } from "@/components/PrivacyBanner";
import { RoleBadge } from "@/components/RoleBadge";

export const metadata: Metadata = {
  title: "NexGenKlick Gamification",
  description: "Celebrate student achievements and watch them grow!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">
        {children}
        <RoleBadge />
        <PrivacyBanner />
      </body>
    </html>
  );
}
