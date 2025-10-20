import type { Metadata } from "next";
import Script from "next/script";
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
  metadataBase: new URL('https://ensogallery.co.il'),
  title: "SodaStream ensō® Gallery - גלריית יצירות אמנות",
  description: "גלריה דיגיטלית לייצור יצירות אמנות ייחודיות עם מכשיר SodaStream ensō® באמצעות בינה מלאכותית. צור, שתף והצבע ליצירות המדהימות ביותר.",
  keywords: "SodaStream, ensō®, יצירות אמנות, בינה מלאכותית, AI, גלריה דיגיטלית, אמנות, עיצוב, טכנולוגיה",
  authors: [{ name: "SodaStream Israel" }],
  creator: "SodaStream Israel",
  publisher: "SodaStream Israel",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: "SodaStream ensō® Gallery - גלריית יצירות אמנות",
    description: "גלריה דיגיטלית לייצור יצירות אמנות ייחודיות עם מכשיר SodaStream ensō® באמצעות בינה מלאכותית. צור, שתף והצבע ליצירות המדהימות ביותר.",
    url: 'https://ensogallery.co.il',
    siteName: "SodaStream ensō® Gallery",
    images: [
      {
        url: '/hero.jpg',
        width: 1200,
        height: 630,
        alt: 'SodaStream ensō® Gallery',
      },
    ],
    locale: 'he_IL',
    type: 'website',
  },
  twitter: {
    card: "summary_large_image",
    title: "SodaStream ensō® Gallery - גלריית יצירות אמנות",
    description: "גלריה דיגיטלית לייצור יצירות אמנות ייחודיות עם מכשיר SodaStream ensō® באמצעות בינה מלאכותית",
    images: ['/hero.jpg'],
  },
  alternates: {
    canonical: 'https://ensogallery.co.il',
  },
  verification: {
    google: 'google-site-verification-code', // להוסיף את הקוד האמיתי מ-Google Search Console
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <head>
        {/* Structured Data - JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "SodaStream ensō® Gallery",
              "alternateName": "גלריית ensō",
              "url": "https://ensogallery.co.il",
              "description": "גלריה דיגיטלית לייצור יצירות אמנות ייחודיות עם מכשיר SodaStream ensō® באמצעות בינה מלאכותית",
              "inLanguage": "he",
              "publisher": {
                "@type": "Organization",
                "name": "SodaStream Israel",
                "url": "https://sodastream.co.il"
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://ensogallery.co.il/?search={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        
        {/* Meta Pixel Code */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '465227594038012');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=465227594038012&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        {/* Google Analytics 4 - GA4 */}
        <Script
          id="ga4-setup"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                'ad_storage': 'granted',
                'ad_user_data': 'granted',
                'ad_personalization': 'granted',
                'analytics_storage': 'granted',
                'wait_for_update': 300
              });
              gtag('js', new Date());
              gtag('config', 'G-73EQMQFBRR', {
                send_page_view: false
              });
            `,
          }}
        />
        <Script
          id="ga4-library"
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-73EQMQFBRR"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${poppins.variable} ${rubik.variable} antialiased font-rubik`}
      >
        {children}
      </body>
    </html>
  );
}
