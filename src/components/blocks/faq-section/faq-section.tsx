'use client'

import { Accordion as AccordionPrimitive } from 'radix-ui'
import { PlusIcon } from 'lucide-react'

import SectionHeader from '@/components/blocks/section-header'
import { Accordion, AccordionContent, AccordionItem } from '@/components/ui/accordion'
import { PrimaryOrionButton, SecondaryOrionButton } from '@/components/ui/orion-button'

export type FAQItem = {
  question: string
  answer: string
}

type FAQContent = {
  title: string
  description: string
  heading: string
  subheading: string
  docsButton: { label: string; href: string }
  contactButton: { label: string; href: string }
  leftColumnTitle: string
  rightColumnTitle: string
}

type FAQSectionProps = {
  faqs: FAQItem[]
  content: FAQContent
}

const FAQSection = ({ faqs, content }: FAQSectionProps) => {
  const midPoint = Math.ceil(faqs.length / 2)
  const leftColumnFaqs = faqs.slice(0, midPoint)
  const rightColumnFaqs = faqs.slice(midPoint)

  return (
    <section id='faq' className='scroll-mt-16'>
      <SectionHeader title={content.title} description={content.description} />
      <div className='border-b px-3 sm:px-4'>
        <div className='mx-auto max-w-5xl border-x'>
          <div className='flex flex-col items-center gap-5 border-b px-3 py-10 text-center sm:px-4 md:py-16 lg:px-6'>
            <h3 className='text-2xl font-semibold sm:text-3xl lg:text-4xl'>{content.heading}</h3>
            <p className='max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg'>{content.subheading}</p>

            <div className='flex flex-wrap items-center justify-center gap-3 sm:gap-4'>
              <PrimaryOrionButton size='lg' className='rounded-md' asChild>
                <a href={content.docsButton.href}>{content.docsButton.label}</a>
              </PrimaryOrionButton>
              <SecondaryOrionButton size='lg' className='rounded-md' asChild>
                <a href={content.contactButton.href}>{content.contactButton.label}</a>
              </SecondaryOrionButton>
            </div>
          </div>

          <div className='grid grid-cols-1 gap-0 px-3 py-6 sm:px-4 md:py-12 lg:grid-cols-2 lg:gap-9 lg:px-6'>
            <div>
              <p className='text-primary pb-2.5 text-lg font-semibold lg:text-xl'>{content.leftColumnTitle}</p>
              <Accordion type='single' collapsible className='w-full' defaultValue='item-1'>
                {leftColumnFaqs.map((item, index) => (
                  <AccordionItem key={index} value={'item-' + (index + 1)}>
                    <AccordionPrimitive.Header className='flex'>
                      <AccordionPrimitive.Trigger
                        data-slot='accordion-trigger'
                        className='focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 cursor-pointer items-center justify-between gap-4 rounded-md py-4 text-left text-lg font-medium transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&>svg>path:last-child]:origin-center [&>svg>path:last-child]:transition-all [&>svg>path:last-child]:duration-200 [&[data-state=open]>svg]:rotate-180 [&[data-state=open]>svg>path:last-child]:rotate-90 [&[data-state=open]>svg>path:last-child]:opacity-0'
                      >
                        {index + 1}. {item.question}
                        <PlusIcon className='text-muted-foreground pointer-events-none size-4 shrink-0 transition-transform duration-200' />
                      </AccordionPrimitive.Trigger>
                    </AccordionPrimitive.Header>
                    <AccordionContent className='text-muted-foreground text-base'>{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <div className='max-lg:mt-8'>
              <p className='text-primary pb-2.5 text-lg font-semibold lg:text-xl'>{content.rightColumnTitle}</p>
              <Accordion type='single' collapsible className='w-full' defaultValue={'item-' + (midPoint + 3)}>
                {rightColumnFaqs.map((item, index) => (
                  <AccordionItem key={index} value={'item-' + (midPoint + index + 1)}>
                    <AccordionPrimitive.Header className='flex'>
                      <AccordionPrimitive.Trigger
                        data-slot='accordion-trigger'
                        className='focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 cursor-pointer items-center justify-between gap-4 rounded-md py-4 text-left text-lg font-medium transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&>svg>path:last-child]:origin-center [&>svg>path:last-child]:transition-all [&>svg>path:last-child]:duration-200 [&[data-state=open]>svg]:rotate-180 [&[data-state=open]>svg>path:last-child]:rotate-90 [&[data-state=open]>svg>path:last-child]:opacity-0'
                      >
                        {index + 1}. {item.question}
                        <PlusIcon className='text-muted-foreground pointer-events-none size-4 shrink-0 transition-transform duration-200' />
                      </AccordionPrimitive.Trigger>
                    </AccordionPrimitive.Header>
                    <AccordionContent className='text-muted-foreground text-base'>{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FAQSection
