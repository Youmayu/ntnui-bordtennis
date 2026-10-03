"use client";

import { useRef, useState, useTransition, type ReactNode } from "react";

export default function SessionForm({ action, children, className, id, resetOnSuccess = false }: {
  action: (formData: FormData) => Promise<{ error: string } | void>;
  children: ReactNode;
  className?: string;
  id?: string;
  resetOnSuccess?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const submitting = useRef(false);

  return (
    <form id={id} className={className} aria-busy={pending} onSubmit={(event) => {
      event.preventDefault();
      if (submitting.current) return;
      const form = event.currentTarget;
      const data = new FormData(form);
      submitting.current = true;
      setError(null);
      startTransition(async () => {
        try {
          const result = await action(data);
          if (result?.error) setError(result.error);
          else if (resetOnSuccess) form.reset();
        } catch {
          setError("Kunne ikke lagre økten. Prøv igjen.");
        } finally {
          submitting.current = false;
        }
      });
    }}>
      {children}
      {error && <p role="alert" className="app-alert-error col-span-full">{error}</p>}
    </form>
  );
}
