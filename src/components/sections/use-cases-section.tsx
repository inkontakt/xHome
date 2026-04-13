import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { BadgePercentIcon, TrendingUpIcon, CrownIcon } from 'lucide-react'
import UseCases from '@/components/blocks/use-cases-section/use-cases-section'
import { useFreshLandingContent } from '@/hooks/useFreshLandingContent'

type UseCaseValue = 'sales' | 'marketing' | 'founders'

type UseCasesSectionContent = {
  title: string
  description: string
  heading: string
  learnMoreLabel: string
  tabs: Array<{
    name: string
    value: UseCaseValue
    image: string
    title: string
    description: string
    link: string
    testimonials: Array<{
      id: string
      review: string
    }>
  }>
}

const iconByUseCase: Record<UseCaseValue, ReactNode> = {
  sales: <BadgePercentIcon />,
  marketing: <TrendingUpIcon />,
  founders: <CrownIcon />
}

const defaultContent: UseCasesSectionContent = {
  title: 'Use Cases',
  description: 'Practical ways our AI agent automates your daily tasks.',
  heading: 'See how we drives success for every team.',
  learnMoreLabel: 'Learn more',
  tabs: [
    {
      name: 'Sales leader',
      value: 'sales',
      image: '/images/use-cases/01.webp',
      title: 'Sales Leaders use ai agent to automate and optimise sales workflows',
      description:
        'This helps sales teams reduce tasks like lead qualification and follow-ups. With automated workflows, sales teams can focus on closing deals faster, prioritizing high-value prospects, and increasing conversion rates consistently.',
      link: '#',
      testimonials: [
        { id: '1', review: "By automating lead qualification and follow-up tasks, we've focused on high-impact sales activities." },
        { id: '2', review: 'AI has helped us streamline our sales processes, making the team more productive.' },
        {
          id: '3',
          review: 'Our sales cycle has been cut down by 30%, thanks to the efficiency and precision provided by AI automation.'
        }
      ]
    },
    {
      name: 'Marketing leader',
      value: 'marketing',
      image: '/images/use-cases/02.webp',
      title: 'Marketing Leaders leverage ai to optimize campaign performance',
      description:
        'AI-powered tools help marketing teams analyze customer behavior, personalize content, and automate campaign management at scale. This enables marketing leaders to drive better engagement, improved targeting, and higher ROI across channels.',
      link: '#',
      testimonials: [
        { id: '1', review: "With AI-driven insights, we've increased our campaign effectiveness by 40%." },
        {
          id: '2',
          review: 'AI tools have transformed how we optimize our marketing strategies, delivering exceptional ROI.'
        },
        {
          id: '3',
          review: "Thanks to AI, we've personalized campaigns at scale, leading to stronger customer engagement."
        }
      ]
    },
    {
      name: 'Founders',
      value: 'founders',
      image: '/images/use-cases/03.webp',
      title: 'Founders use ai to scale operations and make faster, smarter decisions',
      description:
        'AI helps founders automate routine work, gain clear insights from data, and run leaner operations efficiently. This allows them to focus on strategic growth, innovation, faster execution, and building long-term value.',
      link: '#',
      testimonials: [
        { id: '1', review: 'AI automation has helped us scale faster while maintaining quality across all operations.' },
        {
          id: '2',
          review: 'Leveraging AI has enabled us to optimize our workflow, cutting down overhead costs significantly.'
        },
        { id: '3', review: 'AI has given us deeper insights, helping us make data-driven decisions that fuel our growth.' }
      ]
    }
  ]
}

const UseCasesSection = ({ content = defaultContent }: { content?: UseCasesSectionContent }) => {
  const freshContent = useFreshLandingContent(content, 'useCases')

  useEffect(() => {
    // #region agent log
    fetch('http://localhost:7433/ingest/2b9349a0-c0a1-4e81-9aa0-918008adcca8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c66fb0'},body:JSON.stringify({sessionId:'c66fb0',runId:'slow-homepage-1',hypothesisId:'H1',location:'use-cases-section.tsx:UseCasesSection',message:'section_mounted',data:{section:'use-cases'},timestamp:Date.now()})}).catch(()=>{})
    // #endregion
  }, [])

  const tabs = freshContent.tabs.map(tab => ({
    ...tab,
    icon: iconByUseCase[tab.value]
  }))

  return (
    <UseCases
      tabs={tabs}
      content={{
        title: freshContent.title,
        description: freshContent.description,
        heading: freshContent.heading,
        learnMoreLabel: freshContent.learnMoreLabel
      }}
    />
  )
}

export default UseCasesSection
