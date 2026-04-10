'use client'

import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'

import { ArrowRightIcon } from 'lucide-react'

import SectionHeader from '@/components/blocks/section-header'

import TestimonialStack from '@/components/blocks/use-cases-section/testimonial-stack'
import type { TestimonialCard } from '@/components/blocks/use-cases-section/testimonial-stack'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'

import { MotionPreset } from '@/components/ui/motion-preset'

export type UseCaseTab = {
  name: string
  value: string
  image: string
  icon: ReactNode
  title: string
  description: string
  link: string
  testimonials: TestimonialCard[]
}

type UseCasesContent = {
  title: string
  description: string
  heading: string
  learnMoreLabel: string
}

const UseCases = ({ tabs, content }: { tabs: UseCaseTab[]; content: UseCasesContent }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.value || 'sales')

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab(currentTab => {
        const currentIndex = tabs.findIndex(tab => tab.value === currentTab)
        const nextIndex = (currentIndex + 1) % tabs.length

        return tabs[nextIndex].value
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [tabs, activeTab])

  return (
    <section id='use-cases' className='scroll-mt-16'>
      <SectionHeader title={content.title} description={content.description} />
      <div className='px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-7xl border-x'>
          <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
            <div className='grid lg:grid-cols-3'>
              <div className='flex flex-col justify-between lg:col-span-2'>
                <h2 className='px-4 py-9 text-3xl font-medium sm:px-6 md:text-4xl lg:px-8 lg:text-5xl'>{content.heading}</h2>
                <Separator />
                {tabs.map(tab => (
                  <TabsContent key={tab.value} value={tab.value} className='px-4 pt-8 sm:px-6 lg:px-8'>
                    <MotionPreset fade blur transition={{ duration: 0.5 }}>
                      <div className='space-y-4'>
                        <h3 className='text-3xl font-medium'>{tab.title}</h3>
                        <p className='text-muted-foreground line-clamp-7 text-lg'>{tab.description}</p>
                        <Button variant='link' className='group' asChild>
                          <a href={tab.link}>
                            {content.learnMoreLabel}
                            <ArrowRightIcon className='transition-transform duration-200 group-hover:translate-x-0.5' />
                          </a>
                        </Button>
                      </div>
                    </MotionPreset>
                  </TabsContent>
                ))}
                <TabsList className='*:not-last:border-r-border mt-8 w-full justify-start divide-x rounded-none border-t bg-transparent p-0'>
                  {tabs.map(tab => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className='data-[state=active]:bg-muted text-foreground data-[state=active]:[&>span:first-child]:bg-primary data-[state=active]:[&>span:first-child]:text-primary-foreground [&>span:first-child]:text-primary [&>span:first-child]:bg-primary/10 data-[state=active]:text-primary dark:data-[state=active]:text-primary dark:data-[state=active]:bg-muted basis-1/3 cursor-pointer gap-x-4 gap-y-3 rounded-none font-normal data-[state=active]:shadow-none max-sm:flex-col max-sm:justify-start max-sm:py-4 sm:h-18'
                    >
                      <span className='flex size-7 shrink-0 items-center justify-center rounded-md [&>svg]:size-4'>
                        {tab.icon}
                      </span>
                      <span className='text-base text-wrap lg:text-xl'>{tab.name}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {tabs.map(tab => (
                <TabsContent key={tab.value} value={tab.value} asChild className='border-l max-lg:hidden'>
                  <div className='relative h-140 w-full'>
                    <img src={tab.image} alt={`${tab.name} Image`} className='size-full object-cover' loading='lazy' />
                    <div className='absolute inset-x-6 bottom-6'>
                      <TestimonialStack testimonials={tab.testimonials} />
                    </div>
                  </div>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>
      </div>
    </section>
  )
}

export default UseCases
