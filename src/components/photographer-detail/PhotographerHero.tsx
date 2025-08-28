import Link from "next/link";
import Image from "next/image";
import { Instagram } from "lucide-react";

interface PhotographerHeroProps {
  photographer: {
    firstName: string;
    lastName: string;
    bio?: string;
    username: string;
    instagram?: string;
    profilePicture?: { url: string; alternativeText?: string };
    cover?: { url: string; alternativeText?: string };
  };
}

const abs = (u?: string) =>
  u ? (u.startsWith("http") ? u : `https://api.weshoot.it${u}`) : undefined;

export default function PhotographerHero({ photographer }: PhotographerHeroProps) {
  const backgroundImage =
    abs(photographer.cover?.url) ||
    "https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture/photo-1469474968028-56623f02e42e.avif";

  const profilePictureUrl =
    abs(photographer.profilePicture?.url) ||
    "https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture/Coach-WeShoot.avif";

  return (
    <div className="relative h-[70vh] overflow-hidden">
      {/* LCP image */}
      <div className="absolute inset-0">
        <Image
          src={backgroundImage}
          alt={
            photographer.cover?.alternativeText ??
            `${photographer.firstName} ${photographer.lastName} cover`
          }
          fill
          className="object-cover"
          priority
          fetchPriority="high"
          sizes="(max-width:640px) 100vw, (max-width:1024px) 100vw, 1200px"
        />
        <div className="absolute inset-0 bg-black/60 dark:bg-black/70" aria-hidden="true" />
      </div>

      {/* Foreground */}
      <div className="relative z-10 flex h-full items-center justify-center">
        <div className="mx-auto max-w-4xl px-4 text-center text-primary-foreground">
          {/* Avatar */}
          <div className="mx-auto mb-8 h-32 w-32 overflow-hidden rounded-full shadow-2xl ring-4 ring-primary-foreground ring-opacity-80 ring-offset-2 ring-offset-transparent">
            <Image
              src={profilePictureUrl}
              alt={`${photographer.firstName} ${photographer.lastName}`}
              width={128}
              height={128}
              sizes="128px"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Nome */}
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">
            {photographer.firstName} {photographer.lastName}
          </h2>

          {/* Bio */}
          {photographer.bio && (
            <div
              className="mx-auto mb-8 max-w-3xl text-xl font-light leading-relaxed md:text-2xl"
              dangerouslySetInnerHTML={{ __html: photographer.bio }}
            />
          )}

          {/* Instagram */}
          {photographer.instagram && (
            <div className="mb-8">
              <a
                href={
                  photographer.instagram.startsWith("http")
                    ? photographer.instagram
                    : `https://instagram.com/${photographer.instagram}`
                }
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Segui ${photographer.instagram} su Instagram`}
                title={`Segui @${photographer.instagram}`}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/20 backdrop-blur-sm text-primary-foreground transition-all duration-300 hover:scale-110 hover:bg-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              >
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          )}

          {/* Breadcrumbs */}
          <nav className="mt-12 text-sm text-muted-foreground">
            <ul className="inline-flex items-center space-x-2">
              <li>
                <Link href="/" className="hover:underline hover:text-primary">
                  WeShoot
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/fotografi" className="hover:underline hover:text-primary">
                  Fotografi
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground">
                {photographer.firstName} {photographer.lastName}
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
