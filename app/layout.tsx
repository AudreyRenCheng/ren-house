import type { Metadata } from "next";
import SoundProvider from "@/components/SoundProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ren's House",
  description:
    "Ren Cheng's interactive house for music, stories, memories, and works in progress.",
  applicationName: "Ren's House",
  openGraph: {
    title: "Ren's House",
    description:
      "Step inside Ren Cheng's interactive house and visit the Music Room.",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <meta property="og:image" content="/music/fly-to-you-just-to-you/cover.webp" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="/music/fly-to-you-just-to-you/cover.webp" />
      </head>
      <body className="min-h-full flex flex-col">
        <SoundProvider>{children}</SoundProvider>
      </body>
    </html>
  );
}
