import { AuthProvider, QueryProvider } from "@/providers";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ToastProvider, CurrencyProvider } from "@/components";

const spaceGrotesk = localFont({
  src: [
    { path: "../../public/fonts/SpaceGrotesk-Light.ttf", weight: "300" },
    { path: "../../public/fonts/SpaceGrotesk-Regular.ttf", weight: "400" },
    { path: "../../public/fonts/SpaceGrotesk-Medium.ttf", weight: "500" },
    { path: "../../public/fonts/SpaceGrotesk-SemiBold.ttf", weight: "600" },
    { path: "../../public/fonts/SpaceGrotesk-Bold.ttf", weight: "700" },
  ],
  variable: "--font-space-grotesk",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Finance Tracker App",
  description:
    "Stay on top of your income, expenses, and budgets with a simple financial management app. " + "Easily monitor transactions, organize your finances, and export data for better money control.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.className} antialiased`}>
        <QueryProvider>
          <AuthProvider>
            <ToastProvider>
              <CurrencyProvider>{children}</CurrencyProvider>
            </ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
