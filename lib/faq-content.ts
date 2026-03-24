import { VENUE_LABEL, type Locale } from "@/lib/site-content";

export type FaqItem = {
  question: string;
  answer: string[];
  linkLabel?: string;
  linkHref?: string;
};

export type FaqSection = {
  id: "membership" | "equipment" | "training";
  title: string;
  description: string;
  items: FaqItem[];
};

export type FaqContent = {
  badge: string;
  title: string;
  intro: string;
  quickLinksTitle: string;
  sections: FaqSection[];
};

const NTNUI_URL = "https://ntnui.no/";

export const FAQ_BY_LOCALE: Record<Locale, FaqContent> = {
  no: {
    badge: "FAQ",
    title: "Ofte stilte spørsmål",
    intro:
      "Her finner du korte svar på vanlige spørsmål om medlemskap, utstyr og hvordan treningene fungerer.",
    quickLinksTitle: "Hopp til tema",
    sections: [
      {
        id: "membership",
        title: "Medlemskap og adgang",
        description: "Hvem som kan møte opp, og hva som kreves for å delta.",
        items: [
          {
            question: "Hvem kan delta på trening?",
            answer: [
              'For å trene må du være NTNUI-medlem og melde deg inn i NTNUI Bordtennis.',
              'Det eneste unntaket er treninger merket "åpen trening", der alle kan delta.',
            ],
          },
          {
            question: "Koster det noe å spille bordtennis i NTNUI?",
            answer: [
              "NTNUI Bordtennis har ingen egen treningsavgift.",
              "Det koster derimot å være NTNUI-medlem. Se ntnui.no for oppdatert informasjon om medlemskap og priser.",
            ],
            linkLabel: "Les mer på ntnui.no",
            linkHref: NTNUI_URL,
          },
          {
            question: "Hvor trener dere?",
            answer: [
              `Vi trener i ${VENUE_LABEL}.`,
              "Bruk MazeMap-knappen på nettsiden hvis du trenger veibeskrivelse.",
            ],
          },
        ],
      },
      {
        id: "equipment",
        title: "Utstyr",
        description: "Hva du bør ta med deg før trening.",
        items: [
          {
            question: "Må jeg ha egen racket?",
            answer: [
              "Klubben har et begrenset antall racketer til utlån.",
              "Ta med egen racket hvis du kan, så blir det lettere å sikre at alle får spilt.",
            ],
          },
          {
            question: "Hva bør jeg ta med på trening?",
            answer: [
              "Gode innesko er sterkt anbefalt.",
              "Ta også gjerne med treningstøy, vannflaske og egen racket hvis du har.",
            ],
          },
        ],
      },
      {
        id: "training",
        title: "Trening og påmelding",
        description: "Praktisk informasjon om nivå, venteliste og avmelding.",
        items: [
          {
            question: "Kan nybegynnere møte opp?",
            answer: [
              "Ja. Alle nivåer er velkomne, fra nybegynner til erfaren spiller.",
            ],
          },
          {
            question: "Hva skjer hvis en trening er full?",
            answer: [
              "Hvis alle plassene er tatt, blir du satt på venteliste.",
              "Hvis noen melder seg av, flyttes neste person på ventelisten inn automatisk.",
            ],
          },
          {
            question: "Hvordan melder jeg meg av?",
            answer: [
              "Gå til avmeldingssiden, velg økten og velg navnet ditt fra listen.",
              "For å bekrefte avmeldingen må fødselsmåned og fødselsdag stemme.",
            ],
          },
        ],
      },
    ],
  },
  en: {
    badge: "FAQ",
    title: "Frequently asked questions",
    intro:
      "Quick answers to common questions about membership, equipment, and how training sessions work.",
    quickLinksTitle: "Jump to section",
    sections: [
      {
        id: "membership",
        title: "Membership and access",
        description: "Who can attend, and what is required before showing up.",
        items: [
          {
            question: "Who can attend training?",
            answer: [
              "To train, you must be an NTNUI member and register as an NTNUI Table Tennis member.",
              'The only exception is sessions marked "åpen trening", where anyone can attend.',
            ],
          },
          {
            question: "Does table tennis cost anything?",
            answer: [
              "NTNUI Table Tennis does not have its own training fee.",
              "Being an NTNUI member does cost money. See ntnui.no for updated membership information and prices.",
            ],
            linkLabel: "More information at ntnui.no",
            linkHref: NTNUI_URL,
          },
          {
            question: "Where do you train?",
            answer: [
              `We train at ${VENUE_LABEL}.`,
              "Use the MazeMap button on the website if you need directions.",
            ],
          },
        ],
      },
      {
        id: "equipment",
        title: "Equipment",
        description: "What to bring before training starts.",
        items: [
          {
            question: "Do I need my own racket?",
            answer: [
              "The club has a limited number of rackets available to borrow.",
              "Bring your own racket if you can, since that makes it easier to ensure everyone gets to play.",
            ],
          },
          {
            question: "What should I bring to training?",
            answer: [
              "Good indoor training shoes are strongly recommended.",
              "You should also bring sports clothes, a water bottle, and your own racket if you have one.",
            ],
          },
        ],
      },
      {
        id: "training",
        title: "Training and registration",
        description: "Practical information about level, waiting list, and unregistering.",
        items: [
          {
            question: "Can beginners join?",
            answer: [
              "Yes. All levels are welcome, from complete beginners to experienced players.",
            ],
          },
          {
            question: "What happens if a session is full?",
            answer: [
              "If all spots are taken, you will be placed on the waiting list.",
              "If someone unregisters, the next person on the waiting list is promoted automatically.",
            ],
          },
          {
            question: "How do I unregister?",
            answer: [
              "Go to the unregister page, choose the session, and select your name from the list.",
              "To confirm the unregister action, your birth month and birth day must match.",
            ],
          },
        ],
      },
    ],
  },
  da: {
    badge: "FAQ",
    title: "Ofte stillede spørgsmål",
    intro:
      "Korte svar på almindelige spørgsmål om medlemskab, udstyr og hvordan træningerne fungerer.",
    quickLinksTitle: "Gå til emne",
    sections: [
      {
        id: "membership",
        title: "Medlemskab og adgang",
        description: "Hvem der kan møde op, og hvad der kræves for at deltage.",
        items: [
          {
            question: "Hvem kan deltage i træning?",
            answer: [
              "For at træne skal du være NTNUI-medlem og melde dig ind i NTNUI Bordtennis.",
              'Den eneste undtagelse er træninger mærket "åpen trening", hvor alle kan deltage.',
            ],
          },
          {
            question: "Koster bordtennis noget?",
            answer: [
              "NTNUI Bordtennis har ingen egen træningsafgift.",
              "Det koster derimod at være NTNUI-medlem. Se ntnui.no for opdateret information om medlemskab og priser.",
            ],
            linkLabel: "Læs mere på ntnui.no",
            linkHref: NTNUI_URL,
          },
          {
            question: "Hvor træner I?",
            answer: [
              `Vi træner i ${VENUE_LABEL}.`,
              "Brug MazeMap-knappen på hjemmesiden, hvis du har brug for vejvisning.",
            ],
          },
        ],
      },
      {
        id: "equipment",
        title: "Udstyr",
        description: "Hvad du bør tage med til træning.",
        items: [
          {
            question: "Skal jeg have min egen bat med?",
            answer: [
              "Klubben har et begrænset antal bat til udlån.",
              "Tag gerne dit eget bat med, hvis du kan.",
            ],
          },
          {
            question: "Hvad bør jeg tage med?",
            answer: [
              "Gode indendørssko anbefales stærkt.",
              "Tag også gerne træningstøj, vandflaske og dit eget bat med, hvis du har et.",
            ],
          },
        ],
      },
      {
        id: "training",
        title: "Træning og tilmelding",
        description: "Praktisk information om niveau, venteliste og afmelding.",
        items: [
          {
            question: "Kan begyndere være med?",
            answer: [
              "Ja. Alle niveauer er velkomne, fra begyndere til erfarne spillere.",
            ],
          },
          {
            question: "Hvad sker der, hvis en træning er fuld?",
            answer: [
              "Hvis alle pladser er optaget, kommer du på venteliste.",
              "Hvis nogen melder fra, bliver den næste på ventelisten flyttet ind automatisk.",
            ],
          },
          {
            question: "Hvordan melder jeg afbud?",
            answer: [
              "Gå til afmeldingssiden, vælg træningen, og vælg dit navn fra listen.",
              "For at bekræfte afmeldingen skal fødselsmåned og fødselsdag passe.",
            ],
          },
        ],
      },
    ],
  },
  sv: {
    badge: "FAQ",
    title: "Vanliga frågor",
    intro:
      "Korta svar på vanliga frågor om medlemskap, utrustning och hur träningarna fungerar.",
    quickLinksTitle: "Hoppa till ämne",
    sections: [
      {
        id: "membership",
        title: "Medlemskap och tillträde",
        description: "Vem som kan komma och vad som krävs för att delta.",
        items: [
          {
            question: "Vem kan delta på träning?",
            answer: [
              "För att träna måste du vara medlem i NTNUI och anmäld i NTNUI Bordtennis.",
              'Det enda undantaget är träningar märkta "åpen trening", där alla kan delta.',
            ],
          },
          {
            question: "Kostar bordtennis något?",
            answer: [
              "NTNUI Bordtennis har ingen egen träningsavgift.",
              "Det kostar däremot att vara medlem i NTNUI. Se ntnui.no för uppdaterad information om medlemskap och priser.",
            ],
            linkLabel: "Läs mer på ntnui.no",
            linkHref: NTNUI_URL,
          },
          {
            question: "Var tränar ni?",
            answer: [
              `Vi tränar i ${VENUE_LABEL}.`,
              "Använd MazeMap-knappen på webbplatsen om du behöver vägbeskrivning.",
            ],
          },
        ],
      },
      {
        id: "equipment",
        title: "Utrustning",
        description: "Vad du bör ta med dig till träningen.",
        items: [
          {
            question: "Måste jag ha eget racket?",
            answer: [
              "Klubben har ett begränsat antal racketar att låna ut.",
              "Ta gärna med eget racket om du kan.",
            ],
          },
          {
            question: "Vad bör jag ta med mig?",
            answer: [
              "Bra inomhusskor rekommenderas starkt.",
              "Ta också gärna med träningskläder, vattenflaska och eget racket om du har.",
            ],
          },
        ],
      },
      {
        id: "training",
        title: "Träning och anmälan",
        description: "Praktisk information om nivå, väntelista och avanmälan.",
        items: [
          {
            question: "Kan nybörjare vara med?",
            answer: [
              "Ja. Alla nivåer är välkomna, från nybörjare till erfarna spelare.",
            ],
          },
          {
            question: "Vad händer om en träning är full?",
            answer: [
              "Om alla platser är tagna hamnar du på väntelistan.",
              "Om någon avanmäler sig flyttas nästa person på väntelistan in automatiskt.",
            ],
          },
          {
            question: "Hur avanmäler jag mig?",
            answer: [
              "Gå till avanmälingssidan, välj träningen och välj ditt namn i listan.",
              "För att bekräfta avanmälan måste födelsemånad och födelsedag stämma.",
            ],
          },
        ],
      },
    ],
  },
  de: {
    badge: "FAQ",
    title: "Häufige Fragen",
    intro:
      "Kurze Antworten auf häufige Fragen zu Mitgliedschaft, Ausrüstung und dem Ablauf der Trainings.",
    quickLinksTitle: "Direkt zum Thema",
    sections: [
      {
        id: "membership",
        title: "Mitgliedschaft und Zugang",
        description: "Wer teilnehmen kann und was dafür nötig ist.",
        items: [
          {
            question: "Wer kann am Training teilnehmen?",
            answer: [
              "Um zu trainieren, musst du NTNUI-Mitglied sein und dich bei NTNUI Tischtennis anmelden.",
              'Die einzige Ausnahme sind Einheiten mit der Markierung "åpen trening", an denen alle teilnehmen können.',
            ],
          },
          {
            question: "Kostet Tischtennis etwas?",
            answer: [
              "NTNUI Tischtennis hat keine eigene Trainingsgebühr.",
              "Die NTNUI-Mitgliedschaft kostet jedoch Geld. Auf ntnui.no findest du aktuelle Informationen zu Mitgliedschaft und Preisen.",
            ],
            linkLabel: "Mehr auf ntnui.no",
            linkHref: NTNUI_URL,
          },
          {
            question: "Wo trainiert ihr?",
            answer: [
              `Wir trainieren in ${VENUE_LABEL}.`,
              "Nutze den MazeMap-Button auf der Website, wenn du eine Wegbeschreibung brauchst.",
            ],
          },
        ],
      },
      {
        id: "equipment",
        title: "Ausrüstung",
        description: "Was du zum Training mitbringen solltest.",
        items: [
          {
            question: "Brauche ich einen eigenen Schläger?",
            answer: [
              "Der Verein hat nur eine begrenzte Anzahl an Leihschlägern.",
              "Bring deinen eigenen Schläger mit, wenn du kannst.",
            ],
          },
          {
            question: "Was sollte ich zum Training mitbringen?",
            answer: [
              "Gute Hallenschuhe werden dringend empfohlen.",
              "Außerdem sind Sportkleidung, Trinkflasche und möglichst ein eigener Schläger sinnvoll.",
            ],
          },
        ],
      },
      {
        id: "training",
        title: "Training und Anmeldung",
        description: "Praktische Informationen zu Niveau, Warteliste und Abmeldung.",
        items: [
          {
            question: "Können Anfänger mitmachen?",
            answer: [
              "Ja. Alle Niveaus sind willkommen, vom Anfänger bis zum erfahrenen Spieler.",
            ],
          },
          {
            question: "Was passiert, wenn ein Training voll ist?",
            answer: [
              "Wenn alle Plätze belegt sind, kommst du auf die Warteliste.",
              "Wenn sich jemand abmeldet, rückt die nächste Person auf der Warteliste automatisch nach.",
            ],
          },
          {
            question: "Wie melde ich mich ab?",
            answer: [
              "Gehe auf die Abmeldeseite, wähle die Einheit und dann deinen Namen aus der Liste aus.",
              "Zur Bestätigung müssen Geburtsmonat und Geburtstag übereinstimmen.",
            ],
          },
        ],
      },
    ],
  },
  zh: {
    badge: "FAQ",
    title: "常见问题",
    intro: "这里有关于会员、装备和训练安排的简短说明，方便你快速找到答案。",
    quickLinksTitle: "跳转到主题",
    sections: [
      {
        id: "membership",
        title: "会员和参加资格",
        description: "谁可以参加训练，以及参加前需要满足什么条件。",
        items: [
          {
            question: "谁可以参加训练？",
            answer: [
              "要参加训练，你必须先成为 NTNUI 会员，并加入 NTNUI 乒乓球。",
              '唯一的例外是标记为 "åpen trening" 的训练，这类训练任何人都可以参加。',
            ],
          },
          {
            question: "乒乓球训练需要额外收费吗？",
            answer: [
              "NTNUI 乒乓球本身不收取额外训练费用。",
              "但是成为 NTNUI 会员需要付费。最新的会员信息和价格请查看 ntnui.no。",
            ],
            linkLabel: "更多信息请见 ntnui.no",
            linkHref: NTNUI_URL,
          },
          {
            question: "你们在哪里训练？",
            answer: [
              `我们在 ${VENUE_LABEL} 训练。`,
              "如果你需要路线，可以使用网站上的 MazeMap 按钮。",
            ],
          },
        ],
      },
      {
        id: "equipment",
        title: "装备",
        description: "训练前建议准备好的物品。",
        items: [
          {
            question: "我必须自带球拍吗？",
            answer: [
              "俱乐部可以借出的球拍数量有限。",
              "如果可以的话，请尽量带自己的球拍。",
            ],
          },
          {
            question: "训练时应该带什么？",
            answer: [
              "强烈建议穿适合室内训练的运动鞋。",
              "另外也建议带上运动服、水瓶，以及如果有的话请带自己的球拍。",
            ],
          },
        ],
      },
      {
        id: "training",
        title: "训练和报名",
        description: "关于水平、候补名单和取消报名的实用信息。",
        items: [
          {
            question: "初学者可以参加吗？",
            answer: [
              "可以。所有水平都欢迎参加，从初学者到有经验的球员都可以。",
            ],
          },
          {
            question: "如果训练已经满员怎么办？",
            answer: [
              "如果名额已满，你会被加入候补名单。",
              "如果有人取消报名，候补名单上的下一位会自动补上。",
            ],
          },
          {
            question: "我如何取消报名？",
            answer: [
              "进入取消报名页面，选择训练，再从名单中选择你的名字。",
              "为了确认取消报名，你填写的出生月份和日期必须匹配。",
            ],
          },
        ],
      },
    ],
  },
  fr: {
    badge: "FAQ",
    title: "Questions fréquentes",
    intro:
      "Des réponses rapides aux questions fréquentes sur l’adhésion, le matériel et le fonctionnement des entraînements.",
    quickLinksTitle: "Aller à la section",
    sections: [
      {
        id: "membership",
        title: "Adhésion et accès",
        description: "Qui peut participer et ce qu’il faut avant de venir.",
        items: [
          {
            question: "Qui peut participer à l’entraînement ?",
            answer: [
              "Pour participer, il faut être membre de NTNUI et s’inscrire à NTNUI Tennis de table.",
              'La seule exception concerne les séances marquées "åpen trening", auxquelles tout le monde peut participer.',
            ],
          },
          {
            question: "Le tennis de table coûte-t-il quelque chose ?",
            answer: [
              "NTNUI Tennis de table n’a pas de frais d’entraînement propres.",
              "En revanche, l’adhésion à NTNUI est payante. Voir ntnui.no pour les informations et tarifs à jour.",
            ],
            linkLabel: "Plus d’informations sur ntnui.no",
            linkHref: NTNUI_URL,
          },
          {
            question: "Où avez-vous vos entraînements ?",
            answer: [
              `Nous nous entraînons à ${VENUE_LABEL}.`,
              "Utilisez le bouton MazeMap sur le site si vous avez besoin d’un itinéraire.",
            ],
          },
        ],
      },
      {
        id: "equipment",
        title: "Matériel",
        description: "Ce qu’il vaut mieux apporter avec soi.",
        items: [
          {
            question: "Dois-je avoir ma propre raquette ?",
            answer: [
              "Le club dispose d’un nombre limité de raquettes à prêter.",
              "Apportez votre propre raquette si vous le pouvez.",
            ],
          },
          {
            question: "Que faut-il apporter à l’entraînement ?",
            answer: [
              "De bonnes chaussures d’intérieur sont fortement recommandées.",
              "Prenez aussi si possible une tenue de sport, une gourde et votre propre raquette.",
            ],
          },
        ],
      },
      {
        id: "training",
        title: "Entraînement et inscription",
        description: "Informations pratiques sur le niveau, la liste d’attente et la désinscription.",
        items: [
          {
            question: "Les débutants peuvent-ils venir ?",
            answer: [
              "Oui. Tous les niveaux sont les bienvenus, des débutants aux joueurs expérimentés.",
            ],
          },
          {
            question: "Que se passe-t-il si une séance est complète ?",
            answer: [
              "Si toutes les places sont prises, vous serez ajouté à la liste d’attente.",
              "Si quelqu’un se désinscrit, la personne suivante sur la liste d’attente est promue automatiquement.",
            ],
          },
          {
            question: "Comment me désinscrire ?",
            answer: [
              "Allez sur la page de désinscription, choisissez la séance, puis sélectionnez votre nom dans la liste.",
              "Pour confirmer la désinscription, votre mois et votre jour de naissance doivent correspondre.",
            ],
          },
        ],
      },
    ],
  },
  es: {
    badge: "FAQ",
    title: "Preguntas frecuentes",
    intro:
      "Respuestas rápidas a preguntas comunes sobre membresía, material y cómo funcionan los entrenamientos.",
    quickLinksTitle: "Ir a la sección",
    sections: [
      {
        id: "membership",
        title: "Membresía y acceso",
        description: "Quién puede participar y qué se necesita antes de asistir.",
        items: [
          {
            question: "¿Quién puede participar en los entrenamientos?",
            answer: [
              "Para entrenar, debes ser miembro de NTNUI y registrarte en NTNUI Tenis de mesa.",
              'La única excepción son los entrenamientos marcados como "åpen trening", donde puede asistir cualquier persona.',
            ],
          },
          {
            question: "¿El tenis de mesa cuesta algo?",
            answer: [
              "NTNUI Tenis de mesa no tiene una cuota propia de entrenamiento.",
              "Sin embargo, ser miembro de NTNUI sí cuesta dinero. Consulta ntnui.no para ver la información y los precios actualizados.",
            ],
            linkLabel: "Más información en ntnui.no",
            linkHref: NTNUI_URL,
          },
          {
            question: "¿Dónde entrenáis?",
            answer: [
              `Entrenamos en ${VENUE_LABEL}.`,
              "Usa el botón de MazeMap en la web si necesitas indicaciones.",
            ],
          },
        ],
      },
      {
        id: "equipment",
        title: "Material",
        description: "Qué conviene llevar antes del entrenamiento.",
        items: [
          {
            question: "¿Necesito llevar mi propia pala?",
            answer: [
              "El club tiene una cantidad limitada de palas para prestar.",
              "Trae tu propia pala si puedes.",
            ],
          },
          {
            question: "¿Qué debería llevar al entrenamiento?",
            answer: [
              "Se recomiendan mucho unas buenas zapatillas de interior.",
              "También conviene llevar ropa deportiva, botella de agua y tu propia pala si tienes una.",
            ],
          },
        ],
      },
      {
        id: "training",
        title: "Entrenamiento e inscripción",
        description: "Información práctica sobre nivel, lista de espera y baja.",
        items: [
          {
            question: "¿Pueden participar los principiantes?",
            answer: [
              "Sí. Todos los niveles son bienvenidos, desde principiantes hasta jugadores con experiencia.",
            ],
          },
          {
            question: "¿Qué pasa si un entrenamiento está lleno?",
            answer: [
              "Si ya no quedan plazas, entrarás en la lista de espera.",
              "Si alguien se da de baja, la siguiente persona de la lista de espera entra automáticamente.",
            ],
          },
          {
            question: "¿Cómo me doy de baja?",
            answer: [
              "Ve a la página de baja, elige el entrenamiento y selecciona tu nombre en la lista.",
              "Para confirmar la baja, el mes y el día de nacimiento deben coincidir.",
            ],
          },
        ],
      },
    ],
  },
};

export function getFaqContent(locale: Locale) {
  return FAQ_BY_LOCALE[locale];
}
