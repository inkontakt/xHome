import IntegrationTools from '@/components/blocks/app-integration/integration-tools'

export interface IntegrationTool {
  id: string
  name: string
  icon: string
  category: 'Productivity' | 'Communication' | 'Collaboration' | 'Marketing'
  description: string
  link: string
  className?: string
}

export const integrationTools: IntegrationTool[] = [
  {
    id: 'chatgpt',
    name: 'Chat GPT',
    icon: '/images/app-integration/1.webp',
    category: 'Productivity',
    description:
      'Use AI to analyse inputs, generate responses, summarise data, and automate complex tasks across your workflows.',
    link: 'https://openai.com/chatgpt',
    className: 'dark:invert'
  },
  {
    id: 'google-docs',
    name: 'Google Docs',
    icon: '/images/app-integration/2.webp',
    category: 'Collaboration',
    description: 'Generate documents, summaries, and reports automatically using data from your connected tools.',
    link: 'https://www.google.com/docs/about/'
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    icon: '/images/app-integration/3.webp',
    category: 'Productivity',
    description: 'Update rows, analyze data, and generate insights automatically without manual spreadsheet work.',
    link: 'https://www.google.com/sheets/about/'
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    icon: '/images/app-integration/4.webp',
    category: 'Productivity',
    description: 'Prepare meeting agendas, summaries, and follow-ups automatically based on scheduled events.',
    link: 'https://calendar.google.com/'
  },
  {
    id: 'zoom',
    name: 'Zoom',
    icon: '/images/app-integration/5.webp',
    category: 'Communication',
    description: 'Automatically prepare meeting summaries, action items, and follow-ups from your video calls.',
    link: 'https://zoom.us/'
  },
  {
    id: 'microsoft-copilot',
    name: 'Microsoft Copilot',
    icon: '/images/app-integration/6.webp',
    category: 'Productivity',
    description: 'Enhance documents, emails, and data workflows by coordinating Copilot actions through your AI agent.',
    link: 'https://copilot.microsoft.com/'
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    icon: '/images/app-integration/7.webp',
    category: 'Productivity',
    description:
      'Generate visuals and creative assets automatically to support campaigns, presentations, and content workflows.',
    link: 'https://www.midjourney.com/',
    className: 'dark:invert'
  },
  {
    id: 'coda',
    name: 'Coda',
    icon: '/images/app-integration/8.webp',
    category: 'Collaboration',
    description:
      'Combine documents and structured data so your AI agent can update workflows and content in one place.',
    link: 'https://coda.io/'
  },
  {
    id: 'twilio',
    name: 'Twilio',
    icon: '/images/app-integration/9.webp',
    category: 'Communication',
    description: 'Enable AI-driven messaging and notifications across SMS, voice, and chat channels automatically.',
    link: 'https://www.twilio.com/'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: '/images/app-integration/10.webp',
    category: 'Productivity',
    description: 'Explore complex data, extract insights, and support technical workflows using advanced AI models.',
    link: 'https://www.deepseek.com/'
  },
  {
    id: 'quillbot',
    name: 'QuillBot',
    icon: '/images/app-integration/11.webp',
    category: 'Collaboration',
    description: 'Rewrite, refine, and improve written content automatically while maintaining clarity and tone.',
    link: 'https://quillbot.com/'
  },
  {
    id: 'notion',
    name: 'Notion',
    icon: '/images/app-integration/12.webp',
    category: 'Collaboration',
    description:
      "Automatically create, update, and organise pages so your team's knowledge stays structured and up to date.",
    link: 'https://www.notion.so/',
    className: 'dark:invert'
  },
  {
    id: 'chatgpt-alt',
    name: 'Perplexity AI',
    icon: '/images/app-integration/13.webp',
    category: 'Productivity',
    description:
      'Use AI to analyse inputs, generate responses, summarise data, and automate complex tasks across your workflows.',
    link: 'https://www.perplexity.ai/'
  },
  {
    id: 'gmail',
    name: 'Gmail',
    icon: '/images/app-integration/14.webp',
    category: 'Productivity',
    description: 'Draft, send, and follow up on emails automatically while keeping conversations organized and timely.',
    link: 'https://mail.google.com/'
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: '/images/app-integration/15.webp',
    category: 'Communication',
    description:
      'Send updates, trigger workflows, and keep your team informed in real time—directly inside Slack conversations.',
    link: 'https://slack.com/'
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: '/images/app-integration/16.webp',
    category: 'Communication',
    description:
      'Keep communities and teams informed by letting your AI agent share updates, summaries, and alerts in real time.',
    link: 'https://discord.com/'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '/images/app-integration/17.webp',
    category: 'Marketing',
    description:
      'Support lead research and outreach efforts by syncing valuable profile insights and engagement signals directly into your workflows.',
    link: 'https://www.linkedin.com/'
  },
  {
    id: 'x',
    name: 'X',
    icon: '/images/app-integration/18.webp',
    category: 'Marketing',
    description:
      'Monitor mentions, track conversations effectively, and trigger actions based on real-time social media activity.',
    link: 'https://x.com/',
    className: 'dark:invert'
  }
]

export const categories = ['All tools', 'Productivity', 'Communication', 'Collaboration', 'Marketing'] as const

const IntegrationToolsSection = () => {
  return <IntegrationTools tools={integrationTools} categories={categories} />
}

export default IntegrationToolsSection
