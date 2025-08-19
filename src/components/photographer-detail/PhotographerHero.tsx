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
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Foreground */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center text-white px-4 max-w-4xl mx-auto">
          {/* Avatar (server-friendly) */}
          <div className="mb-8 mx-auto w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl">
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {photographer.firstName} {photographer.lastName}
          </h2>

          {/* Bio */}
          {photographer.bio && (
            <div
              className="text-xl md:text-2xl font-light leading-relaxed mb-8 max-w-3xl mx-auto"
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
                className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-red-500 transition-all duration-300 hover:scale-110"
                title={`Segui @${photographer.instagram}`}
              >
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          )}

          {/* Breadcrumbs */}
          <nav className="mt-12 text-sm text-gray-300">
            <ul className="inline-flex items-center space-x-2">
              <li>
                <Link href="/" className="hover:underline">
                  WeShoot
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/fotografi" className="hover:underline">
                  Fotografi
                </Link>
              </li>
              <li>/</li>
              <li className="text-white">
                {photographer.firstName} {photographer.lastName}
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
