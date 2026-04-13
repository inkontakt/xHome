import CTA from '@/components/blocks/cta-section/cta-section'
import { useFreshLandingContent } from '@/hooks/useFreshLandingContent'

type CTASectionContent = {
  heading: string
  description: string
  primaryCta: { label: string; href: string }
  secondaryCta: { label: string; href: string }
  stats: Array<{ number: number; pointNumber?: number; suffix: string; description: string }>
}

const CTASection = ({ content }: { content: CTASectionContent }) => {
  const freshContent = useFreshLandingContent(content, 'cta')

  return (
    <CTA
      stats={freshContent.stats}
      content={{
        heading: freshContent.heading,
        description: freshContent.description,
        primaryCta: freshContent.primaryCta,
        secondaryCta: freshContent.secondaryCta
      }}
    />
  )
}

export default CTASection
