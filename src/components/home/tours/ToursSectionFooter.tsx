
import Link from "next/link";
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const ToursSectionFooter: React.FC<{
  children?: React.ReactNode;
}> = (
  {
    children
  }
) => {
  return (
    <div className="text-center">
      <Button size="lg" asChild>
        <Link href="/viaggi-fotografici">
          Vedi Tutti i Viaggi
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </Button>
    </div>
  );
};

export default ToursSectionFooter;
