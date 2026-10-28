import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "devs APK Builder - Web, ZIP & PWA to Android APK",
  description: "Turn web content into real, signed, installable Android APKs directly from your Android phone browser.",
  icons: {
    icon: "/images/app-logo-3d.png",
    apple: "/images/app-logo-3d.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-500 selection:text-white dark:bg-slate-950 dark:text-slate-100 font-sans transition-colors">
        {children}
      </body>
    </html>
  );
}
