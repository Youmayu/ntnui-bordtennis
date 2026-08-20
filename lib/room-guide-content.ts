import type { Locale } from "@/lib/site-content";

type SetupStep = {
  text: string;
  showLockerCode?: boolean;
};

type ClosingStep = {
  text: string;
  warning?: string;
};

export type RoomGuideContent = {
  badge: string;
  title: string;
  intro: string;
  preferredLabel: string;
  preferredText: string;
  fallbackTitle: string;
  fallbackText: string;
  setupTitle: string;
  lockerCodeLabel: string;
  setupSteps: SetupStep[];
  closingTitle: string;
  closingSteps: ClosingStep[];
  finalText: string;
};

const ROOM_GUIDE_BY_LOCALE: Record<Locale, RoomGuideContent> = {
  no: {
    badge: "Praktisk veiledning",
    title: "Klargjøring og rydding av salen",
    intro:
      "Slik gjør dere salen klar før trening og rydder etterpå når ingen fra styret kommer.",
    preferredLabel: "Anbefalt",
    preferredText:
      "Finn noen med erfaring som kan hjelpe til med å klargjøre salen. Dette er den beste løsningen.",
    fallbackTitle: "Hvis alle som kommer er nye",
    fallbackText: "Følg stegene nedenfor.",
    setupTitle: "Klargjøring",
    lockerCodeLabel: "Skapkode",
    setupSteps: [
      {
        text: "Åpne skapet ved døren med koden nedenfor. Ta ut utlånsracketene, bordtennisnettene og den gjennomsiktige boksen med baller.",
        showLockerCode: true,
      },
      {
        text: "Gå til de to skyvedørene i tre midt i gymsalen, og åpne døren til venstre. Bordene og barrierene står der inne.",
      },
      {
        text: "Sett opp nok bord til de påmeldte spillerne, og plasser barrierene etter behov.",
      },
    ],
    closingTitle: "Rydding",
    closingSteps: [
      {
        text: "Sett alle bordene tilbake bak skyvedørene.",
        warning:
          "INGENTING må krysse linjen på gulvet. Området på den andre siden tilhører ikke oss.",
      },
      {
        text: "Legg alt lånt bordtennisutstyr tilbake i skapet, og lås det.",
      },
    ],
    finalText: "Det var alt – ha det gøy!",
  },
  en: {
    badge: "Practical guide",
    title: "Room setup and cleanup guide",
    intro:
      "Use this guide to prepare the training hall and pack everything away when no board member is attending.",
    preferredLabel: "Preferred option",
    preferredText:
      "Find someone experienced who can help set up the room. This is the ideal solution.",
    fallbackTitle: "If everyone attending is new",
    fallbackText: "Follow the steps below.",
    setupTitle: "Setting up the training hall",
    lockerCodeLabel: "Locker code",
    setupSteps: [
      {
        text: "Open the locker next to the door using the code below. Take out the loaner rackets, table-tennis nets, and transparent box of balls.",
        showLockerCode: true,
      },
      {
        text: "Find the two wooden sliding doors in the middle of the gym and open the left-hand door. The tables and barriers are stored behind it.",
      },
      {
        text: "Set up enough tables for everyone registered, and position the barriers where needed.",
      },
    ],
    closingTitle: "Closing down the training hall",
    closingSteps: [
      {
        text: "Return every table to the storage area behind the sliding doors.",
        warning:
          "NOTHING may cross the line marked on the floor. The space beyond that line is not ours to use.",
      },
      {
        text: "Return all borrowed table-tennis equipment to the locker and lock it.",
      },
    ],
    finalText: "That’s it—have fun!",
  },
  da: {
    badge: "Praktisk vejledning",
    title: "Klargøring og oprydning af hallen",
    intro:
      "Sådan gør I hallen klar før træningen og rydder op bagefter, når ingen fra bestyrelsen deltager.",
    preferredLabel: "Anbefalet",
    preferredText:
      "Find en erfaren person, som kan hjælpe med at gøre hallen klar. Det er den bedste løsning.",
    fallbackTitle: "Hvis alle deltagere er nye",
    fallbackText: "Følg trinnene nedenfor.",
    setupTitle: "Klargøring",
    lockerCodeLabel: "Skabskode",
    setupSteps: [
      {
        text: "Åbn skabet ved døren med koden nedenfor. Tag lånebattene, bordtennisnettene og den gennemsigtige kasse med bolde ud.",
        showLockerCode: true,
      },
      {
        text: "Gå hen til de to skydedøre af træ midt i hallen, og åbn døren til venstre. Bordene og banderne står derinde.",
      },
      {
        text: "Sæt nok borde op til de tilmeldte spillere, og placér banderne efter behov.",
      },
    ],
    closingTitle: "Oprydning",
    closingSteps: [
      {
        text: "Stil alle bordene tilbage bag skydedørene.",
        warning:
          "INTET må krydse linjen på gulvet. Området på den anden side tilhører ikke os.",
      },
      {
        text: "Læg alt lånt bordtennisudstyr tilbage i skabet, og lås det.",
      },
    ],
    finalText: "Det var det – god fornøjelse!",
  },
  sv: {
    badge: "Praktisk guide",
    title: "Gör i ordning och städa hallen",
    intro:
      "Så gör ni i ordning hallen före träningen och städar efteråt när ingen från styrelsen deltar.",
    preferredLabel: "Rekommenderat",
    preferredText:
      "Hitta någon med erfarenhet som kan hjälpa till att göra i ordning hallen. Det är den bästa lösningen.",
    fallbackTitle: "Om alla som deltar är nya",
    fallbackText: "Följ stegen nedan.",
    setupTitle: "Gör i ordning",
    lockerCodeLabel: "Skåpkod",
    setupSteps: [
      {
        text: "Öppna skåpet vid dörren med koden nedan. Ta ut låneracketarna, bordtennisnäten och den genomskinliga lådan med bollar.",
        showLockerCode: true,
      },
      {
        text: "Gå till de två skjutdörrarna i trä mitt i idrottshallen och öppna den vänstra dörren. Borden och barriärerna står där inne.",
      },
      {
        text: "Ställ upp tillräckligt många bord för de anmälda spelarna och placera barriärerna där de behövs.",
      },
    ],
    closingTitle: "Städning",
    closingSteps: [
      {
        text: "Ställ tillbaka alla bord bakom skjutdörrarna.",
        warning:
          "INGENTING får sticka ut över linjen på golvet. Området på andra sidan är inte vårt.",
      },
      {
        text: "Lägg tillbaka all lånad bordtennisutrustning i skåpet och lås det.",
      },
    ],
    finalText: "Det var allt – ha så kul!",
  },
  zh: {
    badge: "实用指南",
    title: "场地布置与收拾指南",
    intro: "没有理事会成员参加训练时，请按照本指南布置并收拾场地。",
    preferredLabel: "首选方式",
    preferredText: "尽量找一位熟悉布置流程的人帮忙准备场地，这是最理想的解决办法。",
    fallbackTitle: "如果参加者都是新手",
    fallbackText: "请按以下步骤操作。",
    setupTitle: "布置场地",
    lockerCodeLabel: "储物柜密码",
    setupSteps: [
      {
        text: "使用下方密码打开门旁边的储物柜。取出里面可借用的球拍、乒乓球网，以及装有乒乓球的透明盒子。",
        showLockerCode: true,
      },
      {
        text: "找到体育馆中央的两扇木质推拉门，打开左侧那扇门。球桌和挡板存放在里面。",
      },
      {
        text: "根据已报名人数摆放足够的球桌，并在需要的位置设置挡板。",
      },
    ],
    closingTitle: "结束后收拾场地",
    closingSteps: [
      {
        text: "将所有球桌放回推拉门后的储藏区。",
        warning: "任何物品都不得越过地板上的分界线；分界线另一侧的区域不归我们使用。",
      },
      {
        text: "将所有借用的乒乓球器材放回储物柜，并将柜门锁好。",
      },
    ],
    finalText: "就这些——祝大家训练愉快！",
  },
  fr: {
    badge: "Guide pratique",
    title: "Installation et rangement de la salle",
    intro:
      "Utilisez ce guide pour installer puis ranger la salle lorsqu’aucun membre du bureau n’est présent.",
    preferredLabel: "Option à privilégier",
    preferredText:
      "Demandez à une personne expérimentée de vous aider à préparer la salle. C’est la solution idéale.",
    fallbackTitle: "Si toutes les personnes présentes sont nouvelles",
    fallbackText: "Suivez les étapes ci-dessous.",
    setupTitle: "Mise en place",
    lockerCodeLabel: "Code du casier",
    setupSteps: [
      {
        text: "Ouvrez le casier près de la porte avec le code ci-dessous. Sortez les raquettes de prêt, les filets de tennis de table et la boîte transparente contenant les balles.",
        showLockerCode: true,
      },
      {
        text: "Allez jusqu’aux deux portes coulissantes en bois situées au milieu du gymnase et ouvrez celle de gauche. Les tables et les séparations se trouvent derrière.",
      },
      {
        text: "Installez suffisamment de tables pour les personnes inscrites et disposez les séparations selon les besoins.",
      },
    ],
    closingTitle: "Rangement",
    closingSteps: [
      {
        text: "Rangez toutes les tables derrière les portes coulissantes.",
        warning:
          "RIEN ne doit franchir la ligne tracée au sol. L’espace situé de l’autre côté ne nous appartient pas.",
      },
      {
        text: "Remettez tout le matériel de tennis de table emprunté dans le casier, puis verrouillez-le.",
      },
    ],
    finalText: "C’est tout — amusez-vous bien !",
  },
  es: {
    badge: "Guía práctica",
    title: "Preparación y recogida de la sala",
    intro:
      "Usa esta guía para preparar y recoger la sala cuando no asista ningún miembro de la junta.",
    preferredLabel: "Opción recomendada",
    preferredText:
      "Busca a alguien con experiencia que pueda ayudar a preparar la sala. Es la solución ideal.",
    fallbackTitle: "Si todas las personas presentes son nuevas",
    fallbackText: "Sigue los pasos que aparecen a continuación.",
    setupTitle: "Preparación",
    lockerCodeLabel: "Código del armario",
    setupSteps: [
      {
        text: "Abre el armario junto a la puerta con el código que aparece abajo. Saca las palas de préstamo, las redes de tenis de mesa y la caja transparente con pelotas.",
        showLockerCode: true,
      },
      {
        text: "Ve hasta las dos puertas correderas de madera situadas en el centro del gimnasio y abre la de la izquierda. Detrás están las mesas y los separadores.",
      },
      {
        text: "Monta suficientes mesas para las personas inscritas y coloca los separadores donde hagan falta.",
      },
    ],
    closingTitle: "Recogida",
    closingSteps: [
      {
        text: "Guarda todas las mesas detrás de las puertas correderas.",
        warning:
          "NADA puede sobrepasar la línea marcada en el suelo. El espacio al otro lado no es nuestro.",
      },
      {
        text: "Devuelve al armario todo el material de tenis de mesa prestado y ciérralo con llave.",
      },
    ],
    finalText: "Eso es todo — ¡a disfrutar!",
  },
  de: {
    badge: "Praktische Anleitung",
    title: "Aufbau und Aufräumen der Halle",
    intro:
      "So bereitet ihr die Halle vor dem Training vor und räumt danach auf, wenn niemand vom Vorstand teilnimmt.",
    preferredLabel: "Empfohlen",
    preferredText:
      "Sucht jemanden mit Erfahrung, der beim Aufbau der Halle helfen kann. Das ist die beste Lösung.",
    fallbackTitle: "Wenn alle Teilnehmenden neu sind",
    fallbackText: "Folgt den Schritten unten.",
    setupTitle: "Aufbau",
    lockerCodeLabel: "Schrankcode",
    setupSteps: [
      {
        text: "Öffnet den Schrank neben der Tür mit dem unten stehenden Code. Nehmt die Leihschläger, Tischtennisnetze und die durchsichtige Box mit Bällen heraus.",
        showLockerCode: true,
      },
      {
        text: "Geht zu den beiden Holzschiebetüren in der Mitte der Sporthalle und öffnet die linke Tür. Dahinter stehen die Tische und Banden.",
      },
      {
        text: "Stellt genügend Tische für alle Angemeldeten auf und platziert die Banden nach Bedarf.",
      },
    ],
    closingTitle: "Abbau und Aufräumen",
    closingSteps: [
      {
        text: "Stellt alle Tische hinter die Schiebetüren.",
        warning:
          "NICHTS darf über die Linie auf dem Boden ragen. Der Bereich auf der anderen Seite gehört nicht uns.",
      },
      {
        text: "Bringt die gesamte geliehene Tischtennisausrüstung zurück in den Schrank und schließt ihn ab.",
      },
    ],
    finalText: "Das war’s – viel Spaß!",
  },
};

export function getRoomGuideContent(locale: Locale) {
  return ROOM_GUIDE_BY_LOCALE[locale];
}
