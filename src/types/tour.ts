
import type { Coach } from './coach';
import type { Destination, State, Place } from './location';
import type { Collection } from './collection';
import type { Image } from './media';

export interface Tour {
  id: string;
  title: string;
  slug: string;
  description?: string;
  excerpt?: string;
  cover?: {
    url: string;
    alt?: string;
  };
  startDate: string;
  endDate?: string;
  duration: number;
  price: number;
  deposit?: number;
  maxParticipants?: number;
  availableSpots?: number;
  status?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  featured?: boolean;
  coach: Coach;
  coaches?: Coach[];
  destination: Destination;
  collection?: Collection;
  gallery?: Image[];
  itinerary?: ItineraryDay[];
  includes?: Array<{
    title: string;
    description?: string;
    icon?: {
      url: string;
      alternativeText?: string;
    };
  }>;
  excludes?: Array<{
    title: string;
    description?: string;
    icon?: {
      url: string;
      alternativeText?: string;
    };
  }>;
  highlights?: Array<{
    id: string;
    title: string;
    description: string;
    icon?: {
      url: string;
      alternativeText?: string;
    };
  }>;
  states?: State[];
  places?: Place[];
  sessions?: TourSession[];
}

export interface TourSession {
  id: string;
  start: string;
  end: string;
  price: number;
  deposit?: number;
  maxPax: number;
  status?: string;
  users?: SessionUser[];
}

export interface SessionUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture?: {
    id: string;
    url: string;
    alternativeText?: string;
  };
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  steps?: DayStep[];
  activities?: string[];
  accommodation?: string;
  meals?: string[];
}

export interface DayStep {
  id: string;
  title: string;
  description: string;
  locations?: DayLocation[];
}

export interface DayLocation {
  id: string;
  title: string;
  slug: string;
  description?: string;
  pictures?: any[];
}
