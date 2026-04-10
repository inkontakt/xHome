'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import {
  ArrowUpRightIcon,
  BellRingIcon,
  ClipboardIcon,
  DollarSignIcon,
  FileTextIcon,
  HeadsetIcon,
  RefreshCcwDotIcon,
  TrendingUpIcon
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AnimatedTooltip } from '@/components/ui/motion-tooltip'
import { BorderBeam } from '@/components/ui/border-beam'
import { PrimaryOrionButton, SecondaryOrionButton } from '@/components/ui/orion-button'
import { Rating } from '@/components/ui/rating'

import LeadQualifier from '@/components/blocks/hero-section/lead-qualifier'
import MeetingPrep from '@/components/blocks/hero-section/meeting-prep'
import FollowUps from '@/components/blocks/hero-section/follow-ups'
import DataSync from '@/components/blocks/hero-section/data-sync'
import Reporting from '@/components/blocks/hero-section/reporting'
import ContentDrafting from '@/components/blocks/hero-section/content-drafting'

import { MotionPreset } from '@/components/ui/motion-preset'

type HeroTabValue =
  | 'lead-qualifier'
  | 'meeting-prep'
  | 'follow-ups'
  | 'data-sync'
  | 'reporting'
  | 'content-drafting'

type HeroTab = {
  value: HeroTabValue
  name: string
}

type HeroContent = {
  badge: {
    label: string
    text: string
  }
  title: [string, string]
  description: string
  primaryCta: {
    label: string
    href: string
  }
  secondaryCta: {
    label: string
    href: string
  }
  usersText: string
  ratingText: string
  tabs: HeroTab[]
}

const avatars = [
  {
    image: '/images/avatar/7.webp',
    fallback: 'AH',
    name: 'Ali Hussein',
    designation: 'Developer'
  },
  {
    image: '/images/avatar/8.webp',
    fallback: 'SJ',
    name: 'Sahaj Jain',
    designation: 'Software Engineer'
  },
  {
    image: '/images/avatar/3.webp',
    fallback: 'DH',
    name: 'David Haz',
    designation: 'Design Engineer'
  },
  {
    image: '/images/avatar/6.webp',
    fallback: 'J',
    name: 'Julian',
    designation: 'Senior Developer'
  }
]

const tabDetails: Record<
  HeroTabValue,
  {
    icon: typeof TrendingUpIcon
    content: ReactNode
  }
> = {
  'lead-qualifier': {
    icon: TrendingUpIcon,
    content: <LeadQualifier />
  },
  'meeting-prep': {
    icon: HeadsetIcon,
    content: <MeetingPrep />
  },
  'follow-ups': {
    icon: BellRingIcon,
    content: <FollowUps />
  },
  'data-sync': {
    icon: RefreshCcwDotIcon,
    content: <DataSync />
  },
  reporting: {
    icon: ClipboardIcon,
    content: <Reporting />
  },
  'content-drafting': {
    icon: FileTextIcon,
    content: <ContentDrafting />
  }
}

const splitStatText = (text: string) => {
  const [firstWord, ...rest] = text.trim().split(' ')

  return {
    value: firstWord || text,
    label: rest.join(' ') || ''
  }
}

const HeroSection = ({ content }: { content: HeroContent }) => {
  const tabs = content.tabs.map(tab => ({
    ...tab,
    icon: tabDetails[tab.value].icon,
    content: tabDetails[tab.value].content
  }))

  const [activeTab, setActiveTab] = useState<HeroTabValue>(tabs[0]?.value || 'lead-qualifier')

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab(currentTab => {
        const currentIndex = tabs.findIndex(tab => tab.value === currentTab)
        const nextIndex = (currentIndex + 1) % tabs.length

        return tabs[nextIndex].value
      })
    }, 7000)

    return () => clearInterval(interval)
  }, [activeTab, tabs])

  const users = splitStatText(content.usersText)
  const rating = splitStatText(content.ratingText)

  return (
    <section id='home' className='relative -mt-15.75 flex scroll-mt-16 flex-col overflow-hidden pt-15.75'>
      <div className='border-b px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto flex max-w-7xl flex-col gap-6 border-x px-4 py-8 sm:px-6 sm:py-16 lg:px-8 lg:py-24'>
          <div className='flex flex-col items-center gap-6 text-center'>
            <MotionPreset fade blur transition={{ duration: 0.5 }} className='space-y-4'>
              <Badge variant='outline' className='bg-muted relative gap-2.5 px-1.5 py-1'>
                <span className='bg-primary text-primary-foreground flex h-5.5 items-center rounded-full px-2 py-0.5'>
                  {content.badge.label}
                </span>
                <span className='text-muted-foreground text-sm font-normal text-wrap'>{content.badge.text}</span>
                <BorderBeam colorFrom='var(--primary)' colorTo='var(--primary)' size={35} />
              </Badge>

              <h1 className='text-2xl font-semibold sm:text-3xl lg:text-5xl lg:leading-[1.29167]'>
                {content.title[0]}
                <br />
                {content.title[1]}
              </h1>

              <p className='text-muted-foreground max-w-3xl text-xl'>{content.description}</p>
            </MotionPreset>

            <MotionPreset fade blur delay={0.1} transition={{ duration: 0.5 }}>
              <div className='flex flex-wrap items-center justify-center gap-4'>
                <PrimaryOrionButton size='lg' className='rounded-lg max-[425px]:has-[>svg]:px-4' asChild>
                  <a href={content.primaryCta.href}>
                    <ArrowUpRightIcon />
                    {content.primaryCta.label}
                  </a>
                </PrimaryOrionButton>
                <SecondaryOrionButton size='lg' className='rounded-lg max-[425px]:has-[>svg]:px-4' asChild>
                  <a href={content.secondaryCta.href}>
                    <DollarSignIcon />
                    {content.secondaryCta.label}
                  </a>
                </SecondaryOrionButton>
              </div>
            </MotionPreset>
          </div>

          <MotionPreset fade blur delay={0.2} transition={{ duration: 0.5 }}>
            <div className='flex w-full items-center justify-center gap-4 max-sm:flex-col sm:gap-7'>
              <div className='flex flex-1 items-center justify-end gap-3'>
                <div className='flex flex-row items-center justify-center'>
                  <AnimatedTooltip
                    items={avatars}
                    className='*:data-[slot=avatar]:border-background -me-3.5 last:me-0 *:data-[slot=avatar]:border-2 *:data-[slot=avatar]:shadow-md *:data-[slot=avatar]:ring-0'
                  />
                </div>
                <div>
                  <span className='text-lg font-medium'>{users.value}</span>{' '}
                  <span className='text-muted-foreground'>{users.label}</span>
                </div>
              </div>

              <Separator orientation='vertical' className='data-[orientation=vertical]:h-4 max-sm:hidden' />

              <div className='flex flex-1 items-center gap-3'>
                <Rating readOnly value={4.5} precision={0.5} className='[&_svg]:text-primary' />
                <div>
                  <span className='text-lg font-medium'>{rating.value}</span>{' '}
                  <span className='text-muted-foreground'>{rating.label}</span>
                </div>
              </div>
            </div>
          </MotionPreset>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={value => setActiveTab(value as HeroTabValue)} className='block w-full gap-0'>
        <div className='border-b px-4 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-7xl border-x'>
            <ScrollArea className='-m-px'>
              <TabsList className='w-full -space-x-px rounded-none bg-transparent p-0'>
                {tabs.map(({ icon: Icon, name, value }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className='border-border text-foreground focus-visible:outline-primary/20 data-[state=active]:border-primary/60! data-[state=active]:bg-muted! h-15 flex-1 cursor-pointer rounded-none px-4 py-2.5 text-base focus-visible:ring-0 focus-visible:outline-[3px] focus-visible:-outline-offset-4 data-[state=active]:z-1'
                  >
                    <Icon />
                    {name}
                  </TabsTrigger>
                ))}
              </TabsList>
              <ScrollBar orientation='horizontal' className='z-2' />
            </ScrollArea>
          </div>
        </div>

        <div className='px-4 sm:px-6 lg:px-8'>
          <div className='relative mx-auto h-151 max-w-7xl border-x'>
            <div className='pointer-events-none absolute inset-0 -z-2 bg-[radial-gradient(color-mix(in_oklab,var(--primary)10%,transparent)_2px,transparent_2px)] bg-size-[20px_20px] bg-fixed' />
            <div className='bg-background pointer-events-none absolute inset-0 -z-1 flex items-center justify-center mask-[radial-gradient(ellipse_at_center,transparent_20%,black)]' />

            <ScrollArea className='h-full *:data-[slot=scroll-area-viewport]:h-full [&>[data-slot=scroll-area-viewport]>div]:h-full'>
              {tabs.map(tab => (
                <TabsContent
                  key={tab.value}
                  value={tab.value}
                  className='flex h-full items-center justify-center p-4 sm:p-6 lg:p-8'
                >
                  {tab.content}
                </TabsContent>
              ))}

              <ScrollBar orientation='horizontal' />
            </ScrollArea>
          </div>
        </div>
      </Tabs>
    </section>
  )
}

export default HeroSection
