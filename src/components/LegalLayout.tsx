import type { ReactNode } from "react";
import Link from "next/link";
import { FirstStepLogo } from "@/components/FirstStepLogo";

const fallbackContactUrl = "https://github.com/azimxxd/firststep/security/advisories/new";

function getContactUrl() {
  const configuredUrl = process.env.PRIVACY_CONTACT_URL?.trim();
  if (!configuredUrl) return fallbackContactUrl;

  try {
    const url = new URL(configuredUrl);
    return url.protocol === "https:" || url.protocol === "mailto:" ? configuredUrl : fallbackContactUrl;
  } catch {
    return fallbackContactUrl;
  }
}

export function LegalLayout({ eyebrow, title, lead, children }: { eyebrow: string; title: string; lead: string; children: ReactNode }) {
  const contactUrl = getContactUrl();

  return (
    <div className="app-shell legal-shell">
      <a className="skip-link" href="#legal-content">Перейти к содержанию</a>
      <header className="topbar">
        <Link className="brand" href="/" aria-label="FirstStep home">
          <span className="brand-mark"><FirstStepLogo size={30} /></span>
          <span>FirstStep</span>
        </Link>
        <nav className="legal-nav" aria-label="Правовые документы">
          <Link href="/privacy">Конфиденциальность</Link>
          <Link href="/terms">Условия</Link>
        </nav>
      </header>
      <main id="legal-content" className="legal-page section-wrap">
        <Link className="back-link" href="/">← Вернуться в FirstStep</Link>
        <header className="legal-hero">
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{lead}</p>
        </header>
        <article className="legal-document">{children}</article>
        <footer className="legal-footer">
          <span>Обновлено 21 июля 2026 года</span>
          <a href={contactUrl}>Конфиденциальный контакт</a>
        </footer>
      </main>
    </div>
  );
}
