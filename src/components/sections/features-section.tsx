import Features from '@/components/blocks/features-bento-grid/features-bento-grid'
import { useEffect } from 'react'

type FeaturesContent = {
  title: string
  description: string
  cards: Array<{ title: string; description: string }>
}

const FeaturesSection = ({ content }: { content: FeaturesContent }) => {
  useEffect(() => {
    // #region agent log
    fetch('http://localhost:7433/ingest/2b9349a0-c0a1-4e81-9aa0-918008adcca8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c66fb0'},body:JSON.stringify({sessionId:'c66fb0',runId:'slow-homepage-1',hypothesisId:'H1',location:'features-section.tsx:FeaturesSection',message:'section_mounted',data:{section:'features'},timestamp:Date.now()})}).catch(()=>{})
    // #endregion
  }, [])

  return <Features content={content} />
}

export default FeaturesSection
