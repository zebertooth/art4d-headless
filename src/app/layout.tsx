import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "art4d — Architecture & Design Magazine",
    template: "%s | art4d",
  },
  description:
    "Architecture, design and art magazine from Thailand. ARCHITECTURE | DESIGN | ART",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
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
