import SectionHeader from '@/components/blocks/section-header'

import SecureTransparent from '@/components/blocks/features-bento-grid/secure-transparent'
import SmartWorkflow from '@/components/blocks/features-bento-grid/smart-workflow'
import CrossPlatform from '@/components/blocks/features-bento-grid/cross-platform'
import MultiAI from '@/components/blocks/features-bento-grid/multi-ai'
import RealTime from '@/components/blocks/features-bento-grid/real-time'

type FeatureCard = {
  title: string
  description: string
}

type FeaturesContent = {
  title: string
  description: string
  cards: FeatureCard[]
}

const BentoGrid = ({ content }: { content: FeaturesContent }) => {
  const [card1, card2, card3, card4, card5] = content.cards

  return (
    <section id='features' className='scroll-mt-16'>
      <SectionHeader title={content.title} description={content.description} />
      <div className='px-3 sm:px-4'>
        <div className='mx-auto grid max-w-5xl grid-cols-1 border-x sm:grid-cols-2 lg:grid-cols-3'>
          <div className='flex flex-col gap-8 overflow-hidden py-6 max-sm:border-b'>
            <SecureTransparent />
            <div className='space-y-4 px-4 sm:px-6 lg:px-8'>
              <h3 className='text-xl font-medium'>{card1.title}</h3>
              <p className='text-muted-foreground'>{card1.description}</p>
            </div>
          </div>

          <div className='flex flex-col gap-6 overflow-hidden py-6 sm:border-l lg:border-x'>
            <SmartWorkflow />
            <div className='space-y-4 px-8'>
              <h3 className='text-xl font-medium'>{card2.title}</h3>
              <p className='text-muted-foreground'>{card2.description}</p>
            </div>
          </div>

          <div className='group flex flex-col gap-6 overflow-hidden pb-6 max-lg:order-1 max-lg:border-t sm:max-lg:border-r'>
            <CrossPlatform />
            <div className='space-y-4 px-8'>
              <h3 className='text-xl font-medium'>{card3.title}</h3>
              <p className='text-muted-foreground'>{card3.description}</p>
            </div>
          </div>

          <div className='flex flex-col overflow-hidden border-t pb-6 sm:col-span-2 lg:border-r'>
            <MultiAI />
            <div className='space-y-4 px-8'>
              <h3 className='text-xl font-medium'>{card4.title}</h3>
              <p className='text-muted-foreground'>{card4.description}</p>
            </div>
          </div>

          <div className='flex flex-col gap-6 overflow-hidden border-t py-6 max-lg:order-1'>
            <RealTime />
            <div className='space-y-4 px-8'>
              <h3 className='text-xl font-medium'>{card5.title}</h3>
              <p className='text-muted-foreground'>{card5.description}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BentoGrid
