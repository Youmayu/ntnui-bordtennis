// Editorial sources checked 2026-09-09:
// https://www.datatilsynet.no/rettigheter-og-plikter/virksomhetenes-plikter/informasjon-og-apenhet/
// https://nkom.no/internett/informasjonskapsler-cookies
// https://www.cloudflare.com/turnstile-privacy-policy/
// https://developers.cloudflare.com/cloudflare-challenges/concepts/clearance/
// Operator review is still needed for the legal controller, retention decisions,
// documented lawful-basis assessments, provider regions and transfer safeguards.

export const LEGAL_PAGE_SLUGS = ["privacy", "cookies", "website-info"] as const;
export type LegalPageSlug = (typeof LEGAL_PAGE_SLUGS)[number];

export type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
  links?: { label: string; href: string }[];
};

export type LegalPage = {
  title: string;
  description: string;
  sections: LegalSection[];
};

export type LegalCopy = {
  navLabel: string;
  privacy: string;
  cookies: string;
  websiteInfo: string;
  cookieSettings: string;
  updated: string;
  contact: string;
  registerNotice: string;
  unregisterNotice: string;
  readPrivacy: string;
  turnstileNotice: string;
  pages: Record<LegalPageSlug, LegalPage>;
};

export const LEGAL_UPDATED = "2026-09-09";
export const PRIVACY_EMAIL = "he.ma@ntnui.no";

export const LEGAL_EN: LegalCopy = {
  navLabel: "Privacy and website information",
  privacy: "Privacy",
  cookies: "Cookies",
  websiteInfo: "Website information",
  cookieSettings: "Cookie settings",
  updated: "Last updated",
  contact: "Contact He You Ma",
  registerNotice:
    "We use your name, playing level and birth month/day to manage your signup. Your name is public in participant and cancellation lists, including when you are on the waiting list. Your birth details are not public. Read how we use and keep your information before signing up.",
  unregisterNotice:
    "We compare your birth month and day with your signup to check your cancellation. A successful cancellation removes that registration from the active database.",
  readPrivacy: "Read the privacy notice",
  turnstileNotice:
    "Cloudflare Turnstile checks browser and connection information to protect this form from bots. See Cloudflare’s Turnstile Privacy Addendum.",
  pages: {
    privacy: {
      title: "Privacy notice",
      description: "How NTNUI Bordtennis uses information when you visit and sign up for training.",
      sections: [
        {
          id: "contact",
          title: "Who operates this website",
          paragraphs: [
            "NTNUI Bordtennis, a subgroup of NTNUI, operates this website. For privacy questions or requests, contact vice president He You Ma at he.ma@ntnui.no.",
          ],
        },
        {
          id: "signup-data",
          title: "Training signups",
          paragraphs: [
            "We store your name, selected playing level, birth month and day, chosen session, signup time and confirmed or waiting-list status. Name, playing level and birth month/day are required for online signup. We do not ask for your birth year. Birth details help distinguish registrations and check cancellations; playing level helps organise training.",
            "For members-only sessions, you must confirm membership. This website does not register or take payment for membership. Older cancellation-request records can contain a submitted name, message and request time.",
          ],
        },
        {
          id: "visibility",
          title: "What other people can see",
          paragraphs: [
            "Your name is visible to website visitors in participant and cancellation lists. Waiting-list names are also visible in the cancellation list. Birth month/day are not displayed publicly. Authorised administrators can access signup information to organise sessions and resolve requests. Contact us if public name display prevents you from using online signup.",
          ],
        },
        {
          id: "purposes",
          title: "Why we use this information",
          paragraphs: [
            "We use signup information to provide the training reservation you request, including places, waiting lists and cancellations (GDPR Article 6(1)(b)). Our legitimate interests in organising sessions, helping participants identify their signup and protecting forms support participant-list display and abuse prevention (Article 6(1)(f)). You can object to processing based on legitimate interests and request information about our balancing assessment.",
            "Optional preference cookies use your consent. We do not use signup information for advertising. Providing information is voluntary, but the required fields are needed to complete an online signup.",
          ],
        },
        {
          id: "providers",
          title: "Hosting and form protection",
          paragraphs: [
            "The website uses Heroku hosting and a PostgreSQL database. Hosting involves processing requests and technical connection information. Cloudflare Turnstile processes IP addresses and browser/security signals to check for bots; it does not receive the name, playing level or birth details entered in the form.",
            "Cloudflare acts as a processor for our form protection and as a separate controller when improving Turnstile. Providers can process information outside the EEA. Contact us for details of the locations, applicable transfer safeguards and provider retention arrangements.",
          ],
          links: [
            { label: "Cloudflare Turnstile Privacy Addendum", href: "https://www.cloudflare.com/turnstile-privacy-policy/" },
          ],
        },
        {
          id: "retention",
          title: "How long information stays",
          paragraphs: [
            "Cancelling a signup removes that registration from the active database. Otherwise, records remain until an administrator removes them. There is currently no automatic time-based deletion of past registrations or older cancellation requests. Contact us to request deletion or ask about a particular record. Copies in hosting logs or backups can follow separate provider retention arrangements.",
          ],
        },
        {
          id: "rights",
          title: "Your choices and rights",
          paragraphs: [
            "Email he.ma@ntnui.no to request access, correction, deletion or restriction of your information. Where applicable, you can receive data provided under a contract or consent in a portable format. You can object to legitimate-interest processing and withdraw cookie consent in Cookie settings. These rights have legal conditions; we may need information to verify your identity. You can complain to Datatilsynet.",
          ],
          links: [
            { label: "Contact or complain to Datatilsynet", href: "https://www.datatilsynet.no/om-datatilsynet/kontakt-oss/" },
          ],
        },
      ],
    },
    cookies: {
      title: "Cookies and your choices",
      description: "Choose whether this website remembers your language and appearance.",
      sections: [
        {
          id: "preferences",
          title: "Optional preference cookies",
          paragraphs: [
            "With your permission, ntnui_locale stores your language and ntnui_theme stores your light/dark appearance for up to 180 days. These first-party cookies contain your chosen setting, not your signup details. They are only saved after you allow preference cookies.",
            "Rejecting or withdrawing permission clears these preference cookies. Language and appearance controls still work for your current visit. Open Cookie settings at any time to change your choice.",
          ],
        },
        {
          id: "choice",
          title: "Remembering your cookie choice",
          paragraphs: [
            "The necessary first-party cookie ntnui_cookie_preferences stores v1.accepted or v1.rejected for up to 180 days. It remembers your decision so we can apply it. When it expires, we ask again. Your browser also lets you delete cookies; deleting this cookie resets your saved decision.",
          ],
        },
        {
          id: "security",
          title: "Security and other websites",
          paragraphs: [
            "Cloudflare Turnstile performs security checks on forms. It normally returns a single-use token. If pre-clearance is enabled in Cloudflare, it can also set cf_clearance; its lifetime depends on that configuration. Contact us for details of security storage used by the live service.",
            "This website does not include advertising or visitor analytics tracking. Discord, MazeMap and membership links open other websites rather than embedded services. Their cookie choices apply when you visit them.",
          ],
          links: [
            { label: "Cloudflare Turnstile Privacy Addendum", href: "https://www.cloudflare.com/turnstile-privacy-policy/" },
          ],
        },
      ],
    },
    "website-info": {
      title: "Website information",
      description: "Using the NTNUI Bordtennis training website and getting help.",
      sections: [
        {
          id: "using-the-site",
          title: "Signing up and cancelling",
          paragraphs: [
            "Use your own details and cancel when you cannot attend. A confirmed signup reserves a training place; joining the waiting list does not. Check your status before attending. Session information and capacity can change, so consult the current schedule and club announcements.",
          ],
        },
        {
          id: "membership",
          title: "Membership and external services",
          paragraphs: [
            "Training signup is separate from NTNUI membership. Follow the membership link for membership requirements and payment. This website does not take payments. Discord, membership and map services have their own terms and privacy information.",
          ],
        },
        {
          id: "help",
          title: "Contact and accessibility",
          paragraphs: [
            "The website is operated by NTNUI Bordtennis. Contact vice president He You Ma at he.ma@ntnui.no for website or privacy questions. If a page or form is difficult to use, tell us which page and what happened so we can help and improve it.",
          ],
        },
      ],
    },
  },
};

export const LEGAL_NO: LegalCopy = {
  navLabel: "Personvern og informasjon om nettstedet",
  privacy: "Personvern",
  cookies: "Informasjonskapsler",
  websiteInfo: "Om nettstedet",
  cookieSettings: "Innstillinger for informasjonskapsler",
  updated: "Sist oppdatert",
  contact: "Kontakt He You Ma",
  registerNotice:
    "Vi bruker navn, spillernivå og fødselsmåned/-dag til å administrere påmeldingen din. Navnet ditt vises offentlig i deltaker- og avmeldingslister, også når du står på venteliste. Fødselsopplysningene vises ikke offentlig. Les hvordan vi bruker og lagrer opplysningene før du melder deg på.",
  unregisterNotice:
    "Vi sammenligner fødselsmåned og -dag med påmeldingen for å kontrollere avmeldingen din. Når avmeldingen er gjennomført, slettes denne påmeldingen fra den aktive databasen.",
  readPrivacy: "Les personvernerklæringen",
  turnstileNotice:
    "Cloudflare Turnstile kontrollerer nettleser- og tilkoblingsopplysninger for å beskytte skjemaet mot roboter. Se Cloudflares personverninformasjon for Turnstile.",
  pages: {
    privacy: {
      title: "Personvernerklæring",
      description: "Slik bruker NTNUI Bordtennis opplysninger når du besøker nettstedet og melder deg på trening.",
      sections: [
        {
          id: "contact",
          title: "Hvem som driver nettstedet",
          paragraphs: [
            "NTNUI Bordtennis, en undergruppe av NTNUI, driver dette nettstedet. Kontakt nestleder He You Ma på he.ma@ntnui.no med spørsmål om personvern eller forespørsler om opplysningene dine.",
          ],
        },
        {
          id: "signup-data",
          title: "Påmelding til trening",
          paragraphs: [
            "Vi lagrer navn, valgt spillernivå, fødselsmåned og -dag, valgt økt, påmeldingstidspunkt og status som bekreftet eller på venteliste. Navn, spillernivå og fødselsmåned/-dag er påkrevd for påmelding på nett. Vi spør ikke om fødselsår. Fødselsopplysningene brukes til å skille påmeldinger fra hverandre og kontrollere avmeldinger; spillernivået hjelper oss med å organisere treningen.",
            "For økter kun for medlemmer må du bekrefte medlemskap. Nettstedet registrerer ikke medlemskap eller tar imot medlemsbetaling. Eldre avmeldingsforespørsler kan inneholde innsendt navn, melding og tidspunkt.",
          ],
        },
        {
          id: "visibility",
          title: "Hva andre kan se",
          paragraphs: [
            "Navnet ditt er synlig for besøkende i deltaker- og avmeldingslister. Navn på ventelisten vises også i avmeldingslisten. Fødselsmåned/-dag vises ikke offentlig. Autoriserte administratorer har tilgang til påmeldingsopplysninger for å organisere økter og håndtere forespørsler. Kontakt oss hvis offentlig visning av navnet hindrer deg i å melde deg på via nettstedet.",
          ],
        },
        {
          id: "purposes",
          title: "Hvorfor vi bruker opplysningene",
          paragraphs: [
            "Vi bruker påmeldingsopplysninger for å levere treningsreservasjonen du ber om, inkludert plasser, ventelister og avmeldinger (personvernforordningen artikkel 6 nr. 1 bokstav b). Våre berettigede interesser i å organisere økter, hjelpe deltakere med å finne påmeldingen sin og beskytte skjemaer ligger til grunn for visning av deltakerlister og forebygging av misbruk (artikkel 6 nr. 1 bokstav f). Du kan protestere mot behandling basert på berettigede interesser og be om informasjon om interesseavveiningen vår.",
            "Valgfrie informasjonskapsler for innstillinger bygger på ditt samtykke. Vi bruker ikke påmeldingsopplysninger til reklame. Det er frivillig å oppgi opplysninger, men de påkrevde feltene trengs for å fullføre en påmelding på nett.",
          ],
        },
        {
          id: "providers",
          title: "Drift og beskyttelse av skjemaer",
          paragraphs: [
            "Nettstedet bruker Heroku til drift og en PostgreSQL-database. Driften innebærer behandling av forespørsler og tekniske tilkoblingsopplysninger. Cloudflare Turnstile behandler IP-adresser og nettleser-/sikkerhetssignaler for å oppdage roboter; tjenesten mottar ikke navn, spillernivå eller fødselsopplysninger som fylles inn i skjemaet.",
            "Cloudflare er databehandler for vår skjemabeskyttelse og selvstendig behandlingsansvarlig ved forbedring av Turnstile. Leverandører kan behandle opplysninger utenfor EØS. Kontakt oss for informasjon om behandlingssteder, aktuelle overføringsgarantier og leverandørenes lagringstider.",
          ],
          links: [
            { label: "Cloudflares personverninformasjon for Turnstile", href: "https://www.cloudflare.com/turnstile-privacy-policy/" },
          ],
        },
        {
          id: "retention",
          title: "Hvor lenge opplysningene lagres",
          paragraphs: [
            "Ved avmelding slettes den aktuelle påmeldingen fra den aktive databasen. Ellers blir opplysninger lagret til en administrator fjerner dem. Det finnes for øyeblikket ingen automatisk sletting etter en fast periode for tidligere påmeldinger eller eldre avmeldingsforespørsler. Kontakt oss for å be om sletting eller spørre om en bestemt registrering. Kopier i driftslogger eller sikkerhetskopier kan følge egne lagringstider hos leverandørene.",
          ],
        },
        {
          id: "rights",
          title: "Dine valg og rettigheter",
          paragraphs: [
            "Send e-post til he.ma@ntnui.no for å be om innsyn, retting, sletting eller begrensning av behandlingen. Når vilkårene er oppfylt, kan du få opplysninger du har gitt under en avtale eller et samtykke, i et overførbart format. Du kan protestere mot behandling basert på berettigede interesser og trekke tilbake samtykke til informasjonskapsler i innstillingene. Rettighetene har lovbestemte vilkår; vi kan trenge opplysninger for å bekrefte identiteten din. Du kan klage til Datatilsynet.",
          ],
          links: [
            { label: "Kontakt eller klag til Datatilsynet", href: "https://www.datatilsynet.no/om-datatilsynet/kontakt-oss/" },
          ],
        },
      ],
    },
    cookies: {
      title: "Informasjonskapsler og dine valg",
      description: "Velg om nettstedet skal huske språket og utseendet du foretrekker.",
      sections: [
        {
          id: "preferences",
          title: "Valgfrie informasjonskapsler for innstillinger",
          paragraphs: [
            "Med din tillatelse lagrer ntnui_locale språkvalget og ntnui_theme valget av lyst/mørkt utseende i opptil 180 dager. Disse førstepartsinformasjonskapslene inneholder valgt innstilling, ikke påmeldingsopplysninger. De lagres først når du tillater informasjonskapsler for innstillinger.",
            "Hvis du avslår eller trekker tilbake tillatelsen, slettes disse informasjonskapslene. Språk- og utseendevalgene fungerer fortsatt under det pågående besøket. Åpne innstillingene for informasjonskapsler når som helst for å endre valget.",
          ],
        },
        {
          id: "choice",
          title: "Slik husker vi valget ditt",
          paragraphs: [
            "Den nødvendige førstepartsinformasjonskapselen ntnui_cookie_preferences lagrer v1.accepted eller v1.rejected i opptil 180 dager. Den husker avgjørelsen din slik at vi kan følge den. Når den utløper, spør vi på nytt. Du kan også slette informasjonskapsler i nettleseren; sletting av denne kapselen nullstiller det lagrede valget.",
          ],
        },
        {
          id: "security",
          title: "Sikkerhet og andre nettsteder",
          paragraphs: [
            "Cloudflare Turnstile utfører sikkerhetskontroller på skjemaer. Vanligvis returnerer tjenesten en kode som brukes én gang. Hvis forhåndsklarering er aktivert hos Cloudflare, kan tjenesten også sette cf_clearance; varigheten avhenger av innstillingene. Kontakt oss for detaljer om sikkerhetslagring i den aktive tjenesten.",
            "Nettstedet inneholder ikke reklamesporing eller besøksanalyse. Lenker til Discord, MazeMap og medlemskap åpner andre nettsteder og er ikke innebygde tjenester. Deres valg for informasjonskapsler gjelder når du besøker dem.",
          ],
          links: [
            { label: "Cloudflares personverninformasjon for Turnstile", href: "https://www.cloudflare.com/turnstile-privacy-policy/" },
          ],
        },
      ],
    },
    "website-info": {
      title: "Om nettstedet",
      description: "Slik bruker du NTNUI Bordtennis sitt treningsnettsted og får hjelp.",
      sections: [
        {
          id: "using-the-site",
          title: "Påmelding og avmelding",
          paragraphs: [
            "Bruk dine egne opplysninger og meld deg av hvis du ikke kan delta. En bekreftet påmelding reserverer en treningsplass; en plass på ventelisten gjør ikke det. Kontroller statusen din før du møter opp. Informasjon om økter og kapasitet kan endres, så se den gjeldende treningsplanen og klubbens beskjeder.",
          ],
        },
        {
          id: "membership",
          title: "Medlemskap og eksterne tjenester",
          paragraphs: [
            "Treningspåmelding er adskilt fra NTNUI-medlemskap. Følg medlemslenken for medlemskrav og betaling. Dette nettstedet tar ikke imot betaling. Discord, medlemstjenesten og karttjenesten har egne vilkår og egen personverninformasjon.",
          ],
        },
        {
          id: "help",
          title: "Kontakt og tilgjengelighet",
          paragraphs: [
            "Nettstedet drives av NTNUI Bordtennis. Kontakt nestleder He You Ma på he.ma@ntnui.no med spørsmål om nettstedet eller personvern. Hvis en side eller et skjema er vanskelig å bruke, fortell oss hvilken side det gjelder og hva som skjedde, slik at vi kan hjelpe og forbedre løsningen.",
          ],
        },
      ],
    },
  },
};
