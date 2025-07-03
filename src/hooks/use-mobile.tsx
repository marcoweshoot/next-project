"use client";

import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Set initial value
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Listen for changes
    if (mql.addListener) {
      mql.addListener(onChange)
    } else {
      mql.addEventListener("change", onChange)
    }
    
    return () => {
      if (mql.removeListener) {
        mql.removeListener(onChange)
      } else {
        mql.removeEventListener("change", onChange)
      }
    }
  }, [])

  return isMobile
}
