"use client";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc] px-4 text-[#000851]">
      <div className="w-full max-w-lg rounded-[1.75rem] border border-[#0543b8]/15 bg-white p-8 shadow-[0_20px_50px_rgba(0,8,81,0.08)]">
        <p className="text-xs font-bold tracking-[0.16em] text-[#0543b8] uppercase">Rea&apos;s Command Center</p>
        <h1 className="mt-2 text-2xl font-bold">This page couldn&apos;t finish loading</h1>
        <p className="mt-2 text-sm text-[#000851]/65">
          Try reload. If it keeps failing, copy the detail below and send it to your builder.
        </p>
        {error.message ? (
          <p className="mt-4 rounded-2xl bg-[#0543b8]/5 px-3 py-2 text-xs break-all text-[#0543b8]">{error.message}</p>
        ) : null}
        {error.digest ? (
          <p className="mt-2 text-xs text-[#000851]/45">Reference: {error.digest}</p>
        ) : null}
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-full bg-[#0543b8] px-5 py-2.5 text-sm font-bold text-white"
        >
          Reload
        </button>
      </div>
    </main>
  );
}
