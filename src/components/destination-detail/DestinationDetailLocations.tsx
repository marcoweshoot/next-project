import Link from "next/link";
import Image from "next/image";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Location {
  id: string;
  title: string;
  slug: string;
  description?: string;
  pictures?: Array<{
    image?: Array<{
      url: string;
    }>;
  }>;
}

interface DestinationDetailLocationsProps {
  locations: Location[];
  destination?: {
    name: string;
    slug: string;
  };
  loading: boolean;
}

const FALLBACK_IMAGE =
  "https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture//photo-1469474968028-56623f02e42e.avif";

const getLocationMainImage = (location: Location): string => {
  const firstImage = location?.pictures?.[0]?.image?.[0]?.url;
  return firstImage || FALLBACK_IMAGE;
};

const DestinationDetailLocations: React.FC<DestinationDetailLocationsProps> = ({
  locations,
  destination,
  loading,
}) => {
  if (locations.length === 0 && !loading) return null;

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Location da Fotografare
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Scopri i luoghi più fotografici e iconici di {destination?.name}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? [...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden bg-card text-card-foreground">
                  <Skeleton className="h-64 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))
            : locations.map((location) => (
                <Card
                  key={location.id}
                  className="overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer bg-card text-card-foreground"
                >
                  <Link
                    href={`/viaggi-fotografici/destinazioni/${destination?.slug}/posti/${location.slug}`}
                    className="block"
                  >
                    <div className="relative overflow-hidden h-64 w-full">
                      <Image
                        src={getLocationMainImage(location)}
                        alt={location.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {location.title}
                        </h3>
                        {location.description && (
                          <p className="text-white/80 text-sm line-clamp-2">
                            {location.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
        </div>
      </div>
    </section>
  );
};

export default DestinationDetailLocations;
