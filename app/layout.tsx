import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// 1. Standard Width Family (Main Text)
const polysans = localFont({
  src: [
    {
      path: "../public/fonts/polysanstrial-slim.otf",
      weight: "300", // Slim -> Light
      style: "normal",
    },
    {
      path: "../public/fonts/polysanstrial-neutral.otf",
      weight: "400", // Neutral -> Normal
      style: "normal",
    },
    {
      path: "../public/fonts/polysanstrial-median.otf",
      weight: "500", // Median -> Medium
      style: "normal",
    },
    {
      path: "../public/fonts/polysanstrial-bulky.otf",
      weight: "700", // Bulky -> Bold
      style: "normal",
    },
  ],
  variable: "--font-polysans",
});

// 2. Mono Family (For code or tabular data)
const polysansMono = localFont({
  src: [
    {
      path: "../public/fonts/polysanstrial-slimmono.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/polysanstrial-neutralmono.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/polysanstrial-medianmono.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/polysanstrial-bulkymono.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-polysans-mono",
});

// 3. Wide Family (For headers or display text)
const polysansWide = localFont({
  src: [
    {
      path: "../public/fonts/polysanstrial-slimwide.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/polysanstrial-neutralwide.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/polysanstrial-medianwide.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/polysanstrial-bulkywide.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-polysans-wide",
});

export const metadata: Metadata = {
  title: "SmartReport.ai - Smart Document AI for Students",
  description:
    "Create, communicate, and collaborate on documents with AI. Perfect for project reports, presentations, and school templates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${polysans.variable} ${polysansMono.variable} ${polysansWide.variable}`}
    >
      <body className={polysans.className}>{children}</body>
    </html>
  );
}