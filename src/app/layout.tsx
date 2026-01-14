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
import { ThemeSettingsProvider } from "@/components/providers/ThemeSettingsProvider";
import AdminAutoLogin from "@/components/providers/AdminAutoLogin";
import AnchorHandler from "@/components/layout/AnchorHandler/AnchorHandler";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata: Metadata = {
  title: "B.F.B Fitness",
  description: "Навчання, інвентар та тренування",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
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
            <ThemeSettingsProvider>
              <AdminAutoLogin />
              <AnchorHandler />
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
              <Header />
              <Suspense fallback={null}>
                <Breadcrumbs />
              </Suspense>
              <main>{children}</main>
              <Footer />
            </ThemeSettingsProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
