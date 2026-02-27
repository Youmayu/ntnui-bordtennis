type PersonCardProps = {
  role: string;
  name: string;
  email?: string;
  phone?: string;
};

function PersonCard({ role, name, email, phone }: PersonCardProps) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="text-sm text-muted-foreground">{role}</div>
      <div className="mt-1 text-lg font-semibold">{name}</div>

      <div className="mt-4 space-y-2 text-sm">
        {email && (
          <div>
            <span className="text-muted-foreground">E-post: </span>
            <a className="font-medium text-primary hover:underline" href={`mailto:${email}`}>
              {email}
            </a>
          </div>
        )}
        {phone && (
          <div>
            <span className="text-muted-foreground">Telefon: </span>
            <a className="font-medium text-primary hover:underline" href={`tel:${phone}`}>
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
      <div>
        <h1 className="text-2xl font-semibold">Om oss</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          NTNUI Bordtennis arrangerer treninger ved Dragvoll Idrettssenter. Her finner du kontaktinfo og
          hvem som har ansvar for drift, økonomi og planlegging.
        </p>
      </div>

      <section className="grid gap-6 md:grid-cols-3">
        <PersonCard
          role="Leder"
          name="Maja Bö"
          email="Kommer senere"
          phone="Kommer senere"
        />
        <PersonCard
          role="Nestleder"
          name="He You Ma"
          email="nestleder@ntnui.no"
        />
        <PersonCard
          role="Kasserer"
          name="Karl Andre Thomassen"
          email="Kommer snart"
        />
      </section>

      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Sted</h2>
        <p className="mt-2">Dragvoll Idrettssenter</p>
      </section>
    </div>
  );
}