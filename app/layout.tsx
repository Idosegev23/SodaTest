import type { Metadata } from "next";
import { Poppins, Rubik } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SodaStream ensō® Gallery - גלריית יצירות אמנות",
  description: "גלריה דיגיטלית לייצור יצירות אמנות ייחודיות עם מכשיר SodaStream ensō® באמצעות בינה מלאכותית. צור, שתף והצבע ליצירות המדהימות ביותר.",
  keywords: "SodaStream, ensō®, יצירות אמנות, בינה מלאכותית, AI, גלריה דיגיטלית, אמנות, עיצוב, טכנולוגיה",
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: "SodaStream ensō® Gallery",
    description: "גלריה דיגיטלית לייצור יצירות אמנות ייחודיות עם מכשיר SodaStream ensō® באמצעות בינה מלאכותית",
    type: "website",
    locale: "he_IL",
  },
  twitter: {
    card: "summary_large_image",
    title: "SodaStream ensō® Gallery",
    description: "גלריה דיגיטלית לייצור יצירות אמנות ייחודיות עם מכשיר SodaStream ensō® באמצעות בינה מלאכותית",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body
        className={`${poppins.variable} ${rubik.variable} antialiased font-rubik`}
      >
        {children}
      </body>
    </html>
  );
}
