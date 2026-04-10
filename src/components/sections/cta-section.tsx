import CTA from '@/components/blocks/cta-section/cta-section'

type CTASectionContent = {
  heading: string
  description: string
  primaryCta: { label: string; href: string }
  secondaryCta: { label: string; href: string }
  stats: Array<{ number: number; pointNumber?: number; suffix: string; description: string }>
}

const CTASection = ({ content }: { content: CTASectionContent }) => {
  return (
    <CTA
      stats={content.stats}
      content={{
        heading: content.heading,
        description: content.description,
        primaryCta: content.primaryCta,
        secondaryCta: content.secondaryCta
      }}
    />
  )
}

export default CTASection
