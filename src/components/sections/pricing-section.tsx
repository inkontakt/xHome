import PricingSection from '@/components/blocks/pricing-section/pricing-section'
import { useEffect } from 'react'

type PricingPlan = {
  name: string
  description: string
  price: number
  yearlyPrice: number
  currency: string
  period: string
  features: string[]
  buttonText: string
  buttonVariant: 'primary' | 'secondary'
}

type PricingSectionContent = {
  title: string
  description: string
  heading: string
  subheading: string
  monthlyLabel: string
  yearlyLabel: string
  yearlySaveLabel: string
  plans: PricingPlan[]
}

const PricingSectionPage = ({ content }: { content: PricingSectionContent }) => {
  useEffect(() => {
    // #region agent log
    fetch('http://localhost:7433/ingest/2b9349a0-c0a1-4e81-9aa0-918008adcca8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c66fb0'},body:JSON.stringify({sessionId:'c66fb0',runId:'slow-homepage-1',hypothesisId:'H1',location:'pricing-section.tsx:PricingSectionPage',message:'section_mounted',data:{section:'pricing'},timestamp:Date.now()})}).catch(()=>{})
    // #endregion
  }, [])

  return (
    <PricingSection
      plans={content.plans}
      content={{
        title: content.title,
        description: content.description,
        heading: content.heading,
        subheading: content.subheading,
        monthlyLabel: content.monthlyLabel,
        yearlyLabel: content.yearlyLabel,
        yearlySaveLabel: content.yearlySaveLabel
      }}
    />
  )
}

export default PricingSectionPage
