export const LOCALE_INFO = {
  no: { htmlLang: "no", intlLocale: "no-NO", label: "Norsk" },
  en: { htmlLang: "en", intlLocale: "en-US", label: "English" },
  zh: { htmlLang: "zh", intlLocale: "zh-CN", label: "中文" },
  fr: { htmlLang: "fr", intlLocale: "fr-FR", label: "Français" },
  es: { htmlLang: "es", intlLocale: "es-ES", label: "Español" },
} as const;

export type Locale = keyof typeof LOCALE_INFO;
export type Theme = "light" | "dark";

export const LANGUAGE_COOKIE = "ntnui_locale";
export const THEME_COOKIE = "ntnui_theme";

export const LEVEL_OPTIONS = [
  { key: "beginner", value: "Nybegynner" },
  { key: "intermediate", value: "Viderekommen" },
  { key: "experienced", value: "Erfaren" },
] as const;

export type LevelKey = (typeof LEVEL_OPTIONS)[number]["key"];

const LEVEL_KEY_BY_VALUE: Record<string, LevelKey> = {
  Nybegynner: "beginner",
  Viderekommen: "intermediate",
  Erfaren: "experienced",
};

export const MAZEMAP_URL =
  "https://use.mazemap.com/?utm_medium=qr-code-mobile#v=1&config=ntnu&campusid=18&zlevel=2&center=10.475060,63.406574&zoom=17.8&sharepoitype=identifier&sharepoi=850-B217";

const VENUE_LABELS: Record<Locale, string> = {
  no: "Dragvoll Idrettssenter B217",
  en: "Dragvoll Sports Centre B217",
  zh: "Dragvoll 体育中心 B217",
  fr: "Centre sportif Dragvoll B217",
  es: "Centro deportivo Dragvoll B217",
};

export const DEFAULT_SESSION_LOCATION = VENUE_LABELS.no;

const DEFAULT_LOCATION_ALIASES = new Set(
  [
    ...Object.values(VENUE_LABELS),
    "Dragvoll Idrettssenter",
    "Dragvoll Idrettssenter 2. etasje gymsal",
    "Dragvoll Sports Centre",
    "NTNU Dragvoll Idrettssenter",
    "NTNU Dragvoll Sports Centre",
    "Dragvoll 体育中心",
    "NTNU Dragvoll 体育中心",
    "Centre sportif Dragvoll",
    "Centre sportif NTNU Dragvoll",
    "Centro deportivo Dragvoll",
    "Centro deportivo NTNU Dragvoll",
  ].map((value) => value.trim().toLowerCase())
);

type Messages = {
  shell: {
    brand: string;
    languageLabel: string;
    themeLabel: string;
    themeLight: string;
    themeDark: string;
    nav: {
      schedule: string;
      register: string;
      unregister: string;
      about: string;
    };
    footerLocation: string;
    footerCopyright: (year: number) => string;
  };
  announcements: {
    heading: string;
    until: (date: string) => string;
  };
  home: {
    emptyTitle: string;
    emptyBody: string;
    heroTag: string;
    heroTitle: string;
    heroBody: string;
    ctaRegister: string;
    ctaSchedule: string;
    currentTitle: string;
    nextTitle: string;
    currentStatus: string;
    nextStatus: string;
    locationLabel: string;
    spotsLeft: (count: number) => string;
    registeredCount: (count: number, capacity: number) => string;
    nobodyRegistered: string;
    infoTitle: string;
    levelLabel: string;
    levelBody: string;
    bringLabel: string;
    bringBody: string;
  };
  schedule: {
    badge: string;
    title: string;
    body: string;
    tableTitle: string;
    when: string;
    status: string;
    location: string;
    capacity: string;
    active: string;
    upcoming: string;
    empty: string;
  };
  register: {
    badge: string;
    title: string;
    body: string;
    sessionLabel: string;
    nameLabel: string;
    namePlaceholder: string;
    nameHelp: string;
    levelLabel: string;
    birthMonthLabel: string;
    birthDayLabel: string;
    chooseMonth: string;
    chooseDay: string;
    submit: string;
    success: string;
    errors: {
      captcha: string;
      session: string;
      birthDate: string;
      generic: string;
    };
  };
  unregister: {
    badge: string;
    title: string;
    body: string;
    sessionLabel: string;
    whoLabel: string;
    noRegistrations: string;
    birthMonthLabel: string;
    birthDayLabel: string;
    chooseMonth: string;
    chooseDay: string;
    submit: string;
    success: string;
    registrationLabel: (name: string, level: string, time: string) => string;
    errors: {
      captcha: string;
      registration: string;
      birthDate: string;
      generic: string;
    };
  };
  about: {
    badge: string;
    title: string;
    body: string;
    roles: {
      leader: string;
      deputy: string;
      treasurer: string;
    };
    email: string;
    phone: string;
    locationTitle: string;
    locationValue: string;
  };
  levels: Record<LevelKey, string>;
};

export const SITE_MESSAGES: Record<Locale, Messages> = {
  no: {
    shell: {
      brand: "NTNUI Bordtennis",
      languageLabel: "Språk",
      themeLabel: "Tema",
      themeLight: "Lys",
      themeDark: "Mørk",
      nav: {
        schedule: "Timeplan",
        register: "Påmelding",
        unregister: "Avmelding",
        about: "Om oss",
      },
      footerLocation: "Dragvoll Idrettssenter B217",
      footerCopyright: (year) => `© ${year} NTNUI Bordtennis`,
    },
    announcements: {
      heading: "Viktige beskjeder",
      until: (date) => `Til ${date}`,
    },
    home: {
      emptyTitle: "NTNUI Bordtennis",
      emptyBody: "Ingen kommende økter lagt inn enda.",
      heroTag: "Dragvoll Idrettssenter B217",
      heroTitle: "Påmelding til bordtennistrening",
      heroBody: "Se neste økt og meld deg på.",
      ctaRegister: "Påmelding",
      ctaSchedule: "Se timeplan",
      currentTitle: "Pågår nå",
      nextTitle: "Neste økt",
      currentStatus: "Åpen nå",
      nextStatus: "Kommer opp",
      locationLabel: "Sted",
      spotsLeft: (count) => `${count} plasser igjen`,
      registeredCount: (count, capacity) => `${count}/${capacity} påmeldt`,
      nobodyRegistered: "Ingen påmeldte enda.",
      infoTitle: "Info",
      levelLabel: "Nivå",
      levelBody: "Alle nivåer er velkommen, fra nybegynner til erfaren.",
      bringLabel: "Ta med",
      bringBody: "Innesko, treningstøy og gjerne egen racket hvis du har.",
    },
    schedule: {
      badge: "Timeplan",
      title: "Planlagte og aktive økter",
      body: "Aktive økter blir stående til sluttidspunktet er passert.",
      tableTitle: "Aktive og kommende økter",
      when: "Når",
      status: "Status",
      location: "Sted",
      capacity: "Kapasitet",
      active: "Pågår",
      upcoming: "Kommer",
      empty: "Ingen kommende økter lagt inn.",
    },
    register: {
      badge: "Påmelding",
      title: "Påmelding til trening",
      body: "Velg økt, skriv navn og oppgi fødselsmåned og fødselsdag for eventuell avmelding senere.",
      sessionLabel: "Økt",
      nameLabel: "Navn",
      namePlaceholder: "Skriv navnet ditt",
      nameHelp: "Minimum 2 tegn.",
      levelLabel: "Nivå",
      birthMonthLabel: "Fødselsmåned",
      birthDayLabel: "Fødselsdag",
      chooseMonth: "Velg måned",
      chooseDay: "Velg dag",
      submit: "Registrer",
      success: "Du er registrert.",
      errors: {
        captcha: "Fullfør CAPTCHA før du sender inn.",
        session: "Velg en økt.",
        birthDate: "Velg fødselsmåned og fødselsdag.",
        generic: "Noe gikk galt.",
      },
    },
    unregister: {
      badge: "Avmelding",
      title: "Meld deg av trening",
      body: "Velg økt, velg påmeldingen din og oppgi fødselsmåned og fødselsdag.",
      sessionLabel: "Økt",
      whoLabel: "Hvem er du?",
      noRegistrations: "Ingen påmeldinger for denne økten",
      birthMonthLabel: "Fødselsmåned",
      birthDayLabel: "Fødselsdag",
      chooseMonth: "Velg måned",
      chooseDay: "Velg dag",
      submit: "Meld meg av",
      success: "Du er meldt av.",
      registrationLabel: (name, level, time) => `${name} – ${level}, meldt på ${time}`,
      errors: {
        captcha: "Fullfør CAPTCHA før du sender inn.",
        registration: "Velg påmeldingen din.",
        birthDate: "Velg fødselsmåned og fødselsdag.",
        generic: "Noe gikk galt.",
      },
    },
    about: {
      badge: "Om oss",
      title: "Kontakt og praktisk info",
      body: "NTNUI Bordtennis arrangerer treninger ved Dragvoll Idrettssenter B217. Her finner du kontaktinfo og hvem som har ansvar for drift, økonomi og planlegging.",
      roles: {
        leader: "Leder",
        deputy: "Nestleder",
        treasurer: "Kasserer",
      },
      email: "E-post",
      phone: "Telefon",
      locationTitle: "Sted",
      locationValue: "Dragvoll Idrettssenter B217",
    },
    levels: {
      beginner: "Nybegynner",
      intermediate: "Viderekommen",
      experienced: "Erfaren",
    },
  },
  en: {
    shell: {
      brand: "NTNUI Table Tennis",
      languageLabel: "Language",
      themeLabel: "Theme",
      themeLight: "Light",
      themeDark: "Dark",
      nav: {
        schedule: "Schedule",
        register: "Register",
        unregister: "Unregister",
        about: "About",
      },
      footerLocation: "Dragvoll Sports Centre B217",
      footerCopyright: (year) => `© ${year} NTNUI Table Tennis`,
    },
    announcements: {
      heading: "Important notices",
      until: (date) => `Until ${date}`,
    },
    home: {
      emptyTitle: "NTNUI Table Tennis",
      emptyBody: "No upcoming sessions have been added yet.",
      heroTag: "Dragvoll Sports Centre B217",
      heroTitle: "Table tennis practice registration",
      heroBody: "See the next session and sign up.",
      ctaRegister: "Register",
      ctaSchedule: "View schedule",
      currentTitle: "Live now",
      nextTitle: "Next session",
      currentStatus: "Open now",
      nextStatus: "Coming up",
      locationLabel: "Location",
      spotsLeft: (count) => `${count} spots left`,
      registeredCount: (count, capacity) => `${count}/${capacity} registered`,
      nobodyRegistered: "No one has registered yet.",
      infoTitle: "Info",
      levelLabel: "Level",
      levelBody: "All levels are welcome, from beginner to experienced.",
      bringLabel: "Bring",
      bringBody: "Indoor shoes, sportswear, and your own racket if you have one.",
    },
    schedule: {
      badge: "Schedule",
      title: "Planned and active sessions",
      body: "Active sessions stay visible until the end time has passed.",
      tableTitle: "Active and upcoming sessions",
      when: "When",
      status: "Status",
      location: "Location",
      capacity: "Capacity",
      active: "Live",
      upcoming: "Upcoming",
      empty: "No upcoming sessions have been added.",
    },
    register: {
      badge: "Register",
      title: "Register for practice",
      body: "Choose a session, enter your name, and provide your birth month and day in case you need to unregister later.",
      sessionLabel: "Session",
      nameLabel: "Name",
      namePlaceholder: "Enter your name",
      nameHelp: "Minimum 2 characters.",
      levelLabel: "Level",
      birthMonthLabel: "Birth month",
      birthDayLabel: "Birth day",
      chooseMonth: "Choose month",
      chooseDay: "Choose day",
      submit: "Register",
      success: "You are registered.",
      errors: {
        captcha: "Complete the CAPTCHA before submitting.",
        session: "Choose a session.",
        birthDate: "Choose your birth month and birth day.",
        generic: "Something went wrong.",
      },
    },
    unregister: {
      badge: "Unregister",
      title: "Unregister from practice",
      body: "Choose the session, choose your registration, and provide your birth month and day.",
      sessionLabel: "Session",
      whoLabel: "Who are you?",
      noRegistrations: "No registrations for this session",
      birthMonthLabel: "Birth month",
      birthDayLabel: "Birth day",
      chooseMonth: "Choose month",
      chooseDay: "Choose day",
      submit: "Unregister me",
      success: "You have been unregistered.",
      registrationLabel: (name, level, time) => `${name} – ${level}, registered at ${time}`,
      errors: {
        captcha: "Complete the CAPTCHA before submitting.",
        registration: "Choose your registration.",
        birthDate: "Choose your birth month and birth day.",
        generic: "Something went wrong.",
      },
    },
    about: {
      badge: "About",
      title: "Contact and practical info",
      body: "NTNUI Table Tennis runs practice sessions at Dragvoll Sports Centre B217. Here you can find contact details and who is responsible for operations, finances, and planning.",
      roles: {
        leader: "Chair",
        deputy: "Vice chair",
        treasurer: "Treasurer",
      },
      email: "Email",
      phone: "Phone",
      locationTitle: "Location",
      locationValue: "Dragvoll Sports Centre B217",
    },
    levels: {
      beginner: "Beginner",
      intermediate: "Intermediate",
      experienced: "Experienced",
    },
  },
  zh: {
    shell: {
      brand: "NTNUI 乒乓球",
      languageLabel: "语言",
      themeLabel: "主题",
      themeLight: "浅色",
      themeDark: "深色",
      nav: {
        schedule: "时间表",
        register: "报名",
        unregister: "取消报名",
        about: "关于我们",
      },
      footerLocation: "Dragvoll 体育中心 B217",
      footerCopyright: (year) => `© ${year} NTNUI 乒乓球`,
    },
    announcements: {
      heading: "重要通知",
      until: (date) => `截止至 ${date}`,
    },
    home: {
      emptyTitle: "NTNUI 乒乓球",
      emptyBody: "目前还没有即将开始的训练。",
      heroTag: "Dragvoll 体育中心 B217",
      heroTitle: "乒乓球训练报名",
      heroBody: "查看下一场训练并报名。",
      ctaRegister: "报名",
      ctaSchedule: "查看时间表",
      currentTitle: "正在进行",
      nextTitle: "下一场训练",
      currentStatus: "现在开放",
      nextStatus: "即将开始",
      locationLabel: "地点",
      spotsLeft: (count) => `剩余 ${count} 个名额`,
      registeredCount: (count, capacity) => `${count}/${capacity} 已报名`,
      nobodyRegistered: "目前还没有人报名。",
      infoTitle: "信息",
      levelLabel: "水平",
      levelBody: "欢迎所有水平的成员参加，从初学者到有经验的球员都可以。",
      bringLabel: "请携带",
      bringBody: "室内运动鞋、运动服，以及如果有的话请自带球拍。",
    },
    schedule: {
      badge: "时间表",
      title: "已安排和正在进行的训练",
      body: "训练会一直显示到结束时间过去为止。",
      tableTitle: "正在进行和即将开始的训练",
      when: "时间",
      status: "状态",
      location: "地点",
      capacity: "容量",
      active: "进行中",
      upcoming: "即将开始",
      empty: "目前还没有即将开始的训练。",
    },
    register: {
      badge: "报名",
      title: "报名训练",
      body: "选择训练，填写姓名，并填写出生月份和日期，以便之后需要取消报名时使用。",
      sessionLabel: "训练",
      nameLabel: "姓名",
      namePlaceholder: "输入你的姓名",
      nameHelp: "至少 2 个字符。",
      levelLabel: "水平",
      birthMonthLabel: "出生月份",
      birthDayLabel: "出生日期",
      chooseMonth: "选择月份",
      chooseDay: "选择日期",
      submit: "提交报名",
      success: "报名成功。",
      errors: {
        captcha: "提交前请先完成 CAPTCHA。",
        session: "请选择训练。",
        birthDate: "请选择出生月份和日期。",
        generic: "发生错误。",
      },
    },
    unregister: {
      badge: "取消报名",
      title: "取消训练报名",
      body: "选择训练、选择你的报名记录，并填写出生月份和日期。",
      sessionLabel: "训练",
      whoLabel: "你是哪位？",
      noRegistrations: "该训练目前没有报名记录",
      birthMonthLabel: "出生月份",
      birthDayLabel: "出生日期",
      chooseMonth: "选择月份",
      chooseDay: "选择日期",
      submit: "取消我的报名",
      success: "你已取消报名。",
      registrationLabel: (name, level, time) => `${name} – ${level}，报名时间 ${time}`,
      errors: {
        captcha: "提交前请先完成 CAPTCHA。",
        registration: "请选择你的报名记录。",
        birthDate: "请选择出生月份和日期。",
        generic: "发生错误。",
      },
    },
    about: {
      badge: "关于我们",
      title: "联系方式和实用信息",
      body: "NTNUI 乒乓球在 Dragvoll 体育中心 B217 组织训练。这里可以找到联系方式以及负责运营、财务和规划的人员。",
      roles: {
        leader: "负责人",
        deputy: "副负责人",
        treasurer: "财务",
      },
      email: "电子邮箱",
      phone: "电话",
      locationTitle: "地点",
      locationValue: "Dragvoll 体育中心 B217",
    },
    levels: {
      beginner: "初学者",
      intermediate: "进阶",
      experienced: "有经验",
    },
  },
  fr: {
    shell: {
      brand: "NTNUI Tennis de table",
      languageLabel: "Langue",
      themeLabel: "Thème",
      themeLight: "Clair",
      themeDark: "Sombre",
      nav: {
        schedule: "Planning",
        register: "Inscription",
        unregister: "Désinscription",
        about: "À propos",
      },
      footerLocation: "Centre sportif Dragvoll B217",
      footerCopyright: (year) => `© ${year} NTNUI Tennis de table`,
    },
    announcements: {
      heading: "Messages importants",
      until: (date) => `Jusqu’au ${date}`,
    },
    home: {
      emptyTitle: "NTNUI Tennis de table",
      emptyBody: "Aucune séance à venir n’a encore été ajoutée.",
      heroTag: "Centre sportif Dragvoll B217",
      heroTitle: "Inscription à l’entraînement de tennis de table",
      heroBody: "Consultez la prochaine séance et inscrivez-vous.",
      ctaRegister: "Inscription",
      ctaSchedule: "Voir le planning",
      currentTitle: "En cours",
      nextTitle: "Prochaine séance",
      currentStatus: "Ouvert maintenant",
      nextStatus: "À venir",
      locationLabel: "Lieu",
      spotsLeft: (count) => `${count} places restantes`,
      registeredCount: (count, capacity) => `${count}/${capacity} inscrits`,
      nobodyRegistered: "Personne n’est encore inscrit.",
      infoTitle: "Infos",
      levelLabel: "Niveau",
      levelBody: "Tous les niveaux sont les bienvenus, du débutant au joueur confirmé.",
      bringLabel: "À apporter",
      bringBody: "Chaussures d’intérieur, tenue de sport et votre propre raquette si vous en avez une.",
    },
    schedule: {
      badge: "Planning",
      title: "Séances prévues et en cours",
      body: "Les séances en cours restent visibles jusqu’à leur heure de fin.",
      tableTitle: "Séances en cours et à venir",
      when: "Quand",
      status: "Statut",
      location: "Lieu",
      capacity: "Capacité",
      active: "En cours",
      upcoming: "À venir",
      empty: "Aucune séance à venir n’a été ajoutée.",
    },
    register: {
      badge: "Inscription",
      title: "S’inscrire à l’entraînement",
      body: "Choisissez une séance, saisissez votre nom et indiquez votre mois et jour de naissance pour une éventuelle désinscription plus tard.",
      sessionLabel: "Séance",
      nameLabel: "Nom",
      namePlaceholder: "Saisissez votre nom",
      nameHelp: "Minimum 2 caractères.",
      levelLabel: "Niveau",
      birthMonthLabel: "Mois de naissance",
      birthDayLabel: "Jour de naissance",
      chooseMonth: "Choisir un mois",
      chooseDay: "Choisir un jour",
      submit: "S’inscrire",
      success: "Vous êtes inscrit.",
      errors: {
        captcha: "Complétez le CAPTCHA avant d’envoyer.",
        session: "Choisissez une séance.",
        birthDate: "Choisissez votre mois et jour de naissance.",
        generic: "Une erreur s’est produite.",
      },
    },
    unregister: {
      badge: "Désinscription",
      title: "Se désinscrire de l’entraînement",
      body: "Choisissez la séance, choisissez votre inscription et indiquez votre mois et jour de naissance.",
      sessionLabel: "Séance",
      whoLabel: "Qui êtes-vous ?",
      noRegistrations: "Aucune inscription pour cette séance",
      birthMonthLabel: "Mois de naissance",
      birthDayLabel: "Jour de naissance",
      chooseMonth: "Choisir un mois",
      chooseDay: "Choisir un jour",
      submit: "Me désinscrire",
      success: "Vous êtes désinscrit.",
      registrationLabel: (name, level, time) => `${name} – ${level}, inscrit à ${time}`,
      errors: {
        captcha: "Complétez le CAPTCHA avant d’envoyer.",
        registration: "Choisissez votre inscription.",
        birthDate: "Choisissez votre mois et jour de naissance.",
        generic: "Une erreur s’est produite.",
      },
    },
    about: {
      badge: "À propos",
      title: "Contact et informations pratiques",
      body: "NTNUI Tennis de table organise des entraînements au centre sportif Dragvoll B217. Vous trouverez ici les coordonnées ainsi que les responsables du fonctionnement, des finances et de la planification.",
      roles: {
        leader: "Présidente",
        deputy: "Vice-présidente",
        treasurer: "Trésorier",
      },
      email: "E-mail",
      phone: "Téléphone",
      locationTitle: "Lieu",
      locationValue: "Centre sportif Dragvoll B217",
    },
    levels: {
      beginner: "Débutant",
      intermediate: "Intermédiaire",
      experienced: "Expérimenté",
    },
  },
  es: {
    shell: {
      brand: "NTNUI Tenis de mesa",
      languageLabel: "Idioma",
      themeLabel: "Tema",
      themeLight: "Claro",
      themeDark: "Oscuro",
      nav: {
        schedule: "Horario",
        register: "Inscripción",
        unregister: "Baja",
        about: "Sobre nosotros",
      },
      footerLocation: "Centro deportivo Dragvoll B217",
      footerCopyright: (year) => `© ${year} NTNUI Tenis de mesa`,
    },
    announcements: {
      heading: "Avisos importantes",
      until: (date) => `Hasta ${date}`,
    },
    home: {
      emptyTitle: "NTNUI Tenis de mesa",
      emptyBody: "Todavía no se han añadido entrenamientos próximos.",
      heroTag: "Centro deportivo Dragvoll B217",
      heroTitle: "Inscripción al entrenamiento de tenis de mesa",
      heroBody: "Consulta el próximo entrenamiento y apúntate.",
      ctaRegister: "Inscripción",
      ctaSchedule: "Ver horario",
      currentTitle: "En curso",
      nextTitle: "Próximo entrenamiento",
      currentStatus: "Abierto ahora",
      nextStatus: "Próximamente",
      locationLabel: "Lugar",
      spotsLeft: (count) => `${count} plazas libres`,
      registeredCount: (count, capacity) => `${count}/${capacity} inscritos`,
      nobodyRegistered: "Todavía no hay nadie inscrito.",
      infoTitle: "Información",
      levelLabel: "Nivel",
      levelBody: "Todos los niveles son bienvenidos, desde principiantes hasta jugadores con experiencia.",
      bringLabel: "Trae",
      bringBody: "Zapatillas de interior, ropa deportiva y tu propia pala si tienes una.",
    },
    schedule: {
      badge: "Horario",
      title: "Entrenamientos programados y activos",
      body: "Los entrenamientos activos permanecen visibles hasta que pasa la hora de finalización.",
      tableTitle: "Entrenamientos activos y próximos",
      when: "Cuándo",
      status: "Estado",
      location: "Lugar",
      capacity: "Capacidad",
      active: "En curso",
      upcoming: "Próximo",
      empty: "No se han añadido entrenamientos próximos.",
    },
    register: {
      badge: "Inscripción",
      title: "Inscribirse al entrenamiento",
      body: "Elige un entrenamiento, escribe tu nombre e indica tu mes y día de nacimiento por si necesitas darte de baja más tarde.",
      sessionLabel: "Entrenamiento",
      nameLabel: "Nombre",
      namePlaceholder: "Escribe tu nombre",
      nameHelp: "Mínimo 2 caracteres.",
      levelLabel: "Nivel",
      birthMonthLabel: "Mes de nacimiento",
      birthDayLabel: "Día de nacimiento",
      chooseMonth: "Elige mes",
      chooseDay: "Elige día",
      submit: "Inscribirse",
      success: "Te has inscrito.",
      errors: {
        captcha: "Completa el CAPTCHA antes de enviar.",
        session: "Elige un entrenamiento.",
        birthDate: "Elige tu mes y día de nacimiento.",
        generic: "Algo salió mal.",
      },
    },
    unregister: {
      badge: "Baja",
      title: "Darse de baja del entrenamiento",
      body: "Elige el entrenamiento, elige tu inscripción e indica tu mes y día de nacimiento.",
      sessionLabel: "Entrenamiento",
      whoLabel: "¿Quién eres?",
      noRegistrations: "No hay inscripciones para este entrenamiento",
      birthMonthLabel: "Mes de nacimiento",
      birthDayLabel: "Día de nacimiento",
      chooseMonth: "Elige mes",
      chooseDay: "Elige día",
      submit: "Darme de baja",
      success: "Te has dado de baja.",
      registrationLabel: (name, level, time) => `${name} – ${level}, inscrito a las ${time}`,
      errors: {
        captcha: "Completa el CAPTCHA antes de enviar.",
        registration: "Elige tu inscripción.",
        birthDate: "Elige tu mes y día de nacimiento.",
        generic: "Algo salió mal.",
      },
    },
    about: {
      badge: "Sobre nosotros",
      title: "Contacto e información práctica",
      body: "NTNUI Tenis de mesa organiza entrenamientos en el centro deportivo Dragvoll B217. Aquí puedes encontrar la información de contacto y quién se encarga de las operaciones, las finanzas y la planificación.",
      roles: {
        leader: "Presidenta",
        deputy: "Vicepresidenta",
        treasurer: "Tesorero",
      },
      email: "Correo",
      phone: "Teléfono",
      locationTitle: "Lugar",
      locationValue: "Centro deportivo Dragvoll B217",
    },
    levels: {
      beginner: "Principiante",
      intermediate: "Intermedio",
      experienced: "Con experiencia",
    },
  },
};

export function parseLocale(value: string | null | undefined): Locale {
  if (value && value in LOCALE_INFO) {
    return value as Locale;
  }
  return "no";
}

export function parseTheme(value: string | null | undefined): Theme {
  return value === "dark" ? "dark" : "light";
}

export function getIntlLocale(locale: Locale) {
  return LOCALE_INFO[locale].intlLocale;
}

export function getMessages(locale: Locale) {
  return SITE_MESSAGES[locale];
}

export function getVenueLabel(locale: Locale) {
  return VENUE_LABELS[locale];
}

export function isDefaultVenueLocation(location: string | null | undefined) {
  if (!location) {
    return false;
  }

  return DEFAULT_LOCATION_ALIASES.has(location.trim().toLowerCase());
}

export function formatVenueLabel(location: string | null | undefined, locale: Locale) {
  if (!location) {
    return getVenueLabel(locale);
  }

  return isDefaultVenueLocation(location) ? getVenueLabel(locale) : location;
}

export function getLevelKey(levelValue: string): LevelKey {
  return LEVEL_KEY_BY_VALUE[levelValue] ?? "beginner";
}
