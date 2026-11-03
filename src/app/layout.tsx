import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Astha Bisht | Frontend Developer",
    template: "%s | Astha Bisht",
  },
  description:
    "Explore Astha Bisht's frontend development portfolio, selected projects, technical skills, experience and certificates.",
  applicationName: "Astha Bisht Portfolio",
  authors: [{ name: "Astha Bisht" }],
  creator: "Astha Bisht",
  keywords: [
    "Astha Bisht",
    "Frontend Developer",
    "Web Developer",
    "React",
    "JavaScript",
    "Next.js",
    "Portfolio",
  ],
  openGraph: {
    type: "website",
    title: "Astha Bisht | Frontend Developer",
    description:
      "Selected projects, skills and experiences in frontend and web development.",
    siteName: "Astha Bisht Portfolio",
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
    title: "Astha Bisht | Frontend Developer",
    description:
      "Selected projects, skills and experiences in frontend and web development.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${playfair.variable}`}>
        {children}
      </body>
    </html>
  );
}