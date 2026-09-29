import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { SavedProvider } from "@/context/SavedContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://opportunity-x-ai.vercel.app"),
  title: {
    default: "OpportunityX-AI | Scholarship & Government Opportunity Finder",
    template: "%s | OpportunityX-AI",
  },
  description:
    "Discover verified scholarships, government welfare schemes, fellowships, and benefits across all life stages from newborns to senior citizens.",
  keywords: [
    "scholarships",
    "government schemes",
    "NSP",
    "AICTE Pragati",
    "fellowships",
    "student grants",
    "welfare benefits",
    "India",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "OpportunityX-AI | Scholarship & Government Opportunity Finder",
    description:
      "Discover verified scholarships, government welfare schemes, fellowships, and benefits across all life stages from newborns to senior citizens.",
    url: "https://opportunity-x-ai.vercel.app",
    siteName: "OpportunityX-AI",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpportunityX-AI | Scholarship & Government Opportunity Finder",
    description:
      "Discover verified scholarships, government welfare schemes, fellowships, and benefits across all life stages from newborns to senior citizens.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased`}>
        <AuthProvider>
          <SavedProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </SavedProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
