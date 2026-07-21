export interface SupportResource {
  id: string;
  title: string;
  description: string;
  contact?: string;
  href?: string;
  verified: boolean;
}

// DEVELOPMENT PLACEHOLDERS: replace only with verified official Kazakhstan resources.
// Keeping contacts out of the UI until verified prevents the MVP from inventing help lines.
export const supportResources: SupportResource[] = [
  {
    id: "local-emergency",
    title: "Экстренные службы",
    description: "Если есть непосредственная опасность, обратись в местные экстренные службы.",
    verified: false,
  },
  {
    id: "trusted-person",
    title: "Человек, которому ты доверяешь",
    description: "Позвони близкому, куратору, преподавателю или сотруднику студенческой службы.",
    verified: true,
  },
];
