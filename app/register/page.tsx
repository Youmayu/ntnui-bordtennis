import type { Metadata } from "next";
import RegisterPageContent from "@/app/components/RegisterPageContent";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Påmelding / Register",
  description:
    "Meld deg på trening hos NTNUI Bordtennis og NTNUI Table Tennis ved Dragvoll Idrettssenter B217.",
  path: "/register",
  keywords: ["påmelding bordtennis", "register table tennis"],
});

export default function RegisterPage() {
  return <RegisterPageContent />;
}
