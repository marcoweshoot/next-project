
import Link from "next/link";
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import CoachCard from './CoachCard';

interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  bio?: string;
  profilePicture?: {
    localFile?: {
      url: string;
      alternativeText?: string;
    };
  };
  instagram?: string;
}

interface CoachesListProps {
  coaches: Coach[];
  loading: boolean;
}

const CoachesList: React.FC<{
  children?: React.ReactNode;
}> = ({
  coaches,
  loading,
  children
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="text-center">
            <Skeleton className="h-32 w-32 rounded-full mx-auto mb-4" />
            <Skeleton className="h-6 w-32 mx-auto mb-2" />
            <Skeleton className="h-4 w-8 mx-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (!coaches || coaches.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Nessun coach disponibile
        </h2>
        <p className="text-gray-600 mb-8">
          I nostri coach saranno presto disponibili.
        </p>
        <Link 
          href="/viaggi-fotografici/"
          className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
        >
          Scopri tutti i viaggi
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {coaches.map((coach) => (
        <CoachCard key={coach.id} coach={coach} />
      ))}
    </div>
  );
};

export default CoachesList;
