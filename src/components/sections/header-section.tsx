import {
  BrainCircuitIcon,
  GitCompareArrowsIcon,
  GitPullRequestDraftIcon,
  HeadphonesIcon,
  Trash2Icon,
  UserIcon
} from 'lucide-react'

import Header from '@/components/layout/header'
import type { Navigation } from '@/components/layout/header-navigation'

const ESTIMATE_DETAILS_HREF =
  '/estimate-details?tenant=carfit&estimate_id=77f512f1-c50d-4bf2-9012-1c6b1b655207'

const navigationData: Navigation[] = [
  {
    title: 'Features',
    href: '/#features'
  },
  {
    title: 'Use cases',
    contentClassName: '!w-141 grid-cols-2',
    splitItems: true,
    items: [
      {
        type: 'section',
        title: 'Sales & Customer Operations',
        items: [
          {
            title: 'Pipeline Management',
            href: '/#use-cases',
            description: 'Track movement, update statuses, and flag stalled deals.',
            icon: <GitPullRequestDraftIcon className='size-4' />
          },
          {
            title: 'Customer Onboarding',
            href: '#',
            description: 'Automate welcome emails, account setup, and key guidance.',
            icon: <UserIcon className='size-4' />
          },
          {
            title: 'Support Escalations',
            href: '#',
            description: 'Detect urgency and route issues to the right team faster.',
            icon: <HeadphonesIcon className='size-4' />
          }
        ]
      },
      {
        type: 'section',
        title: 'Internal Productivity Workflows',
        items: [
          {
            title: 'Knowledge Retrieval',
            href: '#',
            description: 'Ask AI and get instant answers from your tools/docs.',
            icon: <BrainCircuitIcon className='size-4' />
          },
          {
            title: 'Task Automation',
            href: '#',
            description: 'Convert messages into tasks and assign them automatically.',
            icon: <GitCompareArrowsIcon className='size-4' />
          },
          {
            title: 'Data Cleanup',
            href: '#',
            description: 'Auto-correct entries, remove duplicates, sync records.',
            icon: <Trash2Icon className='size-4' />
          }
        ]
      }
    ]
  },
  {
    title: 'Testimonials',
    href: '/#testimonials'
  },
  {
    title: 'Pricing',
    href: '/#pricing'
  },
  {
    title: 'Blog',
    href: '/blog'
  },
  {
    title: 'App integration',
    href: '/app-integration'
  },
  {
    title: 'Carfit Hamburg',
    href: '/carfit-hamburg'
  },
  {
    title: 'Carfit Hamburg 2',
    href: '/carfit-hamburg-2'
  },
  {
    title: 'Estimate',
    href: ESTIMATE_DETAILS_HREF
  }
]

const HeaderSection = ({ pathname }: { pathname?: string }) => {
  return <Header navigationData={navigationData} pathname={pathname} />
}

export default HeaderSection
