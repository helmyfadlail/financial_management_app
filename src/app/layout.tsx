import { AuthProvider, QueryProvider } from "@/providers";

import { Space_Grotesk } from "next/font/google";

import "./globals.css";

import type { Metadata } from "next";
import { ToastProvider } from "@/components";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Finance Tracker App",
  description:
    "Stay on top of your income, expenses, and budgets with a simple financial management app. Easily monitor transactions, organize your finances, and export data for better money control.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.className} antialiased`}>
        <QueryProvider>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
