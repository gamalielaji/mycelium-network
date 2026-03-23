import type { Metadata } from "next";
import { SolanaProviders } from "@/components/wallet/wallet-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { QueryProvider } from "@/components/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mycelium Protocol — Decentralized IP Infrastructure",
  description:
    "Register, license, and protect intellectual property on Solana. Court-admissible proof for < $0.01.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col">
        <QueryProvider>
          <SolanaProviders>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </SolanaProviders>
        </QueryProvider>
      </body>
    </html>
  );
}
