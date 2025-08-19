import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const ToursSectionFooter: React.FC = () => {
  return (
    <div className="text-center mt-8">
      <Button
        size="lg"
        variant="outline"
        asChild
        className="text-base sm:text-lg font-semibold px-6 py-3 rounded-full border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300"
      >
        <Link href="/viaggi-fotografici" aria-label="Vedi tutti i viaggi fotografici">
          Vedi Tutti i Viaggi
          <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
};

export default ToursSectionFooter;
