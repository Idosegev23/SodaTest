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
  title: "SodaStream ENSŌ - ההרמוניה שבין עיצוב לטכנולוגיה פורצת דרך",
  description: "ההרמוניה שבין עיצוב לטכנולוגיה פורצת דרך - קמפיין SodaStream ENSŌ. צור יצירות אמנות יוקרתיות עם מכשיר Enso באמצעות בינה מלאכותית מתקדמת. אתר נגיש ומינימליסטי עם אווירת גלריה יוקרתית.",
  keywords: "SodaStream, Enso, יצירות אמנות, בינה מלאכותית, AI, גלריה דיגיטלית, אמנות יוקרתית, הרמוניה, עיצוב, טכנולוגיה",
  openGraph: {
    title: "SodaStream ENSŌ - ההרמוניה שבין עיצוב לטכנולוגיה פורצת דרך",
    description: "ההרמוניה שבין עיצוב לטכנולוגיה פורצת דרך - קמפיין SodaStream ENSŌ. צור יצירות אמנות יוקרתיות עם מכשיר Enso באמצעות בינה מלאכותית מתקדמת",
    type: "website",
    locale: "he_IL",
  },
  twitter: {
    card: "summary_large_image",
    title: "SodaStream ENSŌ - ההרמוניה שבין עיצוב לטכנולוגיה פורצת דרך",
    description: "ההרמוניה שבין עיצוב לטכנולוגיה פורצת דרך - צור יצירות אמנות יוקרתיות עם מכשיר SodaStream ENSŌ",
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
