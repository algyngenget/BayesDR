"use client";

import OfflineBanner from "@/components/common/OfflineBanner";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function Providers({ children }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem={false}
    >
      <OfflineBanner />
      <main className="flex min-h-screen w-full flex-col bg-(--color-background)">
        <Navbar />
        {children}
        <Footer />
      </main>
      <Toaster position="top-right" richColors />
    </ThemeProvider>
  );
}
