import Link from "next/link";
import Image from "next/image";
import React from "react";
import { Instagram } from "lucide-react";

const abs = (u?: string | null) =>
  u ? (u.startsWith("http") ? u : `https://api.weshoot.it${u}`) : undefined;

interface CoachCardProps {
  coach: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    username: string;
    bio?: string | null;
    profilePicture?: {
      id: string;
      url: string;
      alternativeText?: string | null;
    } | null;
    instagram?: string | null;
  };
}

const CoachCard: React.FC<CoachCardProps> = ({ coach }) => {
  const initial = (s?: string | null) => s?.trim()?.[0]?.toUpperCase() ?? "";
  const displayName =
    [coach.firstName, coach.lastName].filter(Boolean).join(" ") || coach.username;

  const initials = (() => {
    const a = initial(coach.firstName);
    const b = initial(coach.lastName);
    if (a || b) return `${a}${b}`.trim() || a || b;
    const parts = displayName.trim().split(/\s+/);
    return parts.slice(0, 2).map(p => p[0]?.toUpperCase() ?? "").join("") || "?";
  })();

  const ig = coach.instagram
    ? coach.instagram
        .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
        .replace(/\/+$/, "")
        .replace(/^@/, "")
    : null;

  const imgSrc = abs(coach.profilePicture?.url);

  return (
    <div className="text-center group">
      {/* Profile Picture */}
      <div className="relative mb-4">
        {imgSrc ? (
          <div className="relative mx-auto h-32 w-32 border-4 border-white rounded-full shadow-lg overflow-hidden group-hover:shadow-xl">
            <Image
              src={imgSrc}
              alt={coach.profilePicture?.alternativeText || displayName}
              width={128}
              height={128}
              className="object-cover h-full w-full"
              loading="lazy"
              sizes="128px"
            />
          </div>
        ) : (
          <div
            className="h-32 w-32 rounded-full mx-auto bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg group-hover:shadow-xl"
            aria-label={displayName}
          >
            {initials}
          </div>
        )}
      </div>

      {/* Coach Info */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
          {coach.username ? (
            <Link href={`/fotografi/${coach.username}`}>{displayName}</Link>
          ) : (
            <span>{displayName}</span>
          )}
        </h3>

        {ig && (
          <div className="flex justify-center">
            <a
              href={`https://www.instagram.com/${ig}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:from-pink-600 hover:to-purple-700 transition-all hover:scale-110"
              title={`Segui ${displayName} su Instagram`}
            >
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachCard;
