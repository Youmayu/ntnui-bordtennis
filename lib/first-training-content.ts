import type { Locale } from "@/lib/site-content";

type FirstTrainingCopy = {
  title: string;
  intro: string;
  membershipTitle: string;
  membershipBody: string;
  membershipLink: string;
  feesLink: string;
  bookingTitle: string;
  bookingBody: string;
  bookingLink: string;
  equipmentTitle: string;
  equipmentBody: string;
};

const FIRST_TRAINING_COPY: Record<Locale, FirstTrainingCopy> = {
  no: {
    title: "Din første trening",
    intro: "Ny i bordtennis? Alle nivåer er velkomne, også helt ferske nybegynnere.",
    membershipTitle: "Medlemskap og kostnader",
    membershipBody:
      "Vanlige treninger krever NTNUI-medlemskap og innmelding i NTNUI Bordtennis. NTNUI-medlemskapet koster penger, men bordtennisgruppen har ingen egen treningsavgift. Treninger merket «åpen trening» er åpne for alle.",
    membershipLink: "Bli med i NTNUI Bordtennis",
    feesLink: "Medlemspriser",
    bookingTitle: "Meld deg på hver økt",
    bookingBody:
      "Medlemskap reserverer ikke en plass. Velg en økt i treningsplanen og meld deg på. Er økten full, kan du stå på venteliste.",
    bookingLink: "Velg en økt",
    equipmentTitle: "Dette tar du med",
    equipmentBody:
      "Ta med innesko, treningstøy, vannflaske og egen racket hvis du har. Vi har et begrenset antall racketer til utlån.",
  },
  en: {
    title: "Your first training",
    intro: "New to table tennis? All levels are welcome, including complete beginners.",
    membershipTitle: "Membership and costs",
    membershipBody:
      "Regular sessions require NTNUI membership and joining NTNUI Table Tennis. NTNUI membership has a fee, but the table tennis group has no separate training fee. Sessions marked “open training” welcome everyone.",
    membershipLink: "Join NTNUI Table Tennis",
    feesLink: "Membership fees",
    bookingTitle: "Book each session",
    bookingBody:
      "Membership does not reserve a spot. Choose a session in the schedule and register. If it is full, join the waiting list.",
    bookingLink: "Choose a session",
    equipmentTitle: "What to bring",
    equipmentBody:
      "Bring indoor shoes, sportswear, a water bottle, and your own racket if you have one. A limited number of loan rackets are available.",
  },
  da: {
    title: "Din første træning",
    intro: "Ny til bordtennis? Alle niveauer er velkomne, også helt nye begyndere.",
    membershipTitle: "Medlemskab og priser",
    membershipBody:
      "Almindelige træninger kræver NTNUI-medlemskab og indmeldelse i NTNUI Bordtennis. NTNUI-medlemskabet koster penge, men bordtennisgruppen har ingen egen træningsafgift. Træninger mærket »åben træning« er åbne for alle.",
    membershipLink: "Bliv medlem af NTNUI Bordtennis",
    feesLink: "Medlemspriser",
    bookingTitle: "Tilmeld dig hver træning",
    bookingBody:
      "Medlemskab reserverer ikke en plads. Vælg en træning i træningsplanen, og tilmeld dig. Er den fuld, kan du komme på venteliste.",
    bookingLink: "Vælg en træning",
    equipmentTitle: "Det skal du tage med",
    equipmentBody:
      "Tag indendørssko, træningstøj, vandflaske og dit eget bat med, hvis du har et. Vi har et begrænset antal bat til udlån.",
  },
  sv: {
    title: "Din första träning",
    intro: "Ny på bordtennis? Alla nivåer är välkomna, även helt nya nybörjare.",
    membershipTitle: "Medlemskap och kostnader",
    membershipBody:
      "Vanliga träningar kräver medlemskap i NTNUI och att du går med i NTNUI Bordtennis. NTNUI-medlemskapet kostar pengar, men bordtennisgruppen har ingen egen träningsavgift. Pass märkta ”öppen träning” är öppna för alla.",
    membershipLink: "Gå med i NTNUI Bordtennis",
    feesLink: "Medlemsavgifter",
    bookingTitle: "Anmäl dig till varje pass",
    bookingBody:
      "Medlemskap reserverar ingen plats. Välj ett pass i träningsschemat och anmäl dig. Är det fullt kan du ställa dig på väntelistan.",
    bookingLink: "Välj ett pass",
    equipmentTitle: "Det här tar du med",
    equipmentBody:
      "Ta med inomhusskor, träningskläder, vattenflaska och eget racket om du har. Vi har ett begränsat antal racketar att låna ut.",
  },
  de: {
    title: "Dein erstes Training",
    intro: "Neu beim Tischtennis? Alle Niveaus sind willkommen, auch ohne Vorkenntnisse.",
    membershipTitle: "Mitgliedschaft und Kosten",
    membershipBody:
      "Für reguläre Einheiten musst du NTNUI-Mitglied sein und NTNUI Tischtennis beitreten. Die NTNUI-Mitgliedschaft kostet Geld, die Tischtennisgruppe erhebt keine zusätzliche Trainingsgebühr. Einheiten mit der Markierung „offenes Training“ sind für alle offen.",
    membershipLink: "NTNUI Tischtennis beitreten",
    feesLink: "Mitgliedsbeiträge",
    bookingTitle: "Für jede Einheit anmelden",
    bookingBody:
      "Die Mitgliedschaft reserviert keinen Platz. Wähle eine Einheit im Trainingsplan und melde dich an. Ist sie voll, trage dich auf die Warteliste ein.",
    bookingLink: "Einheit auswählen",
    equipmentTitle: "Was du mitbringen solltest",
    equipmentBody:
      "Bring Hallenschuhe, Sportkleidung, eine Trinkflasche und deinen eigenen Schläger mit, falls vorhanden. Leihschläger sind in begrenzter Anzahl verfügbar.",
  },
  zh: {
    title: "你的第一次训练",
    intro: "刚接触乒乓球？无论水平如何，我们都欢迎，包括零基础初学者。",
    membershipTitle: "会员和费用",
    membershipBody:
      "参加常规训练需要成为 NTNUI 会员，并加入 NTNUI 乒乓球。NTNUI 会员需要付费，乒乓球组不另收训练费。标记为“公开训练”的场次对所有人开放。",
    membershipLink: "加入 NTNUI 乒乓球",
    feesLink: "会员费用",
    bookingTitle: "每次训练都需报名",
    bookingBody:
      "会员身份不会自动预留名额。请在训练安排中选择场次并报名。如果已满员，可以加入候补名单。",
    bookingLink: "选择训练场次",
    equipmentTitle: "需要带什么",
    equipmentBody:
      "请带上室内运动鞋、运动服、水瓶，以及自己的球拍（如有）。俱乐部有少量球拍可供借用。",
  },
  fr: {
    title: "Votre premier entraînement",
    intro: "Vous découvrez le tennis de table ? Tous les niveaux sont les bienvenus, même sans aucune expérience.",
    membershipTitle: "Adhésion et tarifs",
    membershipBody:
      "Les séances habituelles nécessitent une adhésion à NTNUI et une inscription à NTNUI Tennis de table. L’adhésion à NTNUI est payante, mais le groupe ne facture pas de frais d’entraînement supplémentaires. Les séances marquées « entraînement ouvert » accueillent tout le monde.",
    membershipLink: "Rejoindre NTNUI Tennis de table",
    feesLink: "Tarifs d’adhésion",
    bookingTitle: "Inscrivez-vous à chaque séance",
    bookingBody:
      "L’adhésion ne réserve pas de place. Choisissez une séance dans le programme et inscrivez-vous. Si elle est complète, rejoignez la liste d’attente.",
    bookingLink: "Choisir une séance",
    equipmentTitle: "Que faut-il apporter ?",
    equipmentBody:
      "Apportez des chaussures d’intérieur, une tenue de sport, une gourde et votre raquette si vous en avez une. Un nombre limité de raquettes est disponible en prêt.",
  },
  es: {
    title: "Tu primer entrenamiento",
    intro: "¿Empiezas con el tenis de mesa? Todos los niveles son bienvenidos, incluso sin experiencia previa.",
    membershipTitle: "Inscripción y cuotas",
    membershipBody:
      "Para las sesiones habituales debes ser miembro de NTNUI e inscribirte en NTNUI Tenis de mesa. La afiliación a NTNUI tiene una cuota, pero el grupo no cobra una cuota de entrenamiento adicional. Las sesiones marcadas como «entrenamiento abierto» admiten a todo el mundo.",
    membershipLink: "Únete a NTNUI Tenis de mesa",
    feesLink: "Cuotas de afiliación",
    bookingTitle: "Inscríbete en cada sesión",
    bookingBody:
      "Ser miembro no reserva una plaza. Elige una sesión en el horario e inscríbete. Si está llena, apúntate a la lista de espera.",
    bookingLink: "Elegir una sesión",
    equipmentTitle: "Qué llevar",
    equipmentBody:
      "Trae zapatillas de interior, ropa deportiva, una botella de agua y tu propia pala si tienes una. Hay un número limitado de palas para prestar.",
  },
};

export function getFirstTrainingCopy(locale: Locale): FirstTrainingCopy {
  return FIRST_TRAINING_COPY[locale];
}
