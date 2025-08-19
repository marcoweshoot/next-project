// Tipo principale per un Tour
export interface Tour {
  id: string;
  title: string;
  slug: string;
  description?: string;
  difficulty?: string;
  image?: {
    url: string;
    alternativeText?: string;
  };
  states?: Array<{
    id: string;
    name: string;
    slug: string;
  }> | {
    id: string;
    name: string;
    slug: string;
  };
  places?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  sessions?: Array<{
    id: string;
    start: string;
    end: string;
    price: number;
    maxPax: number;
    status?: string;
    users?: Array<{
      id: string;
      username: string;
      firstName: string;
      lastName: string;
      profilePicture?: {
        id?: string;
        url: string;
        alternativeText?: string;
      };
    }>;
  }>;
}

// Tipo minimo per una destinazione
export interface Destination {
  name: string;
  slug: string;
}

// Props per il componente DestinationDetailTours
export interface DestinationDetailToursProps {
  tours: Tour[];
  destination?: Destination;
  loading: boolean;
}
