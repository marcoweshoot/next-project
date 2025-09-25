// Database types for dashboard functionality
export interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  created_at: string
}

export interface Booking {
  id: string
  user_id: string
  tour_id: string
  session_id: string
  status: 'pending' | 'deposit_paid' | 'fully_paid' | 'completed' | 'cancelled'
  deposit_amount: number
  total_amount: number
  stripe_payment_intent_id?: string
  created_at: string
  tour_title?: string
  session_start?: string
  session_end?: string
}

export interface Review {
  id: string
  user_id: string
  booking_id: string
  tour_id: string
  rating: number
  comment?: string
  created_at: string
}

export type BookingStatus = Booking['status']
