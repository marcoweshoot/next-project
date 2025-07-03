
export interface Coach {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  avatar?: {
    url: string;
    alt?: string;
  };
  specialties?: string[];
  experience?: number;
  socialMedia?: {
    instagram?: string;
    website?: string;
  };
}
