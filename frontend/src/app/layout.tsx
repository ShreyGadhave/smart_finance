import type { Metadata } from "next";
import { IBM_Plex_Mono, Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const headingFont = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});

const bodyFont = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Smart Finance | AI-Powered Investment Intelligence",
  description:
    "Centralized platform for financial intelligence — automated news aggregation, AI sentiment analysis, portfolio optimization, risk assessment, and regulatory compliance.",
  keywords: "finance, AI, sentiment analysis, portfolio optimization, investment, risk assessment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${headingFont.variable} ${bodyFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background selection:bg-primary/20 transition-all duration-700">
          {children}
      </body>
    </html>
  );
}
