import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import Breadcrumbs from "@/components/layout/Breadcrumbs/Breadcrumbs";
import { Suspense } from "react";
import { Golos_Text } from "next/font/google";
import { Inter_Tight } from "next/font/google";
import { Manrope } from "next/font/google";
import QueryProvider from "@/components/providers/QueryProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import AdminAutoLogin from "@/components/providers/AdminAutoLogin";

export const metadata: Metadata = {
  title: "B.F.B Fitness",
  description: "Навчання, інвентар та тренування",
};

const golosText = Golos_Text({
  subsets: ["latin"],
  display: "swap",
  preload: false, // Preload тільки якщо використовується одразу
});
const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
  preload: true, // Основний шрифт - preload
});
const manrope = Manrope({
  subsets: ["cyrillic"],
  display: "swap",
  preload: false, // Preload тільки якщо використовується одразу
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="uk"
      className={`${golosText.className} ${interTight.className} ${manrope.className}`}
    >
      <body>
        <QueryProvider>
          <AuthProvider>
            <AdminAutoLogin />
            <Header />
            <Suspense fallback={null}>
              <Breadcrumbs />
            </Suspense>
            <main>{children}</main>
            <Footer />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
