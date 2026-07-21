import Link from "next/link";
import { LegalLayout } from "@/components/LegalLayout";

export default function NotFound() {
  return (
    <LegalLayout eyebrow="404" title="Такой страницы нет" lead="Ссылка могла устареть. Вернись в FirstStep и начни с главного.">
      <section>
        <h2>Куда перейти</h2>
        <p><Link className="primary-button legal-cta" href="/">Вернуться на главную</Link></p>
      </section>
    </LegalLayout>
  );
}
