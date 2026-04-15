'use client'

import { useEffect, useState } from 'react'

import SectionHeader from '@/components/blocks/section-header'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MotionPreset } from '@/components/ui/motion-preset'

import { cn } from '@/lib/utils'

export type Testimonial = {
  id: string
  avatar: string
  fallback: string
  name: string
  designation: string
  companyName: string
  companyLogo: string
  companyLogoDark?: string
  message: string
}

type TestimonialsContent = {
  title: string
  description: string
}

const TestimonialsComponent = ({ testimonials, content }: { testimonials: Testimonial[]; content: TestimonialsContent }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          return 100
        }

        return prev + 100 / 30
      })
    }, 100)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (progress >= 100) {
      const timeout = setTimeout(() => {
        setActiveIndex(current => (current + 1) % testimonials.length)
        setProgress(0)
      }, 100)

      return () => clearTimeout(timeout)
    }
  }, [progress, testimonials.length])

  return (
    <section id='testimonials' className='scroll-mt-16'>
      <SectionHeader title={content.title} description={content.description} />
      <section className='px-3 sm:px-4'>
        <div className='mx-auto flex max-w-5xl flex-col items-center overflow-hidden border-x'>
          <div className='flex w-full max-w-3xl flex-col items-center gap-8 px-3 py-10 sm:px-4 md:py-16 lg:px-6'>
            <MotionPreset
              key={'message-' + activeIndex}
              component='h3'
              fade
              blur
              slide={{ direction: 'down', offset: 30 }}
              transition={{ duration: 0.5 }}
              className='text-center text-xl font-medium leading-relaxed md:text-3xl'
            >
              {testimonials[activeIndex].message}
            </MotionPreset>

            <MotionPreset
              key={'user-' + activeIndex}
              fade
              blur
              delay={0.3}
              slide={{ direction: 'down', offset: 30 }}
              transition={{ duration: 0.5 }}
              className='flex items-center gap-2'
            >
              <Avatar className='size-10'>
                <AvatarImage
                  src={testimonials[activeIndex].avatar}
                  alt={testimonials[activeIndex].name}
                  loading='lazy'
                />
                <AvatarFallback>{testimonials[activeIndex].fallback}</AvatarFallback>
              </Avatar>

              <span className='text-muted-foreground'>
                {testimonials[activeIndex].name}, {testimonials[activeIndex].designation}
              </span>
            </MotionPreset>
          </div>

          <div className='w-full max-lg:overflow-x-auto'>
            <div className='flex min-w-239.5'>
              {testimonials.map((testimonial, index) => {
                const isActive = index === activeIndex

                return (
                  <div
                    key={testimonial.id}
                    className='relative flex-1 cursor-pointer border-t not-last:border-r'
                    onClick={() => {
                      setActiveIndex(index)
                      setProgress(0)
                    }}
                  >
                    <img
                      src={testimonial.companyLogo}
                      alt={testimonial.companyName}
                      className={cn(
                        'object-contain opacity-100 transition-all duration-300',
                        !isActive && 'opacity-50 grayscale',
                        testimonial.companyLogoDark && 'dark:hidden'
                      )}
                    />
                    <img
                      src={testimonial.companyLogoDark || testimonial.companyLogo}
                      alt={testimonial.companyName}
                      className={cn(
                        'hidden object-contain opacity-100 transition-all duration-300',
                        !isActive && 'opacity-50 grayscale',
                        testimonial.companyLogoDark && 'dark:block'
                      )}
                    />
                    {isActive && (
                      <div
                        className='bg-primary absolute inset-x-0 top-0 left-0 h-0.5 transition-all duration-175 ease-linear'
                        style={{ width: progress + '%' }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    </section>
  )
}

export default TestimonialsComponent
