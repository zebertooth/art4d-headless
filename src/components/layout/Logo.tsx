import Image from "next/image";
import Link from "next/link";
import { hrefWithLang } from "@/lib/navigation";
import type { WPLanguage } from "@/lib/types";

export function Logo({
  lang,
  className = "",
}: {
  lang: WPLanguage;
  className?: string;
}) {
  return (
    <Link
      href={hrefWithLang("/", lang)}
      className={`inline-block ${className}`}
    >
      <Image
        src="/logo.png"
        alt="art4d"
        width={200}
        height={56}
        priority
        className="hidden h-10 w-auto sm:block lg:h-12"
      />
      <Image
        src="/logo-small.png"
        alt="art4d"
        width={140}
        height={44}
        priority
        className="h-9 w-auto sm:hidden"
      />
    </Link>
  );
}
