import { Metadata } from "next";

import { getClient } from "@/lib/apolloClient";
import { GET_COLLECTIONS } from "@/graphql/queries";
import { GET_GROUP_PICTURES } from "@/graphql/queries/pictures";
import { GET_HOMEPAGE } from "@/graphql/queries/homepage";
import { GET_COURSES } from "@/graphql/queries/courses";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroVideoSection from "@/components/home/HeroVideoSection";
import dynamicImport from "next/dynamic";

// Lazy load dei componenti pesanti
const CollectionSection = dynamicImport(() => import("@/components/home/CollectionSection"), {
  loading: () => <div className="py-16 bg-gray-50 animate-pulse" />,
  ssr: true,
});

const ToursSection = dynamicImport(() => import("@/components/home/ToursSection"), {
  loading: () => <div className="py-16 bg-gray-50 animate-pulse" />,
  ssr: true,
});

const WhySection = dynamicImport(() => import("@/components/WhySection"), {
  loading: () => <div className="py-16 bg-gray-50 animate-pulse" />,
  ssr: true,
});

const GallerySection = dynamicImport(() => import("@/components/home/GallerySection"), {
  loading: () => <div className="py-16 bg-gray-50 animate-pulse" />,
  ssr: true,
});

const LastMinuteSection = dynamicImport(() => import("@/components/home/LastMinuteSection"), {
  loading: () => <div className="py-16 bg-gray-50 animate-pulse" />,
  ssr: true,
});

const WhatsWeShootSection = dynamicImport(() => import("@/components/home/WhatsWeShootSection"), {
  loading: () => <div className="py-16 bg-gray-50 animate-pulse" />,
  ssr: true,
});

const CoursesSection = dynamicImport(() => import("@/components/home/CoursesSection"), {
  loading: () => <div className="py-16 bg-gray-50 animate-pulse" />,
  ssr: true,
});

const AcademySection = dynamicImport(() => import("@/components/home/AcademySection"), {
  loading: () => <div className="py-16 bg-gray-50 animate-pulse" />,
  ssr: true,
});

import { transformTours, getFullMediaUrl } from "@/utils/TourDataUtilis";

export const dynamic = "force-static"; // build statica completa

export const metadata: Metadata = {
  title: "WeShoot.it - Viaggi Fotografici nel Mondo",
  description:
    "Esplora i nostri viaggi fotografici unici e corsi online per appassionati. Scopri destinazioni mozzafiato con coach professionali.",
};

const HomePage = async () => {
  const client = getClient();

  const [
    { data: homePageData },
    { data: collectionsData },
    { data: picturesData },
    { data: coursesData }
  ] = await Promise.all([
    client.query({ query: GET_HOMEPAGE, variables: { locale: "it" } }),
    client.query({ query: GET_COLLECTIONS, variables: { locale: "it" } }),
    client.query({ query: GET_GROUP_PICTURES, variables: { limit: 50 } }),
    client.query({ query: GET_COURSES, variables: { locale: "it", limit: 3 } }),
  ]);

  const rawTours = homePageData?.homePage?.Tours?.tours || [];
  const transformedTours = transformTours(rawTours);

  const homePageTours = {
    id: homePageData?.homePage?.id || "",
    title: homePageData?.homePage?.Tours?.title || "Viaggi in evidenza",
    subtitle: homePageData?.homePage?.Tours?.subtitle || "Le prossime partenze da non perdere",
    tours: transformedTours,
  };

  const collections = collectionsData?.collections || [];

  const pictures = picturesData?.pictures?.map((p: any) => {
    const image = Array.isArray(p.image) ? p.image[0] : p.image;
    return {
      id: p.id,
      url: image?.url ? getFullMediaUrl(image.url) : '',
      alt: image?.alternativeText || '',
      title: p.title || '',
    };
  }) || [];

  const courses = coursesData?.courses || [];

  return (
    <>
      <Header />

      <main>
        <HeroVideoSection />

      <section id="contenuti" className="-mt-2">
        <CollectionSection collections={collections} loading={false} />
      </section>

        <ToursSection homePageTours={homePageTours} />

        <WhySection />

        <GallerySection pictures={pictures} loading={false} />

        <LastMinuteSection tours={transformedTours} daysAhead={60} />

        <WhatsWeShootSection />
        <CoursesSection courses={courses} />
        <AcademySection />
      </main>

      <Footer />
    </>
  );
};

export default HomePage;
