interface CalendarErrorProps {
  error: Error;
  children?: React.ReactNode;
}

const CalendarError = ({ error, children }: CalendarErrorProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className="flex items-center justify-center min-h-[50vh] pt-24"
        role="alert"
        aria-live="polite"
      >
        <div className="text-center max-w-lg">
          <h2 className="text-red-600 text-xl font-semibold">
            Errore nel caricamento del calendario
          </h2>
          <p className="text-gray-600 mt-2">{error.message}</p>
          {children && <div className="mt-6">{children}</div>}
        </div>
      </div>
    </div>
  );
};

export default CalendarError;