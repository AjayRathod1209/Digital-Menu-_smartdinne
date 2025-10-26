import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartDine - Digital Menu System",
  description: "Modern digital menu and ordering system for restaurants, cafés, and food outlets. QR code access, real-time order tracking, and comprehensive admin dashboard.",
  keywords: ["SmartDine", "Digital Menu", "Restaurant", "QR Code", "Ordering System", "Next.js", "TypeScript", "Tailwind CSS"],
  authors: [{ name: "SmartDine Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "SmartDine - Digital Menu System",
    description: "Modern digital menu and ordering system for restaurants",
    url: "https://smartdine.example.com",
    siteName: "SmartDine",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartDine - Digital Menu System",
    description: "Modern digital menu and ordering system for restaurants",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
