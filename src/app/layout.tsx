import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Nexset | Property Management Operations",
  description: "Less admin, more doors. AI-powered leasing, reporting, and acquisition for independent PMs.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={outfit.className}>
      <body className="min-h-[100dvh]">
        {children}
        <script
          src="https://widgets.leadconnectorhq.com/loader.js"
          data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js"
          data-widget-id="69dccfc2d69ee87e9ecd0333"
          async
        />
      </body>
    </html>
  );
}
