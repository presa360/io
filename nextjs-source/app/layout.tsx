import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Presa — Корпоративные презентации с ИИ",
  description:
    "AI-сервис для корпоративных презентаций: бриф → структура → готовый PPTX за минуты.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
