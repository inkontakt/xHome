import FAQSection from '@/components/blocks/faq-section/faq-section'
import { useFreshLandingContent } from '@/hooks/useFreshLandingContent'

type FAQItem = {
  question: string
  answer: string
}

type FAQSectionContent = {
  title: string
  description: string
  heading: string
  subheading: string
  docsButton: { label: string; href: string }
  contactButton: { label: string; href: string }
  leftColumnTitle: string
  rightColumnTitle: string
  items: FAQItem[]
}

const FAQSectionPage = ({ content }: { content: FAQSectionContent }) => {
  const freshContent = useFreshLandingContent(content, 'faq')

  return (
    <FAQSection
      faqs={freshContent.items}
      content={{
        title: freshContent.title,
        description: freshContent.description,
        heading: freshContent.heading,
        subheading: freshContent.subheading,
        docsButton: freshContent.docsButton,
        contactButton: freshContent.contactButton,
        leftColumnTitle: freshContent.leftColumnTitle,
        rightColumnTitle: freshContent.rightColumnTitle
      }}
    />
  )
}

export default FAQSectionPage
