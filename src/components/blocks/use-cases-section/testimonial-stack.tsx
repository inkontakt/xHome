'use client'

import { useEffect, useState } from 'react'

import { motion } from 'motion/react'

export type TestimonialCard = {
  id: string
  review: string
}

const TestimonialStack = ({ testimonials: initialTestimonials }: { testimonials: TestimonialCard[] }) => {
  const [testimonials, setTestimonials] = useState<TestimonialCard[]>(initialTestimonials)

  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonials(prevCards => {
        const newArray = [...prevCards]

        newArray.unshift(newArray.pop()!)

        return newArray
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className='relative h-33'>
      {testimonials.map((testimonial, index) => (
        <motion.div
          key={testimonial.id}
          className='bg-card absolute left-1/2 flex w-full -translate-x-1/2 rounded-md border p-5 shadow-md'
          style={{
            transformOrigin: 'bottom center'
          }}
          animate={{
            bottom: (index - 2) * -12,
            scale: 1 - index * 0.05,
            opacity: 1 - index * 0.25,
            zIndex: testimonials.length - index
          }}
          transition={{
            duration: 0.4,
            ease: 'easeInOut'
          }}
        >
          <span className='line-clamp-3 text-xl font-medium'>&quot;{testimonial.review}&quot;</span>
        </motion.div>
      ))}
    </div>
  )
}

export default TestimonialStack
