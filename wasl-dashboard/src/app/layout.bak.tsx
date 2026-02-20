import type { Metadata } from "next";
import { Cairo } from "next/font/google"; // Using Cairo as requested
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Sidebar } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";

const cairo = Cairo({ subsets: ["arabic", "latin"] });

export const metadata: Metadata = {
  title: "Wasl Dashboard",
  description: "Real Estate Management Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={cn(cairo.className, "bg-gray-50/50")}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 lg:mr-[280px] p-8 w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
