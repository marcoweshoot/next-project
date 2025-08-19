
import type { Image } from './media';

export interface Story {
  id: string;
  name: string;
  slug: string;
  description?: string;
  excerpt?: string;
  content?: string;
  publishedAt?: string;
  cover?: Image;
  author?: {
    firstName: string;
    lastName?: string;
    profilePicture?: Image;
  };
}

export interface Picture {
  id: string;
  title?: string;
  type?: string;
  image: Image[]; // Changed to array to match GraphQL structure
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  presentation?: string;
  totalLessons?: number;
  price?: number;
  url?: string;
  cover?: Image;
  image?: Image;
  teacher?: {
    firstName: string;
    lastName?: string;
    bio?: string;
    instagram?: string;
    profilePicture?: Image;
    pictures?: Picture[];
  };
  faqs?: FAQ[];
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  order?: number;
  videoUrl?: string;
}
