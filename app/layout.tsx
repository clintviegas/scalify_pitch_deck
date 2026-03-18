import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { PostHogProvider } from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Scalify — Pitch Deck 2026",
  description: "Expand Your Business, Not Your Office. UAE's #1 end-to-end growth partner.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Scalify — Pitch Deck 2026",
    description: "Expand Your Business, Not Your Office.",
    url: "https://scalify.ae",
    siteName: "Scalify",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <Script
          id="clarity-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","vv35sn59q2");`,
          }}
        />
      </head>
      <body className="bg-[#0a0a0a] antialiased font-[family-name:var(--font-inter)]">
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
