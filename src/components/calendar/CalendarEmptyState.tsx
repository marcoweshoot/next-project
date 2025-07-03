import Link from "next/link";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarEmptyStateProps {
  children?: React.ReactNode;
}

const CalendarEmptyState = ({ children }: CalendarEmptyStateProps) => {
  return (
    <div className="text-center py-16" aria-live="polite" role="alert">
      <CalendarIcon className="mx-auto h-24 w-24 text-gray-300 mb-4" />
      <h3 className="text-2xl font-semibold text-gray-900 mb-2">
        Nessun viaggio programmato
      </h3>
      <p className="text-gray-600 mb-6">
        Al momento non ci sono viaggi fotografici programmati.
      </p>
      <Button asChild>
        <Link href="/viaggi-fotografici">Vedi tutti i viaggi</Link>
      </Button>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
};

export default CalendarEmptyState;
