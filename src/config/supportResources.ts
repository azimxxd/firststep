import type { Language } from "@/types/safety";

type LocalizedText = Record<Language, string>;

export interface SupportResource {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  contact: string;
  href: string;
  sourceHref: string;
  verified: true;
}

// Official Kazakhstan resources checked against gov.kz on 2026-07-21.
// Re-check the source links before a public pilot and at least every quarter.
export const supportResources: SupportResource[] = [
  {
    id: "emergency-112",
    title: { ru: "Единая экстренная служба", kk: "Бірыңғай шұғыл қызмет" },
    description: {
      ru: "Если есть непосредственная угроза жизни или безопасности — звони прямо сейчас.",
      kk: "Өмірге немесе қауіпсіздікке тікелей қатер болса, қазір қоңырау шал.",
    },
    contact: "112",
    href: "tel:112",
    sourceHref: "https://www.gov.kz/situations/729/1519?lang=ru",
    verified: true,
  },
  {
    id: "contact-center-111",
    title: { ru: "Контакт-центр 111", kk: "111 байланыс орталығы" },
    description: {
      ru: "Круглосуточная конфиденциальная помощь по вопросам семьи, женщин и защиты прав детей, включая психологическую поддержку.",
      kk: "Отбасы, әйелдер және балалардың құқықтарын қорғау мәселелері бойынша тәулік бойы құпия көмек, соның ішінде психологиялық қолдау.",
    },
    contact: "111",
    href: "tel:111",
    sourceHref: "https://www.gov.kz/situations/677/1457?lang=ru",
    verified: true,
  },
];
