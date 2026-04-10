import Testimonials from '@/components/blocks/testimonials-section/testimonials-section'
import { useEffect } from 'react'
import type { Testimonial } from '@/components/blocks/testimonials-section/testimonials-section'

type TestimonialsSectionContent = {
  title: string
  description: string
  items: Testimonial[]
}

const TestimonialsSection = ({ content }: { content: TestimonialsSectionContent }) => {
  useEffect(() => {
    // #region agent log
    fetch('http://localhost:7433/ingest/2b9349a0-c0a1-4e81-9aa0-918008adcca8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c66fb0'},body:JSON.stringify({sessionId:'c66fb0',runId:'slow-homepage-1',hypothesisId:'H1',location:'testimonials-section.tsx:TestimonialsSection',message:'section_mounted',data:{section:'testimonials'},timestamp:Date.now()})}).catch(()=>{})
    // #endregion
  }, [])

  return <Testimonials testimonials={content.items} content={{ title: content.title, description: content.description }} />
}

export default TestimonialsSection
