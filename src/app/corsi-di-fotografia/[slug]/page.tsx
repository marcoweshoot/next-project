// app/corsi-di-fotografia/[slug]/page.tsx

import { notFound } from 'next/navigation';
import { GraphQLClient, gql } from 'graphql-request';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseDetailHero from '@/components/course-detail/CourseDetailHero';
import CourseInfoCard from '@/components/course-detail/CourseInfoCard';
import CourseContent from '@/components/course-detail/CourseContent';
import CourseTeacher from '@/components/course-detail/CourseTeacher';
import CourseTeacherPhotos from '@/components/course-detail/CourseTeacherPhotos';
import CourseFAQ from '@/components/course-detail/CourseFAQ';
import CourseSidebar from '@/components/course-detail/CourseSidebar';
import CourseDetailCTA from '@/components/course-detail/CourseDetailCTA';
import { CourseViewTracker } from '@/components/course-detail/CourseViewTracker';

const endpoint =
  process.env.STRAPI_GRAPHQL_API || process.env.NEXT_PUBLIC_GRAPHQL_API;
if (!endpoint)
  throw new Error('🛑 Definisci STRAPI_GRAPHQL_API o NEXT_PUBLIC_GRAPHQL_API in .env.local');

const client = new GraphQLClient(endpoint);

// -------------------- GraphQL --------------------
const GET_COURSES_SLUGS = gql`
  query AllSlugs {
    courses {
      slug
    }
  }
`;

const GET_COURSE_BY_SLUG = gql`
  query CourseBySlug($slug: String!) {
    courses(where: { slug: $slug }) {
      id
      title
      excerpt
      url
      presentation
      slug
      price
      locale
      image {
        url
        alternativeText
      }
      seo {
        metaTitle
        metaDescription
        structuredData
      }
      teacher {
        firstName
        lastName
        instagram
        bio
        profilePicture {
          url
          alternativeText
        }
        pictures {
          id
          title
          image {
            id
            url
            alternativeText
            caption
            width
            height
          }
        }
      }
      cover {
        url
        alternativeText
      }
      faqs {
        id
        question
        answer
      }
      reviews {
        id
        title
        description
        rating
        user {
          id
          username
        }
      }
      totalLessons
    }
  }
`;

// ISR / SSG
export const revalidate = 60;

// -------------------- Helpers --------------------
function normalizePictures(pictures: any[] = []) {
  return pictures.map((pic) => {
    const imgs = Array.isArray(pic?.image)
      ? pic.image
      : pic?.image
      ? [pic.image]
      : [];

    return {
      id: String(pic?.id ?? Math.random()),
      title: pic?.title ?? '',
      image: imgs
        .filter(Boolean)
        .map((img: any) => ({
          id: String(img?.id ?? img?.url ?? Math.random()),
          url: String(img?.url ?? ''),
          alternativeText: String(img?.alternativeText ?? ''),
          caption: img?.caption ?? '',
          width: typeof img?.width === 'number' ? img.width : undefined,
          height: typeof img?.height === 'number' ? img.height : undefined,
        })),
    };
  });
}

// -------------------- Static params & metadata --------------------
export async function generateStaticParams() {
  const { courses } = await client.request<{ courses: { slug: string }[] }>(
    GET_COURSES_SLUGS
  );
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { courses } = await client.request<{ courses: any[] }>(
    GET_COURSE_BY_SLUG,
    { slug }
  );
  const data = courses[0];
  if (!data) return { title: 'Corso non trovato', description: '' };

  // NB: se cover.url è relativa, la lascio così (Next la risolverà nel client con <Image/>)
  return {
    title: data.seo?.metaTitle || `${data.title} – Corso di Fotografia WeShoot`,
    description: data.seo?.metaDescription || data.excerpt,
    openGraph: {
      title: data.seo?.metaTitle || data.title,
      description: data.seo?.metaDescription || data.excerpt,
      url: `https://www.weshoot.it/corsi-di-fotografia/${data.slug}`,
      images: data.cover?.url ? [{ url: data.cover.url, alt: data.cover?.alternativeText || data.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.seo?.metaTitle || data.title,
      description: data.seo?.metaDescription || data.excerpt,
      images: data.cover?.url ? [data.cover.url] : [],
    },
  };
}

// -------------------- Page --------------------
export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { courses } = await client.request<{ courses: any[] }>(
    GET_COURSE_BY_SLUG,
    { slug }
  );
  const data = courses[0];
  if (!data) notFound();

  const course = {
    id: data.id,
    title: data.title,
    excerpt: data.excerpt || '',
    url: data.url || '',
    presentation: data.presentation || '',
    slug: data.slug,
    price: data.price || 0,
    locale: data.locale || 'it',
    image: data.image
      ? {
        id: data.image.url,
        url: data.image.url,
        alternativeText: data.image.alternativeText || data.title,
      }
      : undefined,
    seo: data.seo,
    teacher: data.teacher
      ? {
          firstName: data.teacher.firstName,
          lastName: data.teacher.lastName,
          instagram: data.teacher.instagram || '',
          bio: data.teacher.bio || '',
          profilePicture: data.teacher.profilePicture
            ? {
                id: data.teacher.profilePicture.url,
                url: data.teacher.profilePicture.url,
                alternativeText:
                  data.teacher.profilePicture.alternativeText ||
                  `${data.teacher.firstName} ${data.teacher.lastName}`,
              }
            : undefined,
          // 🔧 QUI LA FIX: manteniamo SEMPRE image come array
          pictures: normalizePictures(data.teacher.pictures || []),
        }
      : undefined,
    cover: data.cover
      ? {
          id: data.cover.url,
          url: data.cover.url,
          alternativeText: data.cover?.alternativeText || data.title,
        }
      : undefined,
    faqs: data.faqs || [],
    reviews: data.reviews || [],
    totalLessons: data.totalLessons || 0,
  };

  return (
    <>
      <Header />
      {/* Track ViewCategory event for Facebook Pixel */}
      <CourseViewTracker courseTitle={course.title} courseId={course.id} />
      <main className="min-h-screen bg-background transition-colors">
        <CourseDetailHero course={course} />
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <CourseContent course={course} />
            </div>
            <aside>
              <CourseInfoCard course={course} />
              <div className="mt-8">
                <CourseSidebar />
              </div>
            </aside>
          </div>
        </section>
        <CourseTeacher course={course} />
        {/* Usa lo stesso shape del singolo coach */}
        <CourseTeacherPhotos pictures={course.teacher?.pictures || []} />
        <CourseFAQ faqs={course.faqs} />
        <CourseDetailCTA course={course} />
      </main>
      <Footer />
    </>
  );
}
