import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "AegisScan — Web Application Security Monitoring & Assessment",
  description:
    "Defensive web application security posture assessment, real-time telemetry monitoring, and SOC incident investigation platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark } as any}>
      <html lang="en" className="dark">
        <body className="bg-[#020617] text-slate-100 antialiased min-h-screen">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
