type PersonCardProps = {
  role: string;
  name: string;
  email?: string;
  phone?: string;
};

function PersonCard({ role, name, email, phone }: PersonCardProps) {
  return (
    <div className="rounded-[1.75rem] border border-white/70 bg-white/90 p-6 shadow-[0_18px_50px_rgba(86,39,26,0.10)]">
      <div className="text-sm text-[color:rgb(113,91,83)]">{role}</div>
      <div className="mt-1 text-lg font-semibold text-[color:rgb(37,26,20)]">{name}</div>

      <div className="mt-4 space-y-2 text-sm">
        {email && (
          <div>
            <span className="text-[color:rgb(113,91,83)]">E-post: </span>
            <a className="font-medium text-[color:rgb(163,50,31)] hover:underline" href={`mailto:${email}`}>
              {email}
            </a>
          </div>
        )}
        {phone && (
          <div>
            <span className="text-[color:rgb(113,91,83)]">Telefon: </span>
            <a className="font-medium text-[color:rgb(163,50,31)] hover:underline" href={`tel:${phone}`}>
              {phone}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <span className="inline-flex rounded-full border border-[color:rgba(163,50,31,0.16)] bg-[rgba(163,50,31,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[color:rgb(139,45,29)]">
          Om oss
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-[color:rgb(37,26,20)]">
          Kontakt og praktisk info
        </h1>
        <p className="max-w-2xl text-[color:rgb(94,77,70)]">
          NTNUI Bordtennis arrangerer treninger ved Dragvoll Idrettssenter. Her finner du kontaktinfo og hvem som har ansvar for drift, økonomi og planlegging.
        </p>
      </div>

      <section className="grid gap-6 md:grid-cols-3">
        <PersonCard role="Leder" name="Maja Bö" email="maja.bockenkamp@ntnui.no" />
        <PersonCard role="Nestleder" name="He You Ma" email="heym@stud.ntnu.no" />
        <PersonCard role="Kasserer" name="Karl Andre Thomassen" email="karl.thomassen@ntnui.no" />
      </section>

      <section className="rounded-[1.75rem] border border-white/70 bg-white/90 p-6 shadow-[0_18px_50px_rgba(86,39,26,0.10)]">
        <h2 className="text-lg font-semibold text-[color:rgb(37,26,20)]">Sted</h2>
        <p className="mt-2 text-[color:rgb(94,77,70)]">Dragvoll Idrettssenter</p>
      </section>
    </div>
  );
}
