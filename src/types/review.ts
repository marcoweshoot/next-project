
import type { Tour } from './tour';
import type { Coach } from './coach';

export interface Review {
  id: string;
  rating: number;
  comment: string;
  author: {
    name: string;
    avatar?: string;
  };
  tour?: Tour;
  date: string;
}
