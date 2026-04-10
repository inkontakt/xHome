import { useEffect, useState } from 'react'

export function useMedia(query: string, defaultValue: boolean = false) {
  const [matches, setMatches] = useState<boolean>(defaultValue)

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia(query)

    // Set initial value
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMatches(mediaQuery.matches)

    // Create event listener
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add listener
    mediaQuery.addEventListener('change', handleChange)

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [query])

  return matches
}
