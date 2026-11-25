import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <h1 className="font-heading text-3xl">That record is not available</h1>
      <p className="mt-2 text-sm text-muted-foreground">It may belong to someone else, or it may not exist.</p>
      <Link href="/" className="mt-4 text-sm underline-offset-4 hover:underline">
        Back to today
      </Link>
    </main>
  );
}
