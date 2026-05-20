import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import { wagmiAdapter } from "@/lib/wagmi";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BPLAY Partner Portal",
  description: "Manage your BPLAY partner commissions, referrals, and payouts",
  metadataBase: new URL("https://bplay.tech"),
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon", type: "image/png", sizes: "512x512" },
      { url: "/favicon.ico", sizes: "48x48" },
    ],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "BPLAY Partner Portal",
    description: "Manage your BPLAY partner commissions, referrals, and payouts",
    url: "https://bplay.tech",
    siteName: "BPLAY",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "BPLAY Partner Portal" }],
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookie = (await headers()).get("cookie");
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig, cookie);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers initialState={initialState}>{children}</Providers>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
