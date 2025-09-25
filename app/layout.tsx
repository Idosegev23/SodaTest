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
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "SodaStream Enso - ההרמוניה שבין עיצוב לטכנולוגיה פורצת דרך",
  description: "ההרמוניה שבין עיצוב לטכנולוגיה פורצת דרך - קמפיין SodaStream Enso. צור יצירות אמנות יוקרתיות עם מכשיר Enso באמצעות בינה מלאכותית מתקדמת. אתר נגיש ומינימליסטי עם אווירת גלריה יוקרתית.",
  keywords: "SodaStream, Enso, יצירות אמנות, בינה מלאכותית, AI, גלריה דיגיטלית, אמנות יוקרתית, הרמוניה, עיצוב, טכנולוגיה",
  openGraph: {
    title: "SodaStream Enso - ההרמוניה שבין עיצוב לטכנולוגיה פורצת דרך",
    description: "ההרמוניה שבין עיצוב לטכנולוגיה פורצת דרך - קמפיין SodaStream Enso. צור יצירות אמנות יוקרתיות עם מכשיר Enso באמצעות בינה מלאכותית מתקדמת",
    type: "website",
    locale: "he_IL",
  },
  twitter: {
    card: "summary_large_image",
    title: "SodaStream Enso - ההרמוניה שבין עיצוב לטכנולוגיה פורצת דרך",
    description: "ההרמוניה שבין עיצוב לטכנולוגיה פורצת דרך - צור יצירות אמנות יוקרתיות עם מכשיר SodaStream Enso",
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
