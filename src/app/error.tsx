"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="center-page">
      <section className="onboarding-card error-card" role="alert">
        <span className="eyebrow">FIRSTSTEP</span>
        <h1>Не удалось открыть эту часть сервиса</h1>
        <p>Разговор не был отправлен. Попробуй восстановить экран или вернись на главную.</p>
        <div className="error-actions">
          <button className="primary-button" onClick={reset}>Попробовать снова</button>
          <Link className="text-button" href="/">На главную</Link>
        </div>
      </section>
    </div>
  );
}
