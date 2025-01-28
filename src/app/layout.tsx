import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";
import ReferralWrapper from "@/wrappers/ReferralWrapper";
import { CookiesProvider } from "next-client-cookies/server";
import AppCheckWrapper from "@/wrappers/AppCheckWrapper";

const poppinsExtraBold = Poppins({
  variable: "--font-poppins",
  weight: "900",
  subsets: ["latin"],
});

const poppinsBold = Poppins({
  variable: "--font-poppins",
  weight: "700",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tirigist Comrades",
  description: "A place with everything you need as a comrade",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppinsBold.variable} ${poppinsExtraBold.variable} ${inter.variable} antialiased bg-background-200`}
      >
        <Toaster />
        <AppCheckWrapper/>
        <Navbar />
        <main className="pb-20 md:pb-0">{children}</main>
        <CookiesProvider>
          <ReferralWrapper />
        </CookiesProvider>
      </body>
    </html>
  );
}
