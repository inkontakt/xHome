import type { ReactNode } from 'react'
import { FolderSyncIcon, PencilIcon, WorkflowIcon } from 'lucide-react'
import WorksFeaturesSection from '@/components/blocks/works-features-section/works-features-section'

type StepId = 'describe-workflow' | 'connect-tools' | 'review-and-refine'

type WorksFeaturesContent = {
  title: string
  description: string
  steps: Array<{
    id: StepId
    title: string
    description: string
  }>
}

const iconByStepId: Record<StepId, ReactNode> = {
  'describe-workflow': <WorkflowIcon />,
  'connect-tools': <FolderSyncIcon />,
  'review-and-refine': <PencilIcon />
}

const WorksFeaturesSectionPage = ({ content }: { content: WorksFeaturesContent }) => {
  const data = content.steps.map(step => ({
    ...step,
    icon: iconByStepId[step.id]
  }))

  return <WorksFeaturesSection data={data} content={{ title: content.title, description: content.description }} />
}

export default WorksFeaturesSectionPage
