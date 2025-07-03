
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
