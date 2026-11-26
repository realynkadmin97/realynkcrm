"use client";

export default function CrmError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg rounded-[1.75rem] border border-white/80 bg-white/80 p-8 shadow-[0_20px_50px_rgba(0,8,81,0.08)]">
      <p className="text-xs font-bold tracking-[0.16em] text-primary uppercase">Command center</p>
      <h1 className="mt-2 text-2xl font-bold text-foreground">This desk hit a snag</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Reload once. If it keeps failing, the database role for the CRM may still be settling after setup.
      </p>
      {error.message ? (
        <p className="mt-4 rounded-2xl bg-primary/5 px-3 py-2 text-xs break-all text-primary">{error.message}</p>
      ) : null}
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
      >
        Reload
      </button>
    </div>
  );
}
