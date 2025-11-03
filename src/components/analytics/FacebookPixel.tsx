'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AdvancedMatchingData {
  em?: string // Email (lowercase, Facebook will hash automatically)
  fn?: string // First name (lowercase)
  ln?: string // Last name (lowercase)
  ph?: string // Phone (digits only, country code included)
  external_id?: string // User ID
  ge?: string // Gender (f or m)
  db?: string // Date of birth (YYYYMMDD)
  ct?: string // City (lowercase, no spaces)
  st?: string // State (2-letter lowercase)
  zp?: string // Zip code
  country?: string // Country (2-letter lowercase)
}

export function FacebookPixel() {
  const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL
  const [advancedMatching, setAdvancedMatching] = useState<AdvancedMatchingData | null>(null)
  const [pixelInitialized, setPixelInitialized] = useState(false)

  // Fetch user data for Advanced Matching
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          return // User not logged in, no Advanced Matching
        }

        // Get user profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email, first_name, last_name, mobile_phone, phone, id')
          .eq('id', user.id)
          .single()

        if (profileError || !profile) {
          // Fallback to auth user email if profile not found
          const matchingData: AdvancedMatchingData = {
            em: user.email?.toLowerCase() || undefined,
            external_id: user.id,
          }
          setAdvancedMatching(matchingData)
          return
        }

        // Build Advanced Matching data object
        const matchingData: AdvancedMatchingData = {}

        // Email (lowercase, Facebook will hash automatically with SHA-256)
        if (profile.email || user.email) {
          matchingData.em = (profile.email || user.email || '').toLowerCase()
        }

        // First name (lowercase, no spaces)
        if (profile.first_name) {
          matchingData.fn = profile.first_name.toLowerCase().trim()
        }

        // Last name (lowercase, no spaces)
        if (profile.last_name) {
          matchingData.ln = profile.last_name.toLowerCase().trim()
        }

        // Phone (digits only, include country code)
        const phone = profile.mobile_phone || profile.phone
        if (phone) {
          // Remove all non-digit characters
          const digitsOnly = phone.replace(/\D/g, '')
          if (digitsOnly.length >= 10) {
            matchingData.ph = digitsOnly
          }
        }

        // External ID (user ID)
        matchingData.external_id = user.id

        setAdvancedMatching(matchingData)
        
        // If pixel already initialized, update Advanced Matching using fbq('set')
        if (typeof window !== 'undefined' && window.fbq && pixelInitialized) {
          // fbq('set') is used to update user data after pixel initialization
          window.fbq('set', matchingData)
          console.log('✅ [FB PIXEL] Advanced Matching updated with user data:', {
            hasEmail: !!matchingData.em,
            hasFirstName: !!matchingData.fn,
            hasLastName: !!matchingData.ln,
            hasPhone: !!matchingData.ph,
            hasExternalId: !!matchingData.external_id
          })
        }
      } catch (error) {
        console.error('❌ [FB PIXEL] Error fetching user data for Advanced Matching:', error)
      }
    }

    fetchUserData()
  }, [pixelInitialized])

  useEffect(() => {
    if (!FB_PIXEL_ID) {
      console.warn('Facebook Pixel ID is not set. Set NEXT_PUBLIC_FB_PIXEL in your environment variables.')
      return
    }

    // Check if pixel failed to load after 5 seconds (only log errors)
    const timeout = setTimeout(() => {
      if (typeof window !== 'undefined' && !window.fbq) {
        console.error('Facebook Pixel failed to load. Check your network or ad blockers.')
      }
    }, 5000)

    return () => clearTimeout(timeout)
  }, [FB_PIXEL_ID])

  if (!FB_PIXEL_ID) {
    return null
  }

  // Build init script - initialize pixel immediately, Advanced Matching will be added later if available
  const initScript = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${FB_PIXEL_ID}');
    fbq('track', 'PageView');
    
    // Mark pixel as initialized
    if (typeof window !== 'undefined') {
      window.fbPixelInitialized = true;
    }
  `

  return (
    <>
      <Script
        id="fb-pixel-init"
        strategy="afterInteractive"
        onLoad={() => {
          setPixelInitialized(true)
          if (advancedMatching && Object.keys(advancedMatching).length > 0) {
            console.log('✅ [FB PIXEL] Facebook Pixel initialized with Advanced Matching')
          } else {
            console.log('✅ [FB PIXEL] Facebook Pixel initialized (no Advanced Matching - user not logged in)')
          }
        }}
        dangerouslySetInnerHTML={{
          __html: initScript,
        }}
      />
      <noscript>
        <img height="1" width="1" style={{display:'none'}} 
             src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}/>
      </noscript>
    </>
  )
}