import type { Locale } from "@/lib/site-content";

const PUBLIC_COPY = {
  no: { team: "Turneringslaget", reserved: "Reservert for turneringslaget", release: "Ubrukte plasser åpnes", publicFull: "Ingen ordinære plasser ledige" },
  en: { team: "Tournament team", reserved: "Reserved for tournament players", release: "Unused spots open", publicFull: "No general spots available" },
  da: { team: "Turneringsholdet", reserved: "Reserveret til turneringsholdet", release: "Ubrugte pladser åbner", publicFull: "Ingen almindelige pladser ledige" },
  sv: { team: "Tävlingslaget", reserved: "Reserverat för tävlingslaget", release: "Oanvända platser släpps", publicFull: "Inga ordinarie platser lediga" },
  de: { team: "Turnierteam", reserved: "Für das Turnierteam reserviert", release: "Unbelegte Plätze werden freigegeben", publicFull: "Keine regulären Plätze verfügbar" },
  zh: { team: "比赛队", reserved: "为比赛队员预留", release: "未使用名额开放时间", publicFull: "普通名额已满" },
  fr: { team: "Équipe de compétition", reserved: "Réservé à l’équipe de compétition", release: "Ouverture des places inutilisées", publicFull: "Aucune place ordinaire disponible" },
  es: { team: "Equipo de competición", reserved: "Reservado para el equipo de competición", release: "Las plazas sin usar se liberan", publicFull: "No hay plazas generales disponibles" },
} satisfies Record<Locale, { team: string; reserved: string; release: string; publicFull: string }>;

export function getTournamentCopy(locale: Locale) {
  return PUBLIC_COPY[locale];
}

export function getTournamentFormCopy(locale: Locale) {
  return locale === "no" ? {
    title: "Påmelding for turneringslaget",
    intro: "Velg økt og ditt eget navn for å melde deg på.",
    rule: "Fem plasser holdes av til laget frem til kl. 00:00 to kalenderdager før hver økt, norsk tid. For onsdagens trening åpnes ubrukte plasser mandag ved midnatt.",
    player: "Ditt navn", choosePlayer: "Velg navnet ditt", submitting: "Melder på …",
    released: "Reservasjonen er utløpt. Påmelding følger nå vanlig kapasitet og venteliste.",
    cancel: "Kontakt styret hvis du trenger å melde deg av.",
    already: "Du er allerede påmeldt denne økten.",
    errors: { invalid: "Velg en gyldig økt og spiller.", captcha: "Fullfør CAPTCHA og prøv igjen.", closed: "Denne økten er avsluttet eller finnes ikke.", unavailable: "Kunne ikke melde deg på. Prøv igjen." },
  } : {
    title: "Tournament team registration",
    intro: "Choose a session and your own name to register.",
    rule: "Five spots are held for the team until 00:00 two calendar days before each session, Norwegian time. For Wednesday practice, unused spots open at midnight at the start of Monday.",
    player: "Your name", choosePlayer: "Choose your name", submitting: "Registering …",
    released: "The reservation period has ended. Registration now follows normal capacity and waiting-list order.",
    cancel: "Contact the board if you need to cancel your registration.",
    already: "You are already registered for this session.",
    errors: { invalid: "Choose a valid session and player.", captcha: "Complete the CAPTCHA and try again.", closed: "This session has ended or no longer exists.", unavailable: "Could not register. Please try again." },
  };
}
