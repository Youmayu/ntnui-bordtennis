import type { Locale } from "@/lib/site-content";

const BOARD_MEMBER_LABELS: Record<Locale, string> = {
  no: "Styremedlem",
  en: "Board member",
  da: "Bestyrelsesmedlem",
  sv: "Styrelseledamot",
  de: "Vorstandsmitglied",
  zh: "理事会成员",
  fr: "Membre du bureau",
  es: "Miembro de la junta",
};

export function getBoardMemberLabel(locale: Locale) {
  return BOARD_MEMBER_LABELS[locale];
}

export const BOARD_MEMBERS = [
  {
    id: "maja-bo",
    name: "Maja B\u00F6",
    roleKey: "leader",
    email: "maja.bockenkamp@ntnui.no",
  },
  {
    id: "he-you-ma",
    name: "He You Ma",
    roleKey: "deputy",
    email: "he.ma@ntnui.no",
  },
  {
    id: "karl-andre-thomassen",
    name: "Karl Andre Thomassen",
    roleKey: "treasurer",
    email: "karl.thomassen@ntnui.no",
  },
] as const;

export type BoardMember = (typeof BOARD_MEMBERS)[number];
export type BoardMemberId = BoardMember["id"];
export type BoardMemberRoleKey = BoardMember["roleKey"];

const BOARD_MEMBER_ID_SET = new Set<string>(BOARD_MEMBERS.map((member) => member.id));

export function isBoardMemberId(value: unknown): value is BoardMemberId {
  return typeof value === "string" && BOARD_MEMBER_ID_SET.has(value);
}

export function normalizeBoardMemberIds(value: unknown): BoardMemberId[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const selectedIds = new Set(value.filter(isBoardMemberId));
  return BOARD_MEMBERS.filter((member) => selectedIds.has(member.id)).map(
    (member) => member.id
  );
}
