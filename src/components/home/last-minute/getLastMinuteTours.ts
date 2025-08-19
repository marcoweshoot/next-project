// src/components/home/last-minute/getLastMinuteTours.ts

import type { Tour } from '@/types/tour';

export function getLastMinuteTours(tours: Tour[] = [], daysAhead = 60): Tour[] {
  const now = new Date();
  const futureLimit = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  return tours
    .filter((tour) =>
      tour.sessions?.some((session) => {
        const sessionStart = session?.start ? new Date(session.start) : null;
        return sessionStart && sessionStart >= now && sessionStart <= futureLimit;
      })
    )
    .map((tour) => {
      const futureSession = tour.sessions?.find((session) => {
        const sessionStart = session?.start ? new Date(session.start) : null;
        return sessionStart && sessionStart >= now;
      });

      const startDate = futureSession?.start ?? '';
      const endDate = futureSession?.end ?? '';

      let duration = 7; // fallback di default
      if (futureSession?.start && futureSession?.end) {
        const start = new Date(futureSession.start);
        const end = new Date(futureSession.end);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        duration = days;
      }

      const maxPax = futureSession?.maxPax ?? 0;
      const registeredUsers = futureSession?.users?.length ?? 0;
      const availableSpots = Math.max(maxPax - registeredUsers, 0);

      return {
        ...tour,
        startDate,
        endDate,
        duration,
        price: futureSession?.price ?? tour.price ?? 0,
        availableSpots,
        status: futureSession?.status ?? tour.status,
      };
    });
}
