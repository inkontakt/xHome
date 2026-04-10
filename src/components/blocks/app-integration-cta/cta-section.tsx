'use client'

import { PrimaryOrionButton, SecondaryOrionButton } from '@/components/ui/orion-button'
import { Card, CardContent } from '@/components/ui/card'
import Grill from '@/assets/svg/grill'

const AppIntegrationCTA = () => {
  return (
    <section className='border-border border-t px-4 sm:px-6 lg:px-8'>
      <div className='border-border mx-auto max-w-7xl border-x p-4 sm:p-6 lg:p-8'>
        <Card className='relative overflow-hidden rounded-lg py-0'>
          {/* Content */}
          <CardContent className='relative z-1 py-12 text-center md:py-16 lg:py-24 xl:min-h-106'>
            <h2 className='mb-4 text-2xl font-semibold md:text-3xl lg:text-4xl'>
              Boost your team&rsquo;s productivity with AI in minutes
            </h2>
            <p className='text-muted-foreground mx-auto mb-8 max-w-3xl text-base sm:text-lg'>
              Automate repetitive workflows, get instant insights, and scale your output effortlessly with FlowMate.
              Start free or connect with our team to see it in action.
            </p>

            <div className='flex flex-col justify-center gap-3 sm:flex-row sm:gap-4'>
              <PrimaryOrionButton size='lg' asChild>
                <a href='/login'>Get started</a>
              </PrimaryOrionButton>
              <SecondaryOrionButton size='lg' asChild>
                <a href='/#pricing'>View pricing</a>
              </SecondaryOrionButton>
            </div>
            <div className='absolute top-[60%] right-[-2%] -z-1 rotate-66 max-lg:hidden'>
              <div className='absolute inset-0 shadow-[inset_0px_0px_20px_20px_var(--card)]'></div>
              <Grill className='' />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export default AppIntegrationCTA
