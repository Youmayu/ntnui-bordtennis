import type { Locale } from "@/lib/site-content";

export const DISCORD_INVITE_URL = "https://discord.gg/pAaAqAFayE";

type DiscordCopy = {
  title: string;
  description: string;
  join: string;
  opensInNewTab: string;
};

export const DISCORD_COPY: Record<Locale, DiscordCopy> = {
  no: {
    title: "Vi snakkes på Discord!",
    description: "Bli med i serveren vår for beskjeder fra klubben og en prat med andre spillere.",
    join: "Bli med på Discord",
    opensInNewTab: "Åpnes i en ny fane",
  },
  en: {
    title: "Stay in touch on Discord!",
    description: "Join our server for club updates and a chat with other players.",
    join: "Join our Discord",
    opensInNewTab: "Opens in a new tab",
  },
  da: {
    title: "Vi ses på Discord!",
    description: "Kom med på vores server for beskeder fra klubben og en snak med andre spillere.",
    join: "Kom med på Discord",
    opensInNewTab: "Åbner i en ny fane",
  },
  sv: {
    title: "Vi hörs på Discord!",
    description: "Gå med i vår server för nyheter från klubben och en pratstund med andra spelare.",
    join: "Gå med på Discord",
    opensInNewTab: "Öppnas i en ny flik",
  },
  de: {
    title: "Bleib über Discord in Kontakt!",
    description: "Tritt unserem Server bei, erhalte Neuigkeiten vom Verein und tausche dich mit anderen Spielern aus.",
    join: "Discord beitreten",
    opensInNewTab: "Öffnet in einem neuen Tab",
  },
  zh: {
    title: "在 Discord 上保持联系！",
    description: "加入我们的服务器，获取俱乐部通知，与其他球友交流。",
    join: "加入 Discord",
    opensInNewTab: "在新标签页中打开",
  },
  fr: {
    title: "Gardons le contact sur Discord !",
    description: "Rejoins notre serveur pour suivre les nouvelles du club et discuter avec les autres joueurs.",
    join: "Rejoindre Discord",
    opensInNewTab: "S’ouvre dans un nouvel onglet",
  },
  es: {
    title: "¡Sigamos en contacto en Discord!",
    description: "Únete a nuestro servidor para recibir novedades del club y charlar con otros jugadores.",
    join: "Unirse a Discord",
    opensInNewTab: "Se abre en una pestaña nueva",
  },
};
