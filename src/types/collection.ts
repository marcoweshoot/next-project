
import type { Tour } from './tour';

export interface Collection {
  id: string;
  title: string;
  slug: string;
  description?: string;
  cover?: {
    url: string;
    alt?: string;
  };
  tours?: Tour[];
}
