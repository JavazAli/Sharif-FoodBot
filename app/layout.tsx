import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    metadataBase: new URL(origin),
    title: {
      default: "لقمه | انتخاب‌گر هوشمند غذای شریف",
      template: "%s | لقمه",
    },
    description:
      "پروفایل سلیقه و انتخاب‌گر سریع غذای دانشگاه صنعتی شریف؛ با قوانین شفاف و بدون ذخیرهٔ رمز دانشگاه.",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "لقمه | انتخاب‌گر هوشمند غذای شریف",
      description: "سلیقه‌ات را یاد می‌گیرد و بهترین غذای هر روز را آماده می‌گذارد.",
      locale: "fa_IR",
      type: "website",
      images: [{ url: `${origin}/og.png`, width: 1730, height: 909, alt: "لقمه، انتخاب‌گر هوشمند غذای شریف" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "لقمه | انتخاب‌گر هوشمند غذای شریف",
      description: "انتخاب بهتر غذای دانشگاه، بر اساس سلیقه و قوانین تو.",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
