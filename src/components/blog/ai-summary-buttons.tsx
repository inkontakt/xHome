import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AISummaryButtonsProps {
  postTitle: string
  postUrl: string
}

const aiPlatforms = [
  {
    name: 'ChatGPT',
    image: '/images/features/17.webp',
    url: (title: string, url: string) =>
      `https://chat.openai.com/?q=${encodeURIComponent(`Please summarize this article: ${title} - ${url}`)}`,
    description: 'Summarize with OpenAI ChatGPT',
    imageClassName: 'dark:invert'
  },
  {
    name: 'Claude',
    image: '/images/features/18.webp',
    url: (title: string, url: string) =>
      `https://claude.ai/new?q=${encodeURIComponent(`Please summarize this article: ${title} - ${url}`)}`,
    description: 'Summarize with Anthropic Claude'
  },
  {
    name: 'Perplexity',
    image: '/images/features/24.webp',
    url: (title: string, url: string) =>
      `https://www.perplexity.ai/?q=${encodeURIComponent(`Please summarize this article: ${title} - ${url}`)}`,
    description: 'Summarize with Perplexity AI'
  }
]

const AISummaryButtons = ({ postTitle, postUrl }: AISummaryButtonsProps) => {
  return (
    <div className='mb-8 md:mb-12 lg:mb-16'>
      <p className='text-muted-foreground mb-1.5 text-sm'>Summarize this article with</p>
      <div className='flex flex-wrap gap-2'>
        {aiPlatforms.map(platform => (
          <Button
            key={platform.name}
            size='sm'
            className='border-primary bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary gap-0 rounded-sm border pl-1'
            title={platform.description}
            aria-label={platform.description}
            asChild
          >
            <a href={platform.url(postTitle, postUrl)} target='_blank' rel='noopener noreferrer'>
              <img src={platform.image} alt={platform.name} className={cn('size-8', platform.imageClassName)} />
              <span>{platform.name}</span>
            </a>
          </Button>
        ))}
      </div>
    </div>
  )
}

export default AISummaryButtons
