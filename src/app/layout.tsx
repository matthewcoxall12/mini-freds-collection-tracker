import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { TopNav } from "@/components/layout/TopNav";
import { CollectionProvider } from "@/context/CollectionContext";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
  description: APP_TAGLINE,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <CollectionProvider>
            <TopNav />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-16">{children}</main>
            <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
              <p>{APP_NAME} &middot; {APP_TAGLINE}</p>
            </footer>
          </CollectionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
