import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FirstStep — первый шаг к поддержке",
  description: "Анонимное AI-пространство поддержки для студентов.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
