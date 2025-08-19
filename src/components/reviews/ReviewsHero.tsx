import Image from 'next/image';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface ReviewsHeroProps {
  totalReviews: number;
}

export default function ReviewsHero({ totalReviews }: ReviewsHeroProps) {
  return (
    <section className="relative bg-gradient-to-r from-gray-900 to-gray-700 pt-20 overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture/photo-1469474968028-56623f02e42e.avif"
          alt="WeShoot recensioni"
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Ecco cosa i WeShooters dicono di noi
          </h1>
          <p className="text-xl text-gray-200 mb-8">
            {totalReviews}+ recensioni non possono sbagliare...
          </p>
          <p className="text-sm text-gray-300 uppercase tracking-wider">
            WESHOOT RECENSIONI
          </p>

          {/* Breadcrumbs */}
          <div className="flex justify-center mt-8">
            <Breadcrumb className="text-gray-300">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/" className="hover:text-white">
                      WeShoot
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-white">Recensioni</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </div>
    </section>
  );
}
