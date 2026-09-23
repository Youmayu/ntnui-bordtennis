import type { Locale } from "@/lib/site-content";

type RegistrationCopy = {
  title: string;
  showParticipants: string;
  hideParticipants: string;
  fullTitle: string;
  waitlistSignup: string;
  joinWaitlist: string;
  confirmed: string;
  confirmedHelp: string;
  waitlist: string;
  waitlistHelp: string;
  emptyWaitlist: string;
  lastUpdated: string;
  loading: string;
  loadError: string;
  firstName: string;
  lastName: string;
  nameHelp: string;
  nameError: string;
};

const COPY: Record<Locale, RegistrationCopy> = {
  no: {
    title: "Påmeldinger",
    showParticipants: "Vis deltakere",
    hideParticipants: "Skjul deltakere",
    fullTitle: "Økten er full",
    waitlistSignup: "Påmelding setter deg på ventelisten. Du har ikke en bekreftet treningsplass ennå.",
    joinWaitlist: "Meld meg på ventelisten",
    confirmed: "Bekreftet plass",
    confirmedHelp: "Disse spillerne har plass på treningen.",
    waitlist: "Venteliste",
    waitlistHelp: "Nummeret viser plassen din i køen. Når en plass blir ledig, flyttes den første i køen automatisk til bekreftet plass.",
    emptyWaitlist: "Ingen på ventelisten.",
    lastUpdated: "Sist oppdatert",
    loading: "Henter påmeldinger …",
    loadError: "Kunne ikke oppdatere påmeldingene. Listen kan være utdatert.",
    firstName: "Fornavn",
    lastName: "Etternavn",
    nameHelp: "Begge felt er påkrevd. Maks 80 tegn til sammen, inkludert mellomrom.",
    nameError: "Oppgi både fornavn og etternavn med bokstaver, maks 80 tegn til sammen.",
  },
  en: {
    title: "Registrations",
    showParticipants: "Show participants",
    hideParticipants: "Hide participants",
    fullTitle: "Session full",
    waitlistSignup: "Signing up joins the waiting list. You do not have a confirmed spot yet.",
    joinWaitlist: "Join waiting list",
    confirmed: "Confirmed",
    confirmedHelp: "These players have a spot at practice.",
    waitlist: "Waiting list",
    waitlistHelp: "Your number is your place in the queue. When a spot opens, the first person moves to Confirmed automatically.",
    emptyWaitlist: "No one is waiting for a spot.",
    lastUpdated: "Last updated",
    loading: "Loading registrations …",
    loadError: "Could not update registrations. The list may be out of date.",
    firstName: "First name",
    lastName: "Surname",
    nameHelp: "Both fields are required. Maximum 80 characters combined, including spaces.",
    nameError: "Enter both first name and surname using letters, with no more than 80 characters combined.",
  },
  da: {
    title: "Tilmeldinger",
    showParticipants: "Vis deltagere",
    hideParticipants: "Skjul deltagere",
    fullTitle: "Træningen er fuld",
    waitlistSignup: "Tilmelding sætter dig på ventelisten. Du har endnu ikke en bekræftet træningsplads.",
    joinWaitlist: "Skriv mig på ventelisten",
    confirmed: "Bekræftet plads",
    confirmedHelp: "Disse spillere har en plads til træningen.",
    waitlist: "Venteliste",
    waitlistHelp: "Nummeret viser din plads i køen. Når en plads bliver ledig, får den første i køen automatisk en bekræftet plads.",
    emptyWaitlist: "Ingen på ventelisten.",
    lastUpdated: "Senest opdateret",
    loading: "Henter tilmeldinger …",
    loadError: "Tilmeldingerne kunne ikke opdateres. Listen kan være forældet.",
    firstName: "Fornavn",
    lastName: "Efternavn",
    nameHelp: "Begge felter er påkrævet. Højst 80 tegn i alt, inklusive mellemrum.",
    nameError: "Angiv både fornavn og efternavn med bogstaver, højst 80 tegn i alt.",
  },
  sv: {
    title: "Anmälningar",
    showParticipants: "Visa deltagare",
    hideParticipants: "Dölj deltagare",
    fullTitle: "Passet är fullt",
    waitlistSignup: "Anmälan placerar dig på väntelistan. Du har ännu ingen bekräftad träningsplats.",
    joinWaitlist: "Ställ mig på väntelistan",
    confirmed: "Bekräftad plats",
    confirmedHelp: "Dessa spelare har en plats på träningen.",
    waitlist: "Väntelista",
    waitlistHelp: "Numret visar din plats i kön. När en plats blir ledig får den första i kön automatiskt en bekräftad plats.",
    emptyWaitlist: "Ingen står på väntelistan.",
    lastUpdated: "Senast uppdaterad",
    loading: "Hämtar anmälningar …",
    loadError: "Kunde inte uppdatera anmälningarna. Listan kan vara inaktuell.",
    firstName: "Förnamn",
    lastName: "Efternamn",
    nameHelp: "Båda fälten är obligatoriska. Högst 80 tecken totalt, inklusive mellanslag.",
    nameError: "Ange både förnamn och efternamn med bokstäver, högst 80 tecken totalt.",
  },
  de: {
    title: "Anmeldungen",
    showParticipants: "Teilnehmer anzeigen",
    hideParticipants: "Teilnehmer ausblenden",
    fullTitle: "Training ausgebucht",
    waitlistSignup: "Mit der Anmeldung kommst du auf die Warteliste. Du hast noch keinen bestätigten Trainingsplatz.",
    joinWaitlist: "Auf die Warteliste",
    confirmed: "Bestätigt",
    confirmedHelp: "Diese Spieler haben einen Platz beim Training.",
    waitlist: "Warteliste",
    waitlistHelp: "Die Nummer zeigt deinen Platz in der Warteschlange. Wird ein Platz frei, wird die erste Person automatisch bestätigt.",
    emptyWaitlist: "Niemand auf der Warteliste.",
    lastUpdated: "Zuletzt aktualisiert",
    loading: "Anmeldungen werden geladen …",
    loadError: "Die Anmeldungen konnten nicht aktualisiert werden. Die Liste ist möglicherweise veraltet.",
    firstName: "Vorname",
    lastName: "Nachname",
    nameHelp: "Beide Felder sind erforderlich. Insgesamt höchstens 80 Zeichen einschließlich Leerzeichen.",
    nameError: "Gib Vor- und Nachnamen mit Buchstaben und insgesamt höchstens 80 Zeichen ein.",
  },
  zh: {
    title: "报名名单",
    showParticipants: "显示参与者",
    hideParticipants: "隐藏参与者",
    fullTitle: "训练名额已满",
    waitlistSignup: "报名后你将进入候补名单，目前还没有确认的训练名额。",
    joinWaitlist: "加入候补名单",
    confirmed: "已确认",
    confirmedHelp: "这些球员已获得训练名额。",
    waitlist: "候补名单",
    waitlistHelp: "数字表示你的候补顺序。有空位时，排在第一位的人将自动转为已确认。",
    emptyWaitlist: "目前没有候补人员。",
    lastUpdated: "最后更新",
    loading: "正在加载报名名单……",
    loadError: "无法更新报名名单。名单可能已过时。",
    firstName: "名",
    lastName: "姓",
    nameHelp: "两项均为必填，合计最多80个字符（包括空格）。",
    nameError: "请填写名和姓，仅使用文字，合计不超过80个字符。",
  },
  fr: {
    title: "Inscriptions",
    showParticipants: "Afficher les participants",
    hideParticipants: "Masquer les participants",
    fullTitle: "Séance complète",
    waitlistSignup: "Votre inscription vous place sur la liste d’attente. Vous n’avez pas encore de place confirmée.",
    joinWaitlist: "Rejoindre la liste d’attente",
    confirmed: "Confirmés",
    confirmedHelp: "Ces joueurs ont une place à l’entraînement.",
    waitlist: "Liste d’attente",
    waitlistHelp: "Le numéro indique votre position dans la file. Lorsqu’une place se libère, la première personne passe automatiquement dans la liste des confirmés.",
    emptyWaitlist: "Personne sur la liste d’attente.",
    lastUpdated: "Dernière mise à jour",
    loading: "Chargement des inscriptions…",
    loadError: "Impossible d’actualiser les inscriptions. La liste peut être obsolète.",
    firstName: "Prénom",
    lastName: "Nom de famille",
    nameHelp: "Les deux champs sont obligatoires. 80 caractères au total maximum, espaces compris.",
    nameError: "Indiquez votre prénom et votre nom de famille avec des lettres, dans la limite de 80 caractères au total.",
  },
  es: {
    title: "Inscripciones",
    showParticipants: "Mostrar participantes",
    hideParticipants: "Ocultar participantes",
    fullTitle: "Entrenamiento completo",
    waitlistSignup: "Al inscribirte, entrarás en la lista de espera. Aún no tienes una plaza confirmada.",
    joinWaitlist: "Unirme a la lista de espera",
    confirmed: "Confirmados",
    confirmedHelp: "Estos jugadores tienen una plaza en el entrenamiento.",
    waitlist: "Lista de espera",
    waitlistHelp: "El número indica tu posición en la cola. Cuando queda una plaza libre, la primera persona pasa automáticamente a Confirmados.",
    emptyWaitlist: "No hay nadie en la lista de espera.",
    lastUpdated: "Última actualización",
    loading: "Cargando inscripciones…",
    loadError: "No se pudieron actualizar las inscripciones. La lista puede estar desactualizada.",
    firstName: "Nombre",
    lastName: "Apellidos",
    nameHelp: "Ambos campos son obligatorios. Máximo 80 caracteres en total, incluidos los espacios.",
    nameError: "Introduce tu nombre y apellidos con letras, con un máximo de 80 caracteres en total.",
  },
};

export function getRegistrationCopy(locale: Locale) {
  return COPY[locale];
}
