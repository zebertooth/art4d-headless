import type { Metadata } from "next";
import { DEFAULT_DESCRIPTION, getSiteUrl, OG_IMAGE, SITE_NAME } from "@/lib/seo/site";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "art4d | Architecture, Design & Art Magazine",
    template: "%s | art4d",
  },
  description: DEFAULT_DESCRIPTION.en,
  keywords: [
    "architecture",
    "design",
    "art",
    "Thailand",
    "magazine",
    "สถาปัตยกรรม",
    "การออกแบบ",
    "ศิลปะ",
  ],
  authors: [{ name: SITE_NAME, url: "https://art4d.com" }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { email: false, telephone: false },
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["th_TH"],
    siteName: SITE_NAME,
    title: "art4d | Architecture, Design & Art Magazine",
    description: DEFAULT_DESCRIPTION.en,
    images: [{ url: OG_IMAGE, width: 300, height: 300, alt: "art4d" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@art4d",
    creator: "@art4d",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
    alternates: {
      canonical: getSiteUrl(),
      languages: {
        en: getSiteUrl(),
        th: `${getSiteUrl()}/th`,
        "x-default": getSiteUrl(),
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
      <body className="min-h-screen bg-white font-body text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
