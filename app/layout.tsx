import type { Metadata } from "next";
import { Heebo, Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "יוצר יצירות אומנות",
  description: "פלטפורמה לייצור יצירות אומנות ייחודיות עם בינה מלאכותית",
  openGraph: {
    title: "יוצר יצירות אומנות",
    description: "פלטפורמה לייצור יצירות אומנות ייחודיות עם בינה מלאכותית",
    type: "website",
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
        className={`${heebo.variable} ${playfair.variable} ${inter.variable} antialiased font-heebo`}
      >
        {children}
      </body>
    </html>
  );
}
