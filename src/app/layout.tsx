import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FirstStep — первый шаг к поддержке",
  description: "Анонимное AI-пространство поддержки для студентов.",
  applicationName: "FirstStep",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "FirstStep — поддержка при студенческом стрессе",
    description: "Узкий safety-first AI-чат для студентов: назвать давление и выбрать один посильный шаг.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
