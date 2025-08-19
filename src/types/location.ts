
export interface Destination {
  id: string;
  name: string;
  slug: string;
  country: string;
  description?: string;
  cover?: {
    url: string;
    alt?: string;
  };
  bestTime?: string;
  climate?: string;
  highlights?: string[];
}

export interface State {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Place {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Location {
  id: string;
  title: string;
  slug: string;
  description?: string;
  state: State; // oppure { name: string; slug: string } se non vuoi dipendere da State
  pictures?: Array<{
    image?: Array<{
      url: string;
      alternativeText?: string;
    }>;
  }>;
}
