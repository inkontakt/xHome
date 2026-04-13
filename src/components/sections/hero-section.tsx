import HeroSection from '@/components/blocks/hero-section/hero-section'
import { useEffect } from 'react'
import { useFreshLandingContent } from '@/hooks/useFreshLandingContent'

type HeroSectionContent = {
  badge: { label: string; text: string }
  title: [string, string]
  description: string
  primaryCta: { label: string; href: string }
  secondaryCta: { label: string; href: string }
  usersText: string
  ratingText: string
  tabs: Array<{
    value: 'lead-qualifier' | 'meeting-prep' | 'follow-ups' | 'data-sync' | 'reporting' | 'content-drafting'
    name: string
  }>
}

const HeroSectionPage = ({ content }: { content: HeroSectionContent }) => {
  const freshContent = useFreshLandingContent(content, 'hero')

  useEffect(() => {
    // #region agent log
    fetch('http://localhost:7433/ingest/2b9349a0-c0a1-4e81-9aa0-918008adcca8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c66fb0'},body:JSON.stringify({sessionId:'c66fb0',runId:'slow-homepage-1',hypothesisId:'H1',location:'hero-section.tsx:HeroSectionPage',message:'section_mounted',data:{section:'hero'},timestamp:Date.now()})}).catch(()=>{})
    // #endregion
  }, [])

  return <HeroSection content={freshContent} />
}

export default HeroSectionPage
