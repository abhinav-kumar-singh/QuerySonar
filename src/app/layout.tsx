import type { Metadata } from "next";
import "./globals.css";
import "./landing.css";
import "./dashboard/synetica-dashboard.css";
import { Header } from "@/components/layout/header";
import { SessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthModalProvider } from "@/components/auth/auth-modal-context";
import { LanguageProvider } from "@/lib/i18n/language-context";

export const metadata: Metadata = {
  title: "QuerySonar — AI Search & Brand Visibility Tracker",
  description:
    "Monitor what ChatGPT, Perplexity, and Gemini say about your brand. Track your AI Share of Voice and get actionable fixes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="live"
      suppressHydrationWarning
      className="h-full antialiased font-sans"
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('querysonar_theme')||localStorage.getItem('georadar_theme');document.documentElement.dataset.theme=(t==='light'||t==='system'||t==='live')?t:'live'}catch(e){};try{var l=localStorage.getItem('querysonar_language')||localStorage.getItem('georadar_language');if(l){document.documentElement.lang=l}}catch(e){}" }} />
        <ThemeProvider>
          <LanguageProvider>
            <SessionProvider>
              <AuthModalProvider>
                <Header />
                <main className="flex-1 flex flex-col">{children}</main>
              </AuthModalProvider>
            </SessionProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
