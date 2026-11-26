import Image from "next/image";

export function BrandMark({ className = "h-16 w-auto" }: { className?: string }) {
  return (
    <Image
      src="/brand/logo-realynk-assistants.png"
      alt="Realynk Assistants"
      width={1400}
      height={273}
      unoptimized
      className={className}
    />
  );
}
