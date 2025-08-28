import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const ToursSectionFooter: React.FC = () => {
  return (
    <div className="mt-8 text-center">
      <Button
        size="lg"
        variant="outline"
        asChild
        className="rounded-full border-2 border-foreground px-6 py-3 text-base font-semibold text-foreground transition-all duration-300 hover:bg-foreground hover:text-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-lg group"
      >
        <Link href="/viaggi-fotografici" aria-label="Vedi tutti i viaggi fotografici">
          Vedi Tutti i Viaggi
          <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
};

export default ToursSectionFooter;
