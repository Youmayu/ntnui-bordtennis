import type { Locale } from "@/lib/site-content";

type CookieCopy = {
  title: string;
  body: string;
  choiceNotice: string;
  accept: string;
  reject: string;
  policy: string;
  settings: string;
};

export const COOKIE_CONTENT: Record<Locale, CookieCopy> = {
  no: {
    title: "Vil du lagre innstillingene dine?",
    body: "Med ditt samtykke bruker vi valgfrie informasjonskapsler til å huske språk og tema i 180 dager. Nettstedet bruker ikke analyse- eller reklamesporing. Du kan fortsatt velge språk og tema uten å lagre dem.",
    choiceNotice: "Vi husker dette valget i 180 dager. Du kan endre det under «Innstillinger for informasjonskapsler» nederst på siden.",
    accept: "Lagre innstillingene",
    reject: "Bruk uten å lagre",
    policy: "Om informasjonskapsler",
    settings: "Innstillinger for informasjonskapsler",
  },
  en: {
    title: "Save your preferences?",
    body: "With your permission, we use optional cookies to remember your language and theme for 180 days. This website has no analytics or advertising tracking. You can still change language and theme without saving them.",
    choiceNotice: "We remember this choice for 180 days. You can change it using “Cookie settings” at the bottom of the page.",
    accept: "Save preferences",
    reject: "Use without saving",
    policy: "About cookies",
    settings: "Cookie settings",
  },
  da: {
    title: "Vil du gemme dine indstillinger?",
    body: "Med dit samtykke bruger vi valgfrie cookies til at huske sprog og tema i 180 dage. Hjemmesiden bruger ikke analyse- eller reklamesporing. Du kan stadig vælge sprog og tema uden at gemme dem.",
    choiceNotice: "Vi husker dette valg i 180 dage. Du kan ændre det under “Cookieindstillinger” nederst på siden.",
    accept: "Gem indstillinger",
    reject: "Brug uden at gemme",
    policy: "Om cookies",
    settings: "Cookieindstillinger",
  },
  sv: {
    title: "Vill du spara dina inställningar?",
    body: "Med ditt samtycke använder vi valfria kakor för att komma ihåg språk och tema i 180 dagar. Webbplatsen använder ingen analys- eller reklamspårning. Du kan fortfarande välja språk och tema utan att spara dem.",
    choiceNotice: "Vi kommer ihåg detta val i 180 dagar. Du kan ändra det under ”Inställningar för kakor” längst ner på sidan.",
    accept: "Spara inställningar",
    reject: "Använd utan att spara",
    policy: "Om kakor",
    settings: "Inställningar för kakor",
  },
  de: {
    title: "Einstellungen speichern?",
    body: "Mit Ihrer Zustimmung verwenden wir optionale Cookies, um Ihre Sprache und Ihr Farbschema 180 Tage lang zu speichern. Diese Website verwendet kein Analyse- oder Werbetracking. Sprache und Farbschema können Sie auch ohne Speicherung ändern.",
    choiceNotice: "Wir speichern diese Entscheidung 180 Tage lang. Unter „Cookie-Einstellungen“ am Seitenende können Sie sie ändern.",
    accept: "Einstellungen speichern",
    reject: "Ohne Speicherung nutzen",
    policy: "Über Cookies",
    settings: "Cookie-Einstellungen",
  },
  zh: {
    title: "保存您的偏好设置？",
    body: "经您同意，我们会使用可选 Cookie 将您的语言和主题偏好保存 180 天。本网站不使用分析或广告跟踪。即使不保存，您仍可更改语言和主题。",
    choiceNotice: "我们会将这一选择保存 180 天。您可随时通过页面底部的“Cookie 设置”更改选择。",
    accept: "保存偏好设置",
    reject: "不保存，继续使用",
    policy: "关于 Cookie",
    settings: "Cookie 设置",
  },
  fr: {
    title: "Enregistrer vos préférences ?",
    body: "Avec votre accord, nous utilisons des cookies facultatifs pour mémoriser votre langue et votre thème pendant 180 jours. Ce site n’utilise aucun suivi analytique ou publicitaire. Vous pouvez toujours changer de langue et de thème sans les enregistrer.",
    choiceNotice: "Nous mémorisons ce choix pendant 180 jours. Vous pouvez le modifier via « Paramètres des cookies » en bas de page.",
    accept: "Enregistrer les préférences",
    reject: "Continuer sans enregistrer",
    policy: "À propos des cookies",
    settings: "Paramètres des cookies",
  },
  es: {
    title: "¿Guardar tus preferencias?",
    body: "Con tu permiso, usamos cookies opcionales para recordar el idioma y el tema durante 180 días. Este sitio no utiliza seguimiento analítico ni publicitario. Puedes seguir cambiando el idioma y el tema sin guardarlos.",
    choiceNotice: "Recordamos esta elección durante 180 días. Puedes cambiarla en «Configuración de cookies», al pie de la página.",
    accept: "Guardar preferencias",
    reject: "Continuar sin guardar",
    policy: "Acerca de las cookies",
    settings: "Configuración de cookies",
  },
};
