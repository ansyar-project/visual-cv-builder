import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import Navbar from "@/components/Navbar";
import SEOOptimizations from "@/components/SEOOptimizations";
import { GoogleAnalytics } from "@next/third-parties/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#2563eb",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  ),
  title: {
    default:
      "VisualCV Builder - Create Professional CVs Online | Free CV Maker",
    template: "%s | VisualCV Builder",
  },
  description:
    "Create stunning, ATS-friendly CVs with our free online CV builder. Choose from professional templates, customize easily, and download instantly. Build your perfect resume today!",
  keywords: [
    "CV builder",
    "resume builder",
    "free CV maker",
    "professional resume",
    "ATS friendly",
    "resume templates",
    "job application",
    "career tools",
    "online CV creator",
    "resume generator",
    "CV templates",
    "professional CV",
  ],
  authors: [{ name: "VisualCV Builder Team" }],
  creator: "VisualCV Builder",
  publisher: "VisualCV Builder",
  category: "Career Tools",
  classification: "Business",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    siteName: process.env.NEXT_PUBLIC_SITE_NAME || "VisualCV Builder",
    title: "VisualCV Builder - Create Professional CVs Online",
    description:
      "Create stunning, ATS-friendly CVs with our free online CV builder. Professional templates, easy customization, instant download.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "VisualCV Builder - Professional CV Creation Tool",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: process.env.NEXT_PUBLIC_TWITTER_HANDLE || "@visualcvbuilder",
    creator: process.env.NEXT_PUBLIC_TWITTER_HANDLE || "@visualcvbuilder",
    title: "VisualCV Builder - Create Professional CVs Online",
    description:
      "Create stunning, ATS-friendly CVs with our free online CV builder. Professional templates, easy customization, instant download.",
    images: ["/twitter-image.jpg"],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    languages: {
      "en-US": process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
      "es-ES": `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/es`,
      "fr-FR": `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/fr`,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION && {
      other: {
        "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
      },
    }),
  },
  other: {
    "msapplication-TileColor": "#2563eb",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "VisualCV Builder",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: process.env.NEXT_PUBLIC_SITE_NAME || "VisualCV Builder",
              url: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
              description:
                "Create stunning, ATS-friendly CVs with our free online CV builder. Professional templates, easy customization, instant download.",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "1250",
              },
              creator: {
                "@type": "Organization",
                name: "VisualCV Builder Team",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SEOOptimizations />
        <SessionProvider>
          <Navbar />
          <main>{children}</main>
        </SessionProvider>
        <GoogleAnalytics
          gaId={process.env.NEXT_PUBLIC_GA_ID || "G-XXXXXXXXXX"}
        />
      </body>
    </html>
  );
}
