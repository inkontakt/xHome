import FAQSection from '@/components/blocks/faq-section/faq-section'

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
  return (
    <FAQSection
      faqs={content.items}
      content={{
        title: content.title,
        description: content.description,
        heading: content.heading,
        subheading: content.subheading,
        docsButton: content.docsButton,
        contactButton: content.contactButton,
        leftColumnTitle: content.leftColumnTitle,
        rightColumnTitle: content.rightColumnTitle
      }}
    />
  )
}

export default FAQSectionPage
