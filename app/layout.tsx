import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "zerowoosik's Blog",
  description:
    "zerowoosik의 github 기술 블로그입니다. 해당 블로그는 Antigravity를 이용하여 제작되었습니다.",
  openGraph: {
    title: "zerowoosik's Blog",
    description: "zerowoosik의 github 기술 블로그입니다. 해당 블로그는 Antigravity를 이용하여 제작되었습니다.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
