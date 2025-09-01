import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import CoachCard from "./CoachCard";

export interface Coach {
  id: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  slug: string;
  href: string;
  profilePicture?: {
    id: string;
    url: string;
    alternativeText?: string | null;
  } | null;
  instagram?: string | null;
  bio?: string | null;
}

interface CoachesListProps {
  coaches: Coach[];
  loading: boolean;
}

export default function CoachesList({ coaches, loading }: CoachesListProps) {
  if (loading) {
    return (
      <div
        className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        aria-busy="true"
      >
        {[...Array(8)].map((_, i) => (
          <div key={i} className="text-center">
            <Skeleton className="mx-auto mb-4 h-32 w-32 rounded-full" />
            <Skeleton className="mx-auto mb-2 h-6 w-32" />
            <Skeleton className="mx-auto h-4 w-8" />
          </div>
        ))}
      </div>
    );
  }

  if (!coaches || coaches.length === 0) {
    return (
      <div className="py-12 text-center">
        <h2 className="mb-4 text-2xl font-bold text-foreground">
          Nessun coach disponibile
        </h2>
        <p className="mb-8 text-muted-foreground">
          I nostri coach saranno presto disponibili.
        </p>
        <Button asChild>
          <Link href="/viaggi-fotografici/">Scopri tutti i viaggi</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 text-foreground sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {coaches.map((coach, index) => {
        const base =
          (coach.id && coach.id !== "undefined" ? coach.id : undefined) ??
          coach.slug ??
          coach.username ??
          "coach";
        const key = `${base}-${index}`; // ✅ unico anche se due slug uguali
  
        return (
          <div key={key} className="min-w-0">
            <CoachCard coach={coach} />
          </div>
        );
      })}
    </div>
  );  
}
