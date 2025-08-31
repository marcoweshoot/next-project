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

// Strapi GraphQL endpoint
const endpoint = process.env.STRAPI_GRAPHQL_API || process.env.NEXT_PUBLIC_GRAPHQL_API;
if (!endpoint) throw new Error('🛑 Definisci STRAPI_GRAPHQL_API o NEXT_PUBLIC_GRAPHQL_API in .env.local');
const client = new GraphQLClient(endpoint);

// GraphQL queries
const GET_COURSES_SLUGS = gql`
  query AllSlugs { courses { slug } }
`;
const GET_COURSE_BY_SLUG = gql`
  query CourseBySlug($slug: String!) {
    courses(where: { slug: $slug }) {
      id title excerpt url presentation slug price locale
      image { url alternativeText }
      seo { metaTitle metaDescription structuredData }
      teacher {
        firstName lastName instagram bio
        profilePicture { url alternativeText }
        pictures { id image { url alternativeText } }
      }
      cover { url }
      faqs { id question answer }
      reviews { id title description rating user { id username } }
      totalLessons
    }
  }
`;

export const revalidate = 60;

export async function generateStaticParams() {
  const { courses } = await client.request<{ courses: { slug: string }[] }>(GET_COURSES_SLUGS);
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { courses } = await client.request<{ courses: any[] }>(
    GET_COURSE_BY_SLUG,
    { slug }
  );
  const data = courses[0];
  if (!data) return { title: 'Corso non trovato', description: '' };

  return {
    title: data.seo?.metaTitle || `${data.title} – Corso di Fotografia WeShoot`,
    description: data.seo?.metaDescription || data.excerpt,
    openGraph: {
      title: data.seo?.metaTitle || data.title,
      description: data.seo?.metaDescription || data.excerpt,
      url: `https://www.weshoot.it/corsi-di-fotografia/${data.slug}`,
      images: data.cover ? [{ url: data.cover.url }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.seo?.metaTitle || data.title,
      description: data.seo?.metaDescription || data.excerpt,
      images: data.cover ? [data.cover.url] : [],
    },
  };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
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
    publishedAt: data.published_at || '',
    image: data.image
      ? { id: data.image.url, url: data.image.url, alternativeText: data.image.alternativeText || data.title }
      : undefined,
    seo: data.seo,
    teacher: data.teacher
      ? {
          firstName: data.teacher.firstName,
          lastName: data.teacher.lastName,
          instagram: data.teacher.instagram || '',
          bio: data.teacher.bio || '',
          profilePicture: data.teacher.profilePicture
            ? { id: data.teacher.profilePicture.url, url: data.teacher.profilePicture.url, alternativeText: data.teacher.profilePicture.alternativeText || `${data.teacher.firstName} ${data.teacher.lastName}` }
            : undefined,
          pictures: data.teacher.pictures?.map((pic) => ({ id: pic.id, image: [{ id: pic.image.url, url: pic.image.url, alternativeText: pic.image.alternativeText || pic.id }] })) || [],
        }
      : undefined,
    cover: data.cover ? { id: data.cover.url, url: data.cover.url, alternativeText: '' } : undefined,
    faqs: data.faqs || [],
    reviews: data.reviews || [],
    totalLessons: data.totalLessons || 0,
  };

  return (
    <>
      <Header />
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
        <CourseTeacherPhotos pictures={course.teacher?.pictures || []} />
        <CourseFAQ faqs={course.faqs} />
        <CourseDetailCTA course={course} />
      </main>
      <Footer />
    </>
  );
}
