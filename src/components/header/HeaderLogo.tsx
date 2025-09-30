import Link from "next/link";
import Image from "next/image";

interface HeaderLogoProps {
  logoSrc: string;
}

export default function HeaderLogo({ logoSrc }: HeaderLogoProps) {
  return (
    <Link href="/" className="flex items-center" title="WeShoot | Viaggi Fotografici">
      <Image
        src={logoSrc}
        alt="WeShoot"
        width={120}
        height={35}
        priority
      />
    </Link>
  );
}
