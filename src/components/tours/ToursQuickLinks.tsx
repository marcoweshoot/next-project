import Link from "next/link";
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Star } from 'lucide-react';

export default function ToursQuickLinks() {
  return (
    <section className="py-8 border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/viaggi-fotografici/calendario">
              <Calendar className="w-4 h-4 mr-2" />
              Calendario
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/viaggi-fotografici/destinazioni">
              <MapPin className="w-4 h-4 mr-2" />
              Destinazioni
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/viaggi-fotografici/collezioni">
              <Star className="w-4 h-4 mr-2" />
              Collezioni
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
