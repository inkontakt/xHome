import { useEffect, useState } from 'react'

export function useFreshLandingContent<T>(initialContent: T, sectionKey: string): T {
  const [content, setContent] = useState<T>(initialContent)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchFreshContent = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/landing-content.json', {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        })

        if (!response.ok) {
          console.error('Failed to fetch landing content:', response.statusText)
          return
        }

        const data = await response.json()

        // Use the section key to get the specific section content
        // e.g., 'hero', 'features', 'worksFeatures', etc.
        if (data[sectionKey]) {
          setContent(data[sectionKey])
        }
      } catch (error) {
        console.error('Error fetching fresh landing content:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Fetch fresh content on mount
    fetchFreshContent()
  }, [sectionKey])

  return content
}
