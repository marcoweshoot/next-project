'use client'

import { useEffect } from 'react'
import { trackViewCategory } from '@/utils/facebook'

interface GroupedSessions {
  [key: string]: {
    month: string;
    year: number;
    tours: any[];
  };
}

interface CalendarViewTrackerProps {
  groupedSessions: GroupedSessions
}

/**
 * Client-side component to track ViewCategory for Calendar page
 */
export function CalendarViewTracker({ groupedSessions }: CalendarViewTrackerProps) {
  useEffect(() => {
    // Extract all tour IDs from all months
    const allTourIds: string[] = []
    Object.values(groupedSessions).forEach(monthData => {
      monthData.tours.forEach((tour: any) => {
        if (tour.id) {
          allTourIds.push(tour.id)
        }
      })
    })

    // Track ViewCategory event
    trackViewCategory({
      categoryName: 'Calendario Viaggi Fotografici',
      categoryType: 'Calendario',
      contentIds: allTourIds,
    })
  }, []) // Track only once on mount

  return null
}
