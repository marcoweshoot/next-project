'use client'

import { useEffect } from 'react'
import { trackViewCategory } from '@/utils/facebook'

interface CourseViewTrackerProps {
  courseTitle: string
  courseId: string
}

/**
 * Client-side component to track ViewCategory for Course detail page
 */
export function CourseViewTracker({ courseTitle, courseId }: CourseViewTrackerProps) {
  useEffect(() => {
    // Track ViewCategory event for course view
    trackViewCategory({
      categoryName: courseTitle,
      categoryType: 'Corso di Fotografia',
      contentIds: [courseId],
    })
  }, [courseTitle, courseId])

  return null
}
