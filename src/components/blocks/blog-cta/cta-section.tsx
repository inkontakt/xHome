'use client'

import { useState } from 'react'

import { PrimaryOrionButton } from '@/components/ui/orion-button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Grill from '@/assets/svg/grill'

const BlogCTA = () => {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Handle email submission
    console.log('Email submitted:', email)
  }

  return (
    <section className='border-border border-t px-4 sm:px-6 lg:px-8'>
      <div className='border-border mx-auto max-w-7xl border-x p-4 sm:p-6 lg:p-8'>
        <Card className='relative overflow-hidden rounded-lg py-0'>
          {/* Content */}
          <CardContent className='relative z-1 py-12 text-center md:py-16 lg:py-24 xl:min-h-106'>
            <h2 className='mb-4 text-2xl font-semibold md:text-3xl lg:text-4xl'>
              Turn AI insights into real workflows
            </h2>
            <p className='text-muted-foreground mb-8 text-base sm:text-lg'>
              Subscribe to learn how teams use AI agents to automate daily operations and scale productivity.{' '}
              <br className='hidden lg:block' />
              Discover innovative strategies that can help your organisation thrive.
            </p>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className='mx-auto flex max-w-md flex-col gap-3 sm:flex-row sm:gap-2'>
              <Input
                type='email'
                placeholder='Your email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className='h-10'
              />
              <PrimaryOrionButton type='submit' size='lg'>
                Get updates
              </PrimaryOrionButton>
            </form>
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

export default BlogCTA
