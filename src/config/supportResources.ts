import type { Language } from "@/types/safety";

type LocalizedText = Record<Language, string>;

export interface SupportResource {
  id: string;
  kind: "talk" | "protection" | "emergency";
  category: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
  availability: LocalizedText;
  contact: string;
  href: string;
  secondaryContact?: {
    label: string;
    contact: string;
    href: string;
  };
  sourceHref: string;
  verified: true;
}

// Official Kazakhstan resources checked against gov.kz on 2026-07-21.
// Re-check the source links before a public pilot and at least every quarter.
export const supportResources: SupportResource[] = [
  {
    id: "children-150",
    kind: "talk",
    category: { ru: "Хочу поговорить", kk: "Сөйлескім келеді" },
    title: {
      ru: "Линия доверия для детей и молодёжи",
      kk: "Балалар мен жастарға арналған сенім желісі",
    },
    description: {
      ru: "Можно обратиться, если тяжело, страшно, одиноко или ты столкнулся с насилием. Не нужно заранее подбирать правильные слова.",
      kk: "Қиналсаң, қорықсаң, жалғыздық сезінсең немесе зорлыққа тап болсаң, хабарласуға болады. Алдын ала дұрыс сөз іздеудің қажеті жоқ.",
    },
    availability: { ru: "бесплатно · круглосуточно", kk: "тегін · тәулік бойы" },
    contact: "150",
    href: "tel:150",
    secondaryContact: {
      label: "WhatsApp",
      contact: "+7 708 106 08 10",
      href: "https://wa.me/77081060810",
    },
    sourceHref: "https://www.gov.kz/memleket/entities/ombudsman-almaty/press/news/details/748239",
    verified: true,
  },
  {
    id: "contact-center-111",
    kind: "protection",
    category: { ru: "Нужна защита", kk: "Қорғаныс керек" },
    title: { ru: "Контакт-центр по защите прав детей", kk: "Балалардың құқықтарын қорғау байланыс орталығы" },
    description: {
      ru: "Буллинг, насилие, нарушение прав ребёнка или сложная ситуация в семье. Здесь оказывают психологическую и правовую помощь.",
      kk: "Буллинг, зорлық-зомбылық, бала құқығының бұзылуы немесе отбасындағы қиын жағдай. Мұнда психологиялық және құқықтық көмек көрсетіледі.",
    },
    availability: { ru: "конфиденциально · круглосуточно", kk: "құпия · тәулік бойы" },
    contact: "111",
    href: "tel:111",
    sourceHref: "https://www.gov.kz/situations/677/1457?lang=ru",
    verified: true,
  },
  {
    id: "emergency-112",
    kind: "emergency",
    category: { ru: "Опасность сейчас", kk: "Қазір қауіп бар" },
    title: { ru: "Единая экстренная служба", kk: "Бірыңғай шұғыл қызмет" },
    description: {
      ru: "Если есть непосредственная угроза жизни или безопасности — звони прямо сейчас.",
      kk: "Өмірге немесе қауіпсіздікке тікелей қатер болса, қазір қоңырау шал.",
    },
    availability: { ru: "экстренная помощь · круглосуточно", kk: "шұғыл көмек · тәулік бойы" },
    contact: "112",
    href: "tel:112",
    sourceHref: "https://www.gov.kz/situations/729/1519?lang=ru",
    verified: true,
  },
];
