import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/layout/navbar";
import { CounterStoreProvider } from "@/providers/counter-store-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider afterSignInUrl="/" afterSignUpUrl="/">
      <html lang="fr">
        <body className="bg-center bg-cover bg-no-repeat bg-fixed">
          <Navbar />
          <CounterStoreProvider>{children}</CounterStoreProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
