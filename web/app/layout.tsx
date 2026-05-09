import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ResumeAI — AI resume & cover letter generator",
  description:
    "AI-tuned, ATS-ready resumes and cover letters in under 30 seconds. Multi-language, 4 polished templates, live preview.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  openGraph: {
    title: "ResumeAI — AI resume & cover letter generator",
    description: "AI-tuned, ATS-ready resumes and cover letters in 30 seconds.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeAI",
    description: "AI-tuned, ATS-ready resumes in 30 seconds.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('resumeai-theme');
                if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
