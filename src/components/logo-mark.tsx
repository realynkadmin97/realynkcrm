import Image from "next/image";

/** Realynk circular logo mark. */
export function LogoMark({ className = "h-11 w-11", priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/brand/logo-mark.png"
      alt="Realynk"
      width={256}
      height={256}
      unoptimized
      priority={priority}
      className={`rounded-full ${className}`}
    />
  );
}
