import type { Metadata } from "next";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "./providers";
import { MetaPixelInit } from "@/components/MetaPixelInit";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-pretendard",
  display: "swap",
});

const notoSerifKR = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "한권의나 | 나만의 자서전 제작",
  description:
    "음성 녹음으로 쉽게 만드는 나만의 자서전. AI가 당신의 이야기를 아름다운 책으로 만들어드립니다.",
  keywords: ["자서전", "자서전 제작", "AI 자서전", "음성 녹음", "회고록", "인생 이야기"],
  authors: [{ name: "한권의나" }],
  openGraph: {
    title: "한권의나 | 나만의 자서전 제작",
    description: "음성 녹음으로 쉽게 만드는 나만의 자서전",
    url: "https://www.1book1me.com",
    siteName: "한권의나",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "한권의나 | 나만의 자서전 제작",
    description: "음성 녹음으로 쉽게 만드는 나만의 자서전",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${notoSansKR.variable} ${notoSerifKR.variable} font-sans antialiased`}
      >
        <Providers>
          <MetaPixelInit />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
