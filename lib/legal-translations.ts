import type { LegalCopy } from "@/lib/legal-content";
import type { Locale } from "@/lib/site-content";

export const LEGAL_TRANSLATIONS: Record<Exclude<Locale, "no" | "en">, LegalCopy> = {
  da: {
    navLabel: "Privatliv og oplysninger om hjemmesiden",
    privacy: "Privatliv",
    cookies: "Cookies",
    websiteInfo: "Om hjemmesiden",
    cookieSettings: "Cookieindstillinger",
    updated: "Senest opdateret",
    contact: "Kontakt He You Ma",
    registerNotice: "Vi bruger dit navn, spilleniveau og fødselsmåned/-dag til at administrere din tilmelding. Dit navn vises offentligt på deltager- og afmeldingslister, også når du står på ventelisten. Dine fødselsoplysninger er ikke offentlige. Læs, hvordan vi bruger og opbevarer dine oplysninger, før du tilmelder dig.",
    unregisterNotice: "Vi sammenligner din fødselsmåned og -dag med din tilmelding for at kontrollere din afmelding. En gennemført afmelding fjerner tilmeldingen fra den aktive database.",
    readPrivacy: "Læs privatlivsmeddelelsen",
    turnstileNotice: "Cloudflare Turnstile kontrollerer oplysninger om browser og forbindelse for at beskytte formularen mod bots. Se Cloudflares privatlivstillæg for Turnstile.",
    pages: {
      privacy: {
        title: "Privatlivsmeddelelse",
        description: "Sådan bruger NTNUI Bordtennis oplysninger, når du besøger hjemmesiden og tilmelder dig træning.",
        sections: [
          {
            id: "contact",
            title: "Hvem driver hjemmesiden",
            paragraphs: ["NTNUI Bordtennis, en undergruppe af NTNUI, driver denne hjemmeside. Kontakt næstformand He You Ma på he.ma@ntnui.no med spørgsmål eller anmodninger om privatliv og personoplysninger."],
          },
          {
            id: "signup-data",
            title: "Tilmelding til træning",
            paragraphs: [
              "Vi gemmer dit navn, valgte spilleniveau, fødselsmåned og -dag, valgte træning, tilmeldingstidspunkt og status som bekræftet eller på ventelisten. Navn, spilleniveau og fødselsmåned/-dag er nødvendige for tilmelding på nettet. Vi beder ikke om dit fødselsår. Fødselsoplysninger hjælper med at skelne tilmeldinger fra hinanden og kontrollere afmeldinger; spilleniveau hjælper med at organisere træningen.",
              "Til træninger kun for medlemmer skal du bekræfte dit medlemskab. Denne hjemmeside registrerer ikke medlemskab eller modtager medlemsbetaling. Ældre afmeldingsanmodninger kan indeholde et indsendt navn, en besked og tidspunktet for anmodningen.",
            ],
          },
          {
            id: "visibility",
            title: "Hvad andre kan se",
            paragraphs: ["Dit navn er synligt for besøgende på deltager- og afmeldingslister. Navne på ventelisten er også synlige på afmeldingslisten. Fødselsmåned/-dag vises ikke offentligt. Autoriserede administratorer kan få adgang til tilmeldingsoplysninger for at organisere træninger og håndtere anmodninger. Kontakt os, hvis offentlig visning af dit navn forhindrer dig i at tilmelde dig på nettet."],
          },
          {
            id: "purposes",
            title: "Hvorfor vi bruger oplysningerne",
            paragraphs: [
              "Vi bruger tilmeldingsoplysninger til at levere den træningsreservation, du anmoder om, herunder pladser, ventelister og afmeldinger (GDPR artikel 6, stk. 1, litra b). Vores legitime interesser i at organisere træninger, hjælpe deltagere med at finde deres tilmelding og beskytte formularer ligger til grund for visning af deltagerlister og forebyggelse af misbrug (artikel 6, stk. 1, litra f). Du kan gøre indsigelse mod behandling baseret på legitime interesser og anmode om oplysninger om vores interesseafvejning.",
              "Valgfrie præferencecookies bygger på dit samtykke. Vi bruger ikke tilmeldingsoplysninger til reklame. Det er frivilligt at give oplysninger, men de obligatoriske felter er nødvendige for at gennemføre en tilmelding på nettet.",
            ],
          },
          {
            id: "providers",
            title: "Hosting og beskyttelse af formularer",
            paragraphs: [
              "Hjemmesiden bruger Heroku til hosting og en PostgreSQL-database. Hosting indebærer behandling af forespørgsler og tekniske forbindelsesoplysninger. Cloudflare Turnstile behandler IP-adresser og browser-/sikkerhedssignaler for at kontrollere for bots; tjenesten modtager ikke navn, spilleniveau eller fødselsoplysninger indtastet i formularen.",
              "Cloudflare er databehandler for vores formularbeskyttelse og selvstændig dataansvarlig ved forbedring af Turnstile. Leverandører kan behandle oplysninger uden for EØS. Kontakt os for oplysninger om behandlingssteder, relevante overførselsgarantier og leverandørernes opbevaringsordninger.",
            ],
            links: [{ label: "Cloudflares privatlivstillæg for Turnstile", href: "https://www.cloudflare.com/turnstile-privacy-policy/" }],
          },
          {
            id: "retention",
            title: "Hvor længe oplysningerne gemmes",
            paragraphs: ["Når du afmelder dig, fjernes tilmeldingen fra den aktive database. Ellers gemmes oplysningerne, indtil en administrator fjerner dem. Der er i øjeblikket ingen automatisk sletning efter en fast periode af tidligere tilmeldinger eller ældre afmeldingsanmodninger. Kontakt os for at anmode om sletning eller spørge til en bestemt registrering. Kopier i hostinglogfiler eller sikkerhedskopier kan følge særskilte opbevaringsordninger hos leverandørerne."],
          },
          {
            id: "rights",
            title: "Dine valg og rettigheder",
            paragraphs: ["Skriv til he.ma@ntnui.no for at anmode om indsigt, rettelse, sletning eller begrænsning af behandlingen af dine oplysninger. Når betingelserne er opfyldt, kan du modtage oplysninger givet på grundlag af en aftale eller et samtykke i et portabelt format. Du kan gøre indsigelse mod behandling baseret på legitime interesser og trække dit cookiesamtykke tilbage under Cookieindstillinger. Disse rettigheder har lovbestemte betingelser; vi kan have brug for oplysninger til at bekræfte din identitet. Du kan klage til Datatilsynet."],
            links: [{ label: "Kontakt eller klag til Datatilsynet", href: "https://www.datatilsynet.no/om-datatilsynet/kontakt-oss/" }],
          },
        ],
      },
      cookies: {
        title: "Cookies og dine valg",
        description: "Vælg, om hjemmesiden skal huske dit sprog og udseende.",
        sections: [
          {
            id: "preferences",
            title: "Valgfrie præferencecookies",
            paragraphs: [
              "Med din tilladelse gemmer ntnui_locale dit sprog, og ntnui_theme gemmer dit lyse/mørke udseende i op til 180 dage. Disse førstepartscookies indeholder din valgte indstilling, ikke dine tilmeldingsoplysninger. De gemmes først, når du tillader præferencecookies.",
              "Hvis du afslår eller trækker tilladelsen tilbage, slettes disse præferencecookies. Sprog- og udseendekontroller virker stadig under dit aktuelle besøg. Åbn Cookieindstillinger når som helst for at ændre dit valg.",
            ],
          },
          {
            id: "choice",
            title: "Sådan husker vi dit cookievalg",
            paragraphs: ["Den nødvendige førstepartscookie ntnui_cookie_preferences gemmer v1.accepted eller v1.rejected i op til 180 dage. Den husker din beslutning, så vi kan følge den. Når den udløber, spørger vi igen. Din browser giver dig også mulighed for at slette cookies; hvis du sletter denne cookie, nulstilles din gemte beslutning."],
          },
          {
            id: "security",
            title: "Sikkerhed og andre hjemmesider",
            paragraphs: [
              "Cloudflare Turnstile udfører sikkerhedskontroller på formularer. Tjenesten returnerer normalt et engangstoken. Hvis forhåndsgodkendelse er aktiveret i Cloudflare, kan den også sætte cf_clearance; levetiden afhænger af konfigurationen. Kontakt os for oplysninger om sikkerhedslagring i den aktive tjeneste.",
              "Denne hjemmeside indeholder ikke reklame- eller besøgsanalysesporing. Links til Discord, MazeMap og medlemskab åbner andre hjemmesider frem for indlejrede tjenester. Deres cookievalg gælder, når du besøger dem.",
            ],
            links: [{ label: "Cloudflares privatlivstillæg for Turnstile", href: "https://www.cloudflare.com/turnstile-privacy-policy/" }],
          },
        ],
      },
      "website-info": {
        title: "Om hjemmesiden",
        description: "Sådan bruger du NTNUI Bordtennis' træningshjemmeside og får hjælp.",
        sections: [
          {
            id: "using-the-site",
            title: "Tilmelding og afmelding",
            paragraphs: ["Brug dine egne oplysninger, og meld dig af, når du ikke kan deltage. En bekræftet tilmelding reserverer en træningsplads; en plads på ventelisten gør ikke. Kontroller din status, før du møder op. Træningsoplysninger og kapacitet kan ændres, så se den aktuelle træningsplan og klubbens beskeder."],
          },
          {
            id: "membership",
            title: "Medlemskab og eksterne tjenester",
            paragraphs: ["Tilmelding til træning er adskilt fra NTNUI-medlemskab. Følg medlemslinket for medlemskrav og betaling. Denne hjemmeside modtager ikke betaling. Discord, medlems- og korttjenester har deres egne vilkår og privatlivsoplysninger."],
          },
          {
            id: "help",
            title: "Kontakt og tilgængelighed",
            paragraphs: ["Hjemmesiden drives af NTNUI Bordtennis. Kontakt næstformand He You Ma på he.ma@ntnui.no med spørgsmål om hjemmesiden eller privatliv. Hvis en side eller formular er svær at bruge, så fortæl os, hvilken side det drejer sig om, og hvad der skete, så vi kan hjælpe og forbedre den."],
          },
        ],
      },
    },
  },
  sv: {
    navLabel: "Integritet och webbplatsinformation",
    privacy: "Integritet",
    cookies: "Kakor",
    websiteInfo: "Om webbplatsen",
    cookieSettings: "Kakinställningar",
    updated: "Senast uppdaterad",
    contact: "Kontakta He You Ma",
    registerNotice: "Vi använder ditt namn, din spelnivå och din födelsemånad/-dag för att hantera din anmälan. Ditt namn visas offentligt i deltagar- och avanmälningslistor, även när du står på väntelistan. Dina födelseuppgifter är inte offentliga. Läs hur vi använder och sparar dina uppgifter innan du anmäler dig.",
    unregisterNotice: "Vi jämför din födelsemånad och -dag med din anmälan för att kontrollera din avanmälan. En genomförd avanmälan tar bort den anmälan från den aktiva databasen.",
    readPrivacy: "Läs integritetsmeddelandet",
    turnstileNotice: "Cloudflare Turnstile kontrollerar webbläsar- och anslutningsinformation för att skydda formuläret mot botar. Se Cloudflares integritetstillägg för Turnstile.",
    pages: {
      privacy: {
        title: "Integritetsmeddelande",
        description: "Så använder NTNUI Bordtennis uppgifter när du besöker webbplatsen och anmäler dig till träning.",
        sections: [
          {
            id: "contact",
            title: "Vem som driver webbplatsen",
            paragraphs: ["NTNUI Bordtennis, en undergrupp inom NTNUI, driver den här webbplatsen. Kontakta vice ordförande He You Ma på he.ma@ntnui.no med frågor eller begäranden om integritet och personuppgifter."],
          },
          {
            id: "signup-data",
            title: "Anmälan till träning",
            paragraphs: [
              "Vi sparar ditt namn, vald spelnivå, födelsemånad och -dag, valt träningspass, anmälningstid och status som bekräftad eller på väntelistan. Namn, spelnivå och födelsemånad/-dag krävs för anmälan på nätet. Vi frågar inte efter ditt födelseår. Födelseuppgifterna hjälper oss att skilja anmälningar åt och kontrollera avanmälningar; spelnivån hjälper oss att organisera träningen.",
              "För pass enbart för medlemmar måste du bekräfta ditt medlemskap. Den här webbplatsen registrerar inte medlemskap och tar inte emot medlemsbetalningar. Äldre begäranden om avanmälan kan innehålla ett inskickat namn, ett meddelande och tidpunkten för begäran.",
            ],
          },
          {
            id: "visibility",
            title: "Vad andra kan se",
            paragraphs: ["Ditt namn är synligt för besökare i deltagar- och avanmälningslistor. Namn på väntelistan är också synliga i avanmälningslistan. Födelsemånad/-dag visas inte offentligt. Behöriga administratörer kan komma åt anmälningsuppgifter för att organisera pass och hantera begäranden. Kontakta oss om offentlig visning av ditt namn hindrar dig från att anmäla dig på nätet."],
          },
          {
            id: "purposes",
            title: "Varför vi använder uppgifterna",
            paragraphs: [
              "Vi använder anmälningsuppgifter för att tillhandahålla den träningsbokning du begär, inklusive platser, väntelistor och avanmälningar (GDPR artikel 6.1 b). Våra berättigade intressen av att organisera pass, hjälpa deltagare att identifiera sin anmälan och skydda formulär ligger till grund för visning av deltagarlistor och förebyggande av missbruk (artikel 6.1 f). Du kan invända mot behandling som grundar sig på berättigade intressen och begära information om vår intresseavvägning.",
              "Valfria inställningskakor bygger på ditt samtycke. Vi använder inte anmälningsuppgifter för reklam. Det är frivilligt att lämna uppgifter, men de obligatoriska fälten behövs för att slutföra en anmälan på nätet.",
            ],
          },
          {
            id: "providers",
            title: "Drift och formulärskydd",
            paragraphs: [
              "Webbplatsen använder Heroku för drift och en PostgreSQL-databas. Driften innebär behandling av förfrågningar och teknisk anslutningsinformation. Cloudflare Turnstile behandlar IP-adresser och webbläsar-/säkerhetssignaler för att upptäcka botar; tjänsten tar inte emot namn, spelnivå eller födelseuppgifter som anges i formuläret.",
              "Cloudflare är personuppgiftsbiträde för vårt formulärskydd och självständigt personuppgiftsansvarig när Turnstile förbättras. Leverantörer kan behandla uppgifter utanför EES. Kontakta oss för information om platser, tillämpliga skyddsåtgärder vid överföring och leverantörernas lagringsrutiner.",
            ],
            links: [{ label: "Cloudflares integritetstillägg för Turnstile", href: "https://www.cloudflare.com/turnstile-privacy-policy/" }],
          },
          {
            id: "retention",
            title: "Hur länge uppgifterna sparas",
            paragraphs: ["När du avanmäler dig tas den anmälan bort från den aktiva databasen. Annars finns uppgifterna kvar tills en administratör tar bort dem. Det finns för närvarande ingen automatisk radering efter en viss tid av tidigare anmälningar eller äldre begäranden om avanmälan. Kontakta oss för att begära radering eller fråga om en viss post. Kopior i driftloggar eller säkerhetskopior kan följa separata lagringsrutiner hos leverantörerna."],
          },
          {
            id: "rights",
            title: "Dina val och rättigheter",
            paragraphs: ["Mejla he.ma@ntnui.no för att begära tillgång till, rättelse eller radering av dina uppgifter, eller begränsning av behandlingen. När det är tillämpligt kan du få uppgifter som du lämnat enligt ett avtal eller samtycke i ett portabelt format. Du kan invända mot behandling som grundar sig på berättigade intressen och återkalla ditt samtycke till kakor i Kakinställningar. Rättigheterna har lagstadgade villkor; vi kan behöva uppgifter för att bekräfta din identitet. Du kan klaga hos Datatilsynet."],
            links: [{ label: "Kontakta eller klaga hos Datatilsynet", href: "https://www.datatilsynet.no/om-datatilsynet/kontakt-oss/" }],
          },
        ],
      },
      cookies: {
        title: "Kakor och dina val",
        description: "Välj om webbplatsen ska komma ihåg ditt språk och utseende.",
        sections: [
          {
            id: "preferences",
            title: "Valfria inställningskakor",
            paragraphs: [
              "Med ditt tillstånd sparar ntnui_locale ditt språk och ntnui_theme ditt ljusa/mörka utseende i upp till 180 dagar. Dessa förstapartskakor innehåller din valda inställning, inte dina anmälningsuppgifter. De sparas först när du tillåter inställningskakor.",
              "Om du nekar eller återkallar ditt tillstånd raderas dessa inställningskakor. Språk- och utseendekontrollerna fungerar fortfarande under ditt aktuella besök. Öppna Kakinställningar när som helst för att ändra ditt val.",
            ],
          },
          {
            id: "choice",
            title: "Så kommer vi ihåg ditt val av kakor",
            paragraphs: ["Den nödvändiga förstapartskakan ntnui_cookie_preferences sparar v1.accepted eller v1.rejected i upp till 180 dagar. Den kommer ihåg ditt beslut så att vi kan följa det. När den löper ut frågar vi igen. Du kan också radera kakor i din webbläsare; om du raderar den här kakan återställs ditt sparade beslut."],
          },
          {
            id: "security",
            title: "Säkerhet och andra webbplatser",
            paragraphs: [
              "Cloudflare Turnstile utför säkerhetskontroller på formulär. Tjänsten returnerar normalt en engångstoken. Om förhandsgodkännande är aktiverat i Cloudflare kan den också sätta cf_clearance; livslängden beror på konfigurationen. Kontakta oss för information om säkerhetslagring i den aktiva tjänsten.",
              "Den här webbplatsen innehåller ingen reklamspårning eller besöksanalys. Länkar till Discord, MazeMap och medlemskap öppnar andra webbplatser i stället för inbäddade tjänster. Deras val för kakor gäller när du besöker dem.",
            ],
            links: [{ label: "Cloudflares integritetstillägg för Turnstile", href: "https://www.cloudflare.com/turnstile-privacy-policy/" }],
          },
        ],
      },
      "website-info": {
        title: "Om webbplatsen",
        description: "Så använder du NTNUI Bordtennis träningswebbplats och får hjälp.",
        sections: [
          {
            id: "using-the-site",
            title: "Anmälan och avanmälan",
            paragraphs: ["Använd dina egna uppgifter och avanmäl dig när du inte kan delta. En bekräftad anmälan reserverar en träningsplats; en plats på väntelistan gör inte det. Kontrollera din status innan du kommer. Information om pass och antal platser kan ändras, så se det aktuella schemat och klubbens meddelanden."],
          },
          {
            id: "membership",
            title: "Medlemskap och externa tjänster",
            paragraphs: ["Träningsanmälan är separat från NTNUI-medlemskap. Följ medlemslänken för medlemskrav och betalning. Den här webbplatsen tar inte emot betalningar. Discord, medlems- och karttjänster har egna villkor och egen integritetsinformation."],
          },
          {
            id: "help",
            title: "Kontakt och tillgänglighet",
            paragraphs: ["Webbplatsen drivs av NTNUI Bordtennis. Kontakta vice ordförande He You Ma på he.ma@ntnui.no med frågor om webbplatsen eller integritet. Om en sida eller ett formulär är svårt att använda, berätta vilken sida det gäller och vad som hände så att vi kan hjälpa dig och förbättra den."],
          },
        ],
      },
    },
  },
  de: {
    navLabel: "Datenschutz und Website-Informationen",
    privacy: "Datenschutz",
    cookies: "Cookies",
    websiteInfo: "Über die Website",
    cookieSettings: "Cookie-Einstellungen",
    updated: "Zuletzt aktualisiert",
    contact: "He You Ma kontaktieren",
    registerNotice: "Wir verwenden deinen Namen, dein Spielniveau sowie Geburtsmonat und -tag, um deine Anmeldung zu verwalten. Dein Name ist in Teilnehmer- und Abmeldelisten öffentlich sichtbar, auch wenn du auf der Warteliste stehst. Deine Geburtsangaben sind nicht öffentlich. Lies vor der Anmeldung, wie wir deine Daten verwenden und aufbewahren.",
    unregisterNotice: "Wir vergleichen deinen Geburtsmonat und -tag mit deiner Anmeldung, um deine Abmeldung zu prüfen. Eine erfolgreiche Abmeldung entfernt diese Anmeldung aus der aktiven Datenbank.",
    readPrivacy: "Datenschutzhinweise lesen",
    turnstileNotice: "Cloudflare Turnstile prüft Browser- und Verbindungsinformationen, um dieses Formular vor Bots zu schützen. Siehe den Datenschutzzusatz für Cloudflare Turnstile.",
    pages: {
      privacy: {
        title: "Datenschutzhinweise",
        description: "So verwendet NTNUI Bordtennis Daten, wenn du die Website besuchst und dich zum Training anmeldest.",
        sections: [
          {
            id: "contact",
            title: "Wer diese Website betreibt",
            paragraphs: ["NTNUI Bordtennis, eine Untergruppe von NTNUI, betreibt diese Website. Bei Fragen oder Anliegen zum Datenschutz wende dich an den stellvertretenden Vorsitzenden He You Ma unter he.ma@ntnui.no."],
          },
          {
            id: "signup-data",
            title: "Trainingsanmeldungen",
            paragraphs: [
              "Wir speichern deinen Namen, das gewählte Spielniveau, Geburtsmonat und -tag, die gewählte Trainingseinheit, den Anmeldezeitpunkt sowie den Status als bestätigt oder auf der Warteliste. Name, Spielniveau sowie Geburtsmonat und -tag sind für die Online-Anmeldung erforderlich. Wir fragen nicht nach deinem Geburtsjahr. Geburtsangaben helfen, Anmeldungen zu unterscheiden und Abmeldungen zu prüfen; das Spielniveau hilft bei der Organisation des Trainings.",
              "Für Trainingseinheiten nur für Mitglieder musst du deine Mitgliedschaft bestätigen. Diese Website registriert keine Mitgliedschaften und nimmt keine Mitgliedsbeiträge entgegen. Ältere Abmeldeanfragen können einen übermittelten Namen, eine Nachricht und den Zeitpunkt der Anfrage enthalten.",
            ],
          },
          {
            id: "visibility",
            title: "Was andere sehen können",
            paragraphs: ["Dein Name ist für Website-Besucher in Teilnehmer- und Abmeldelisten sichtbar. Namen auf der Warteliste sind ebenfalls in der Abmeldeliste sichtbar. Geburtsmonat und -tag werden nicht öffentlich angezeigt. Berechtigte Administratoren können auf Anmeldedaten zugreifen, um Trainingseinheiten zu organisieren und Anfragen zu bearbeiten. Kontaktiere uns, wenn die öffentliche Anzeige deines Namens dich an der Online-Anmeldung hindert."],
          },
          {
            id: "purposes",
            title: "Warum wir diese Daten verwenden",
            paragraphs: [
              "Wir verwenden Anmeldedaten, um die von dir gewünschte Trainingsreservierung bereitzustellen, einschließlich Plätzen, Wartelisten und Abmeldungen (DSGVO Artikel 6 Absatz 1 Buchstabe b). Unsere berechtigten Interessen an der Organisation von Trainingseinheiten, der Zuordnung von Anmeldungen durch die Teilnehmenden und dem Schutz von Formularen bilden die Grundlage für die Anzeige von Teilnehmerlisten und die Verhinderung von Missbrauch (Artikel 6 Absatz 1 Buchstabe f). Du kannst der Verarbeitung auf Grundlage berechtigter Interessen widersprechen und Informationen zu unserer Interessenabwägung anfordern.",
              "Optionale Einstellungs-Cookies beruhen auf deiner Einwilligung. Wir verwenden Anmeldedaten nicht für Werbung. Die Angabe von Daten ist freiwillig, aber die Pflichtfelder werden benötigt, um eine Online-Anmeldung abzuschließen.",
            ],
          },
          {
            id: "providers",
            title: "Hosting und Formularschutz",
            paragraphs: [
              "Die Website verwendet Heroku für das Hosting und eine PostgreSQL-Datenbank. Beim Hosting werden Anfragen und technische Verbindungsinformationen verarbeitet. Cloudflare Turnstile verarbeitet IP-Adressen und Browser-/Sicherheitssignale zur Erkennung von Bots; es erhält weder den Namen noch das Spielniveau oder die Geburtsangaben, die in das Formular eingegeben werden.",
              "Cloudflare handelt als Auftragsverarbeiter für unseren Formularschutz und als eigenständiger Verantwortlicher bei der Verbesserung von Turnstile. Anbieter können Daten außerhalb des EWR verarbeiten. Kontaktiere uns für Informationen zu den Standorten, geltenden Übermittlungsgarantien und Aufbewahrungsregelungen der Anbieter.",
            ],
            links: [{ label: "Datenschutzzusatz für Cloudflare Turnstile", href: "https://www.cloudflare.com/turnstile-privacy-policy/" }],
          },
          {
            id: "retention",
            title: "Wie lange Daten gespeichert bleiben",
            paragraphs: ["Wenn du dich abmeldest, wird diese Anmeldung aus der aktiven Datenbank entfernt. Andernfalls bleiben Datensätze bestehen, bis ein Administrator sie entfernt. Derzeit werden vergangene Anmeldungen oder ältere Abmeldeanfragen nicht automatisch nach einer festgelegten Zeit gelöscht. Kontaktiere uns, um die Löschung anzufordern oder nach einem bestimmten Datensatz zu fragen. Kopien in Hosting-Protokollen oder Sicherungskopien können gesonderten Aufbewahrungsregelungen der Anbieter unterliegen."],
          },
          {
            id: "rights",
            title: "Deine Wahlmöglichkeiten und Rechte",
            paragraphs: ["Schreibe an he.ma@ntnui.no, um Auskunft, Berichtigung, Löschung oder Einschränkung der Verarbeitung deiner Daten zu verlangen. Soweit anwendbar, kannst du Daten, die du auf Grundlage eines Vertrags oder einer Einwilligung bereitgestellt hast, in einem übertragbaren Format erhalten. Du kannst der Verarbeitung auf Grundlage berechtigter Interessen widersprechen und deine Cookie-Einwilligung in den Cookie-Einstellungen widerrufen. Für diese Rechte gelten gesetzliche Voraussetzungen; gegebenenfalls benötigen wir Informationen, um deine Identität zu prüfen. Du kannst dich bei Datatilsynet beschweren."],
            links: [{ label: "Datatilsynet kontaktieren oder Beschwerde einreichen", href: "https://www.datatilsynet.no/om-datatilsynet/kontakt-oss/" }],
          },
        ],
      },
      cookies: {
        title: "Cookies und deine Wahlmöglichkeiten",
        description: "Wähle, ob diese Website deine Sprache und Darstellung speichern soll.",
        sections: [
          {
            id: "preferences",
            title: "Optionale Einstellungs-Cookies",
            paragraphs: [
              "Mit deiner Erlaubnis speichert ntnui_locale deine Sprache und ntnui_theme die helle/dunkle Darstellung für bis zu 180 Tage. Diese Erstanbieter-Cookies enthalten die gewählte Einstellung, nicht deine Anmeldedaten. Sie werden erst gespeichert, nachdem du Einstellungs-Cookies erlaubt hast.",
              "Wenn du die Erlaubnis ablehnst oder widerrufst, werden diese Einstellungs-Cookies gelöscht. Die Sprach- und Darstellungsauswahl funktioniert weiterhin während deines aktuellen Besuchs. Öffne jederzeit die Cookie-Einstellungen, um deine Wahl zu ändern.",
            ],
          },
          {
            id: "choice",
            title: "Speicherung deiner Cookie-Entscheidung",
            paragraphs: ["Das notwendige Erstanbieter-Cookie ntnui_cookie_preferences speichert v1.accepted oder v1.rejected für bis zu 180 Tage. Es merkt sich deine Entscheidung, damit wir sie umsetzen können. Wenn es abläuft, fragen wir erneut. Du kannst Cookies auch in deinem Browser löschen; das Löschen dieses Cookies setzt deine gespeicherte Entscheidung zurück."],
          },
          {
            id: "security",
            title: "Sicherheit und andere Websites",
            paragraphs: [
              "Cloudflare Turnstile führt Sicherheitsprüfungen bei Formularen durch. Normalerweise gibt der Dienst einen einmal verwendbaren Token zurück. Wenn die Vorabfreigabe in Cloudflare aktiviert ist, kann er auch cf_clearance setzen; dessen Gültigkeitsdauer hängt von dieser Konfiguration ab. Kontaktiere uns für Informationen zur sicherheitsbezogenen Speicherung im aktiven Dienst.",
              "Diese Website enthält kein Werbe- oder Besucheranalyse-Tracking. Links zu Discord, MazeMap und zur Mitgliedschaft öffnen andere Websites und sind keine eingebetteten Dienste. Deren Cookie-Einstellungen gelten, wenn du sie besuchst.",
            ],
            links: [{ label: "Datenschutzzusatz für Cloudflare Turnstile", href: "https://www.cloudflare.com/turnstile-privacy-policy/" }],
          },
        ],
      },
      "website-info": {
        title: "Über die Website",
        description: "So nutzt du die Trainingswebsite von NTNUI Bordtennis und erhältst Hilfe.",
        sections: [
          {
            id: "using-the-site",
            title: "Anmeldung und Abmeldung",
            paragraphs: ["Verwende deine eigenen Angaben und melde dich ab, wenn du nicht teilnehmen kannst. Eine bestätigte Anmeldung reserviert einen Trainingsplatz; ein Platz auf der Warteliste tut dies nicht. Prüfe deinen Status, bevor du zum Training kommst. Angaben zu Trainingseinheiten und Kapazitäten können sich ändern. Beachte daher den aktuellen Trainingsplan und die Mitteilungen des Vereins."],
          },
          {
            id: "membership",
            title: "Mitgliedschaft und externe Dienste",
            paragraphs: ["Die Trainingsanmeldung ist von der NTNUI-Mitgliedschaft getrennt. Folge dem Mitgliedschaftslink für Mitgliedschaftsvoraussetzungen und Zahlung. Diese Website nimmt keine Zahlungen entgegen. Discord, Mitgliedschafts- und Kartendienste haben eigene Bedingungen und Datenschutzhinweise."],
          },
          {
            id: "help",
            title: "Kontakt und Barrierefreiheit",
            paragraphs: ["Die Website wird von NTNUI Bordtennis betrieben. Wende dich bei Fragen zur Website oder zum Datenschutz an den stellvertretenden Vorsitzenden He You Ma unter he.ma@ntnui.no. Wenn eine Seite oder ein Formular schwer zu bedienen ist, teile uns mit, welche Seite betroffen ist und was passiert ist, damit wir helfen und sie verbessern können."],
          },
        ],
      },
    },
  },
  zh: {
    navLabel: "隐私与网站信息",
    privacy: "隐私",
    cookies: "Cookie",
    websiteInfo: "网站信息",
    cookieSettings: "Cookie 设置",
    updated: "最后更新",
    contact: "联系 He You Ma",
    registerNotice: "我们使用你的姓名、打球水平以及出生月份和日期来管理报名。你的姓名会公开显示在参加者名单和取消报名名单中，包括你在候补名单中的情况。出生信息不会公开。请在报名前阅读我们如何使用和保存你的信息。",
    unregisterNotice: "我们会将你的出生月份和日期与报名信息进行比对，以核验取消报名的请求。取消成功后，该报名记录将从当前使用的数据库中删除。",
    readPrivacy: "阅读隐私声明",
    turnstileNotice: "Cloudflare Turnstile 会检查浏览器和连接信息，保护此表单免受机器人的滥用。请参阅 Cloudflare Turnstile 隐私附录。",
    pages: {
      privacy: {
        title: "隐私声明",
        description: "NTNUI Bordtennis 如何在你访问网站和报名训练时使用信息。",
        sections: [
          {
            id: "contact",
            title: "网站运营方",
            paragraphs: ["本网站由 NTNUI 下属的 NTNUI Bordtennis 运营。如有隐私问题或相关请求，请通过 he.ma@ntnui.no 联系副主席 He You Ma。"],
          },
          {
            id: "signup-data",
            title: "训练报名",
            paragraphs: [
              "我们保存你的姓名、所选打球水平、出生月份和日期、所选训练场次、报名时间以及已确认或候补状态。在线报名必须填写姓名、打球水平以及出生月份和日期。我们不会询问你的出生年份。出生信息有助于区分报名记录和核验取消报名的请求；打球水平有助于组织训练。",
              "对于仅限会员参加的训练，你必须确认会员身份。本网站不办理会员注册，也不收取会费。旧的取消报名请求记录可能包含提交的姓名、留言和请求时间。",
            ],
          },
          {
            id: "visibility",
            title: "其他人可以看到什么",
            paragraphs: ["网站访客可以在参加者名单和取消报名名单中看到你的姓名。候补人员的姓名也会显示在取消报名名单中。出生月份和日期不会公开显示。获授权的管理员可以访问报名信息，以组织训练和处理请求。如果公开显示姓名妨碍你使用在线报名，请联系我们。"],
          },
          {
            id: "purposes",
            title: "我们为何使用这些信息",
            paragraphs: [
              "我们使用报名信息来提供你所请求的训练预约服务，包括名额、候补名单和取消报名（《通用数据保护条例》GDPR 第 6 条第 1 款 b 项）。我们在组织训练、帮助参加者识别自己的报名记录以及保护表单方面的合法利益，是显示参加者名单和防止滥用的依据（第 6 条第 1 款 f 项）。你可以反对基于合法利益的数据处理，并要求了解我们的利益权衡评估。",
              "可选偏好 Cookie 以你的同意为依据。我们不会将报名信息用于广告。提供信息是自愿的，但完成在线报名需要填写必填字段。",
            ],
          },
          {
            id: "providers",
            title: "托管与表单保护",
            paragraphs: [
              "本网站使用 Heroku 托管和 PostgreSQL 数据库。托管涉及处理请求及技术连接信息。Cloudflare Turnstile 会处理 IP 地址和浏览器／安全信号，以检测机器人；它不会接收你在表单中填写的姓名、打球水平或出生信息。",
              "Cloudflare 在提供表单保护时作为我们的数据处理者，在改进 Turnstile 时作为独立的数据控制者。服务提供商可能在欧洲经济区以外处理信息。如需了解处理地点、适用的数据传输保障措施和服务提供商的数据保留安排，请联系我们。",
            ],
            links: [{ label: "Cloudflare Turnstile 隐私附录", href: "https://www.cloudflare.com/turnstile-privacy-policy/" }],
          },
          {
            id: "retention",
            title: "信息保存多久",
            paragraphs: ["取消报名会将该报名记录从当前使用的数据库中删除。其他记录会保留，直到管理员将其删除。目前，过去的报名记录或旧的取消报名请求不会在固定期限后自动删除。如需请求删除或询问某条记录，请联系我们。托管日志或备份中的副本可能适用服务提供商另外的数据保留安排。"],
          },
          {
            id: "rights",
            title: "你的选择与权利",
            paragraphs: ["你可以发送邮件至 he.ma@ntnui.no，请求访问、更正、删除你的信息或限制对其的处理。在适用情况下，你可以以可携带的格式获取基于合同或同意而提供的数据。你可以反对基于合法利益的数据处理，并在 Cookie 设置中撤回对 Cookie 的同意。这些权利须满足法律规定的条件；我们可能需要相关信息来核实你的身份。你可以向 Datatilsynet 投诉。"],
            links: [{ label: "联系 Datatilsynet 或向其投诉", href: "https://www.datatilsynet.no/om-datatilsynet/kontakt-oss/" }],
          },
        ],
      },
      cookies: {
        title: "Cookie 与你的选择",
        description: "选择是否让本网站记住你的语言和外观偏好。",
        sections: [
          {
            id: "preferences",
            title: "可选偏好 Cookie",
            paragraphs: [
              "经你允许，ntnui_locale 保存你的语言选择，ntnui_theme 保存你的浅色／深色外观选择，最长保存 180 天。这些第一方 Cookie 包含你所选的设置，不包含报名详情。只有在你允许偏好 Cookie 后，它们才会被保存。",
              "拒绝或撤回许可会清除这些偏好 Cookie。语言和外观控件仍可在本次访问期间使用。你可以随时打开 Cookie 设置，更改选择。",
            ],
          },
          {
            id: "choice",
            title: "记住你的 Cookie 选择",
            paragraphs: ["必要的第一方 Cookie ntnui_cookie_preferences 会保存 v1.accepted 或 v1.rejected，最长保存 180 天。它会记住你的决定，以便我们按此执行。过期后，我们会再次询问。你的浏览器也允许删除 Cookie；删除此 Cookie 会重置已保存的决定。"],
          },
          {
            id: "security",
            title: "安全与其他网站",
            paragraphs: [
              "Cloudflare Turnstile 会对表单执行安全检查，通常返回一个一次性令牌。如果 Cloudflare 中启用了预先放行，它也可能设置 cf_clearance；其有效期取决于该配置。如需了解线上服务中用于安全目的的存储详情，请联系我们。",
              "本网站不包含广告追踪或访客分析追踪。Discord、MazeMap 和会员链接会打开其他网站，而不是嵌入式服务。你访问这些网站时，适用其各自的 Cookie 选择。",
            ],
            links: [{ label: "Cloudflare Turnstile 隐私附录", href: "https://www.cloudflare.com/turnstile-privacy-policy/" }],
          },
        ],
      },
      "website-info": {
        title: "网站信息",
        description: "如何使用 NTNUI Bordtennis 训练网站并获取帮助。",
        sections: [
          {
            id: "using-the-site",
            title: "报名与取消报名",
            paragraphs: ["请使用你自己的信息，并在无法参加时取消报名。已确认的报名会预留一个训练名额；加入候补名单则不会。参加前请查看你的状态。训练信息和名额可能发生变化，请查看最新训练安排和俱乐部通知。"],
          },
          {
            id: "membership",
            title: "会员资格与外部服务",
            paragraphs: ["训练报名与 NTNUI 会员资格是分开的。请通过会员链接查看会员要求和付款事宜。本网站不收款。Discord、会员服务和地图服务有各自的条款和隐私信息。"],
          },
          {
            id: "help",
            title: "联系与无障碍使用",
            paragraphs: ["本网站由 NTNUI Bordtennis 运营。如有网站或隐私问题，请通过 he.ma@ntnui.no 联系副主席 He You Ma。如果某个页面或表单难以使用，请告诉我们具体页面及发生的情况，以便我们提供帮助并进行改进。"],
          },
        ],
      },
    },
  },
  fr: {
    navLabel: "Confidentialité et informations sur le site",
    privacy: "Confidentialité",
    cookies: "Cookies",
    websiteInfo: "À propos du site",
    cookieSettings: "Paramètres des cookies",
    updated: "Dernière mise à jour",
    contact: "Contacter He You Ma",
    registerNotice: "Nous utilisons ton nom, ton niveau de jeu ainsi que ton mois et ton jour de naissance pour gérer ton inscription. Ton nom est public dans les listes de participants et de désinscription, y compris lorsque tu es sur liste d’attente. Tes informations de naissance ne sont pas publiques. Lis comment nous utilisons et conservons tes informations avant de t’inscrire.",
    unregisterNotice: "Nous comparons ton mois et ton jour de naissance avec ton inscription pour vérifier ta désinscription. Une désinscription réussie supprime cette inscription de la base de données active.",
    readPrivacy: "Lire la notice de confidentialité",
    turnstileNotice: "Cloudflare Turnstile vérifie des informations sur le navigateur et la connexion pour protéger ce formulaire contre les robots. Consulte l’avenant de confidentialité de Cloudflare Turnstile.",
    pages: {
      privacy: {
        title: "Notice de confidentialité",
        description: "Comment NTNUI Bordtennis utilise les informations lorsque tu visites le site et t’inscris aux entraînements.",
        sections: [
          {
            id: "contact",
            title: "Qui exploite ce site",
            paragraphs: ["NTNUI Bordtennis, un sous-groupe de NTNUI, exploite ce site. Pour toute question ou demande relative à la confidentialité, contacte le vice-président He You Ma à he.ma@ntnui.no."],
          },
          {
            id: "signup-data",
            title: "Inscriptions aux entraînements",
            paragraphs: [
              "Nous conservons ton nom, le niveau de jeu choisi, ton mois et ton jour de naissance, la séance choisie, l’heure d’inscription et le statut confirmé ou sur liste d’attente. Le nom, le niveau de jeu ainsi que le mois et le jour de naissance sont nécessaires pour s’inscrire en ligne. Nous ne demandons pas ton année de naissance. Les informations de naissance permettent de distinguer les inscriptions et de vérifier les désinscriptions ; le niveau de jeu aide à organiser l’entraînement.",
              "Pour les séances réservées aux membres, tu dois confirmer ton adhésion. Ce site n’enregistre pas les adhésions et n’encaisse pas les cotisations. D’anciennes demandes de désinscription peuvent contenir un nom transmis, un message et l’heure de la demande.",
            ],
          },
          {
            id: "visibility",
            title: "Ce que les autres peuvent voir",
            paragraphs: ["Ton nom est visible par les visiteurs dans les listes de participants et de désinscription. Les noms sur liste d’attente sont également visibles dans la liste de désinscription. Le mois et le jour de naissance ne sont pas affichés publiquement. Les administrateurs autorisés peuvent accéder aux informations d’inscription pour organiser les séances et traiter les demandes. Contacte-nous si l’affichage public de ton nom t’empêche de t’inscrire en ligne."],
          },
          {
            id: "purposes",
            title: "Pourquoi nous utilisons ces informations",
            paragraphs: [
              "Nous utilisons les informations d’inscription pour fournir la réservation d’entraînement que tu demandes, notamment les places, les listes d’attente et les désinscriptions (article 6, paragraphe 1, point b du RGPD). Nos intérêts légitimes à organiser les séances, à aider les participants à identifier leur inscription et à protéger les formulaires fondent l’affichage des listes de participants et la prévention des abus (article 6, paragraphe 1, point f). Tu peux t’opposer au traitement fondé sur des intérêts légitimes et demander des informations sur notre mise en balance des intérêts.",
              "Les cookies de préférences facultatifs reposent sur ton consentement. Nous n’utilisons pas les informations d’inscription à des fins publicitaires. Fournir des informations est volontaire, mais les champs obligatoires sont nécessaires pour finaliser une inscription en ligne.",
            ],
          },
          {
            id: "providers",
            title: "Hébergement et protection des formulaires",
            paragraphs: [
              "Le site utilise l’hébergement Heroku et une base de données PostgreSQL. L’hébergement implique le traitement des requêtes et d’informations techniques de connexion. Cloudflare Turnstile traite les adresses IP et des signaux de navigateur et de sécurité pour détecter les robots ; il ne reçoit pas le nom, le niveau de jeu ni les informations de naissance saisis dans le formulaire.",
              "Cloudflare agit comme sous-traitant pour la protection de nos formulaires et comme responsable de traitement distinct lorsqu’il améliore Turnstile. Les prestataires peuvent traiter des informations hors de l’EEE. Contacte-nous pour connaître les lieux de traitement, les garanties de transfert applicables et les modalités de conservation des prestataires.",
            ],
            links: [{ label: "Avenant de confidentialité de Cloudflare Turnstile", href: "https://www.cloudflare.com/turnstile-privacy-policy/" }],
          },
          {
            id: "retention",
            title: "Durée de conservation des informations",
            paragraphs: ["Une désinscription supprime l’inscription concernée de la base de données active. Sinon, les enregistrements restent conservés jusqu’à leur suppression par un administrateur. Il n’existe actuellement aucune suppression automatique après un délai défini des inscriptions passées ou des anciennes demandes de désinscription. Contacte-nous pour demander une suppression ou te renseigner sur un enregistrement précis. Les copies dans les journaux d’hébergement ou les sauvegardes peuvent suivre des modalités de conservation distinctes propres aux prestataires."],
          },
          {
            id: "rights",
            title: "Tes choix et tes droits",
            paragraphs: ["Écris à he.ma@ntnui.no pour demander l’accès, la rectification, la suppression ou la limitation du traitement de tes informations. Lorsque cela s’applique, tu peux recevoir dans un format portable les données fournies dans le cadre d’un contrat ou d’un consentement. Tu peux t’opposer au traitement fondé sur des intérêts légitimes et retirer ton consentement aux cookies dans les Paramètres des cookies. Ces droits sont soumis à des conditions légales ; nous pouvons avoir besoin d’informations pour vérifier ton identité. Tu peux déposer une réclamation auprès de Datatilsynet."],
            links: [{ label: "Contacter Datatilsynet ou déposer une réclamation", href: "https://www.datatilsynet.no/om-datatilsynet/kontakt-oss/" }],
          },
        ],
      },
      cookies: {
        title: "Cookies et tes choix",
        description: "Choisis si ce site doit mémoriser ta langue et ton apparence préférées.",
        sections: [
          {
            id: "preferences",
            title: "Cookies de préférences facultatifs",
            paragraphs: [
              "Avec ton autorisation, ntnui_locale mémorise ta langue et ntnui_theme ton apparence claire ou sombre pendant une durée maximale de 180 jours. Ces cookies propriétaires contiennent le réglage choisi, pas tes informations d’inscription. Ils ne sont enregistrés qu’après ton autorisation des cookies de préférences.",
              "Refuser ou retirer ton autorisation efface ces cookies de préférences. Les commandes de langue et d’apparence fonctionnent toujours pendant ta visite en cours. Ouvre les Paramètres des cookies à tout moment pour modifier ton choix.",
            ],
          },
          {
            id: "choice",
            title: "Mémorisation de ton choix de cookies",
            paragraphs: ["Le cookie propriétaire nécessaire ntnui_cookie_preferences enregistre v1.accepted ou v1.rejected pendant une durée maximale de 180 jours. Il mémorise ta décision pour que nous puissions l’appliquer. À son expiration, nous te redemandons ton choix. Ton navigateur permet aussi de supprimer les cookies ; supprimer ce cookie réinitialise ta décision enregistrée."],
          },
          {
            id: "security",
            title: "Sécurité et autres sites",
            paragraphs: [
              "Cloudflare Turnstile effectue des vérifications de sécurité sur les formulaires. Il renvoie normalement un jeton à usage unique. Si la préautorisation est activée dans Cloudflare, il peut aussi définir cf_clearance ; sa durée de vie dépend de cette configuration. Contacte-nous pour connaître les détails du stockage de sécurité utilisé par le service en production.",
              "Ce site n’inclut aucun suivi publicitaire ni suivi d’analyse des visiteurs. Les liens Discord, MazeMap et d’adhésion ouvrent d’autres sites plutôt que des services intégrés. Leurs choix de cookies s’appliquent lorsque tu les visites.",
            ],
            links: [{ label: "Avenant de confidentialité de Cloudflare Turnstile", href: "https://www.cloudflare.com/turnstile-privacy-policy/" }],
          },
        ],
      },
      "website-info": {
        title: "À propos du site",
        description: "Utiliser le site d’entraînement de NTNUI Bordtennis et obtenir de l’aide.",
        sections: [
          {
            id: "using-the-site",
            title: "Inscription et désinscription",
            paragraphs: ["Utilise tes propres informations et désinscris-toi lorsque tu ne peux pas venir. Une inscription confirmée réserve une place à l’entraînement ; l’entrée sur liste d’attente ne le fait pas. Vérifie ton statut avant de venir. Les informations sur les séances et leur capacité peuvent changer ; consulte donc le calendrier actuel et les annonces du club."],
          },
          {
            id: "membership",
            title: "Adhésion et services externes",
            paragraphs: ["L’inscription à l’entraînement est distincte de l’adhésion à NTNUI. Suis le lien d’adhésion pour connaître les conditions et effectuer le paiement. Ce site n’encaisse aucun paiement. Discord, les services d’adhésion et de cartes ont leurs propres conditions et informations de confidentialité."],
          },
          {
            id: "help",
            title: "Contact et accessibilité",
            paragraphs: ["Le site est exploité par NTNUI Bordtennis. Contacte le vice-président He You Ma à he.ma@ntnui.no pour toute question sur le site ou la confidentialité. Si une page ou un formulaire est difficile à utiliser, indique-nous la page et ce qui s’est passé pour que nous puissions t’aider et l’améliorer."],
          },
        ],
      },
    },
  },
  es: {
    navLabel: "Privacidad e información del sitio web",
    privacy: "Privacidad",
    cookies: "Cookies",
    websiteInfo: "Sobre el sitio web",
    cookieSettings: "Configuración de cookies",
    updated: "Última actualización",
    contact: "Contactar con He You Ma",
    registerNotice: "Usamos tu nombre, nivel de juego y mes y día de nacimiento para gestionar tu inscripción. Tu nombre es público en las listas de participantes y de cancelación, incluso cuando estás en la lista de espera. Tus datos de nacimiento no son públicos. Lee cómo usamos y conservamos tu información antes de inscribirte.",
    unregisterNotice: "Comparamos tu mes y día de nacimiento con tu inscripción para comprobar tu cancelación. Una cancelación completada elimina esa inscripción de la base de datos activa.",
    readPrivacy: "Leer el aviso de privacidad",
    turnstileNotice: "Cloudflare Turnstile comprueba información del navegador y de la conexión para proteger este formulario de los bots. Consulta el anexo de privacidad de Cloudflare Turnstile.",
    pages: {
      privacy: {
        title: "Aviso de privacidad",
        description: "Cómo usa NTNUI Bordtennis la información cuando visitas el sitio y te inscribes en los entrenamientos.",
        sections: [
          {
            id: "contact",
            title: "Quién gestiona este sitio web",
            paragraphs: ["NTNUI Bordtennis, un subgrupo de NTNUI, gestiona este sitio web. Si tienes preguntas o solicitudes sobre privacidad, contacta con el vicepresidente He You Ma en he.ma@ntnui.no."],
          },
          {
            id: "signup-data",
            title: "Inscripciones a entrenamientos",
            paragraphs: [
              "Guardamos tu nombre, nivel de juego seleccionado, mes y día de nacimiento, sesión elegida, hora de inscripción y estado confirmado o en lista de espera. El nombre, el nivel de juego y el mes y día de nacimiento son necesarios para inscribirse en línea. No pedimos tu año de nacimiento. Los datos de nacimiento ayudan a distinguir las inscripciones y comprobar las cancelaciones; el nivel de juego ayuda a organizar los entrenamientos.",
              "Para las sesiones exclusivas para socios, debes confirmar tu condición de socio. Este sitio no tramita altas de socios ni cobra cuotas. Los registros antiguos de solicitudes de cancelación pueden contener un nombre enviado, un mensaje y la hora de la solicitud.",
            ],
          },
          {
            id: "visibility",
            title: "Qué pueden ver otras personas",
            paragraphs: ["Tu nombre es visible para los visitantes del sitio en las listas de participantes y de cancelación. Los nombres de la lista de espera también son visibles en la lista de cancelación. El mes y el día de nacimiento no se muestran públicamente. Los administradores autorizados pueden acceder a la información de inscripción para organizar sesiones y resolver solicitudes. Contacta con nosotros si la publicación de tu nombre te impide inscribirte en línea."],
          },
          {
            id: "purposes",
            title: "Por qué usamos esta información",
            paragraphs: [
              "Usamos la información de inscripción para proporcionar la reserva de entrenamiento que solicitas, incluidas las plazas, las listas de espera y las cancelaciones (artículo 6, apartado 1, letra b del RGPD). Nuestros intereses legítimos en organizar sesiones, ayudar a los participantes a identificar su inscripción y proteger los formularios fundamentan la publicación de las listas de participantes y la prevención de abusos (artículo 6, apartado 1, letra f). Puedes oponerte al tratamiento basado en intereses legítimos y solicitar información sobre nuestra ponderación de intereses.",
              "Las cookies opcionales de preferencias se basan en tu consentimiento. No usamos la información de inscripción para publicidad. Facilitar información es voluntario, pero los campos obligatorios son necesarios para completar una inscripción en línea.",
            ],
          },
          {
            id: "providers",
            title: "Alojamiento y protección de formularios",
            paragraphs: [
              "El sitio usa alojamiento de Heroku y una base de datos PostgreSQL. El alojamiento implica el tratamiento de solicitudes e información técnica de conexión. Cloudflare Turnstile trata direcciones IP y señales del navegador y de seguridad para detectar bots; no recibe el nombre, el nivel de juego ni los datos de nacimiento introducidos en el formulario.",
              "Cloudflare actúa como encargado del tratamiento para la protección de nuestros formularios y como responsable independiente del tratamiento al mejorar Turnstile. Los proveedores pueden tratar información fuera del EEE. Contacta con nosotros para obtener detalles sobre las ubicaciones, las garantías de transferencia aplicables y los acuerdos de conservación de los proveedores.",
            ],
            links: [{ label: "Anexo de privacidad de Cloudflare Turnstile", href: "https://www.cloudflare.com/turnstile-privacy-policy/" }],
          },
          {
            id: "retention",
            title: "Cuánto tiempo se conserva la información",
            paragraphs: ["Al cancelar una inscripción, esta se elimina de la base de datos activa. En los demás casos, los registros permanecen hasta que un administrador los elimina. Actualmente no hay eliminación automática tras un plazo determinado de las inscripciones pasadas ni de las solicitudes antiguas de cancelación. Contacta con nosotros para solicitar la eliminación o preguntar por un registro concreto. Las copias en registros de alojamiento o copias de seguridad pueden seguir acuerdos de conservación distintos de los proveedores."],
          },
          {
            id: "rights",
            title: "Tus opciones y derechos",
            paragraphs: ["Escribe a he.ma@ntnui.no para solicitar acceso, rectificación, supresión o limitación del tratamiento de tu información. Cuando corresponda, puedes recibir en un formato portable los datos proporcionados en virtud de un contrato o consentimiento. Puedes oponerte al tratamiento basado en intereses legítimos y retirar tu consentimiento a las cookies en Configuración de cookies. Estos derechos están sujetos a condiciones legales; podemos necesitar información para verificar tu identidad. Puedes presentar una reclamación ante Datatilsynet."],
            links: [{ label: "Contactar con Datatilsynet o presentar una reclamación", href: "https://www.datatilsynet.no/om-datatilsynet/kontakt-oss/" }],
          },
        ],
      },
      cookies: {
        title: "Cookies y tus opciones",
        description: "Elige si este sitio recuerda tu idioma y apariencia.",
        sections: [
          {
            id: "preferences",
            title: "Cookies opcionales de preferencias",
            paragraphs: [
              "Con tu permiso, ntnui_locale guarda tu idioma y ntnui_theme tu apariencia clara u oscura durante un máximo de 180 días. Estas cookies propias contienen el ajuste elegido, no tus datos de inscripción. Solo se guardan después de que permitas las cookies de preferencias.",
              "Rechazar o retirar el permiso elimina estas cookies de preferencias. Los controles de idioma y apariencia siguen funcionando durante tu visita actual. Abre Configuración de cookies en cualquier momento para cambiar tu elección.",
            ],
          },
          {
            id: "choice",
            title: "Cómo recordamos tu elección de cookies",
            paragraphs: ["La cookie propia necesaria ntnui_cookie_preferences guarda v1.accepted o v1.rejected durante un máximo de 180 días. Recuerda tu decisión para que podamos aplicarla. Cuando caduca, volvemos a preguntar. Tu navegador también permite eliminar cookies; borrar esta cookie restablece tu decisión guardada."],
          },
          {
            id: "security",
            title: "Seguridad y otros sitios web",
            paragraphs: [
              "Cloudflare Turnstile realiza comprobaciones de seguridad en los formularios. Normalmente devuelve un token de un solo uso. Si la autorización previa está activada en Cloudflare, también puede establecer cf_clearance; su duración depende de esa configuración. Contacta con nosotros para obtener detalles sobre el almacenamiento de seguridad usado por el servicio en funcionamiento.",
              "Este sitio no incluye seguimiento publicitario ni seguimiento de análisis de visitantes. Los enlaces a Discord, MazeMap y a la afiliación abren otros sitios web en lugar de servicios integrados. Sus opciones de cookies se aplican cuando los visitas.",
            ],
            links: [{ label: "Anexo de privacidad de Cloudflare Turnstile", href: "https://www.cloudflare.com/turnstile-privacy-policy/" }],
          },
        ],
      },
      "website-info": {
        title: "Sobre el sitio web",
        description: "Cómo usar el sitio de entrenamientos de NTNUI Bordtennis y obtener ayuda.",
        sections: [
          {
            id: "using-the-site",
            title: "Inscripción y cancelación",
            paragraphs: ["Usa tus propios datos y cancela cuando no puedas asistir. Una inscripción confirmada reserva una plaza de entrenamiento; entrar en la lista de espera no la reserva. Comprueba tu estado antes de asistir. La información de las sesiones y su capacidad pueden cambiar, así que consulta el calendario actual y los anuncios del club."],
          },
          {
            id: "membership",
            title: "Afiliación y servicios externos",
            paragraphs: ["La inscripción al entrenamiento es independiente de la afiliación a NTNUI. Sigue el enlace de afiliación para consultar los requisitos y realizar el pago. Este sitio no acepta pagos. Discord, los servicios de afiliación y los mapas tienen sus propias condiciones e información de privacidad."],
          },
          {
            id: "help",
            title: "Contacto y accesibilidad",
            paragraphs: ["El sitio está gestionado por NTNUI Bordtennis. Contacta con el vicepresidente He You Ma en he.ma@ntnui.no si tienes preguntas sobre el sitio o la privacidad. Si una página o un formulario resulta difícil de usar, indícanos qué página es y qué ocurrió para que podamos ayudarte y mejorarlo."],
          },
        ],
      },
    },
  },
};
