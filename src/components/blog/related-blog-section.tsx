import { ArrowUpRightIcon, ClockIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

import { SecondaryOrionButton } from '@/components/ui/orion-button'
import SectionHeader from '@/components/blocks/section-header'

type PostMetadata = {
  slug: string
  title: string
  description: string
  image: string
  category: string
  readTime: string
  author: {
    name: string
    picture: string
  }
}

const RelatedBlogSection = ({ posts }: { posts: PostMetadata[] }) => {
  return (
    <section>
      <SectionHeader title='Related blogs' description='Expand your knowledge with these hand-picked posts' />
      <div className='px-3 sm:px-4'>
        <div className='mx-auto max-w-5xl border-x'>
          {/* Blog Grid */}
          <div className='grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-3'>
            {posts.map(post => (
              <a
                key={post.slug}
                href={`/blog/${post.slug}`}
                className='last:border-b-0 max-lg:border-b sm:border-r sm:max-lg:nth-[2n]:border-r-0 lg:last:border-r-0'
              >
                <Card className='group bg-background h-full overflow-hidden rounded-none border-none shadow-none transition-all duration-300 hover:shadow-none'>
                  <CardContent className='flex h-full flex-col justify-between space-y-5 px-3 sm:px-4 lg:px-6'>
                    <div className='space-y-5'>
                      {/* Image */}
                      <div className='overflow-hidden rounded-md'>
                        <img
                          src={post.image}
                          alt={post.title}
                          className='aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105'
                        />
                      </div>
                      {/* Meta Info */}
                      <div className='flex items-center justify-between gap-2'>
                        <div className='text-muted-foreground flex items-center gap-1.5'>
                          <ClockIcon className='size-4.5' />
                          <span>{post.readTime} read</span>
                        </div>
                        <Badge className='bg-destructive/10 text-destructive hover:bg-destructive/10 rounded-full border-none px-3 py-1'>
                          {post.category}
                        </Badge>
                      </div>
                      {/* Title */}
                      <h3 className='line-clamp-1 text-lg leading-tight font-medium md:text-xl'>{post.title}</h3>
                      {/* Description */}
                      <p className='text-muted-foreground line-clamp-3 leading-relaxed'>{post.description}</p>
                    </div>

                    {/* Footer */}
                    <div className='flex flex-wrap items-center justify-between gap-2'>
                      <p className='text-sm'>{post.author?.name}</p>
                      <SecondaryOrionButton size='icon' className='rounded-md'>
                        <ArrowUpRightIcon className='size-4' />
                        <span className='sr-only'>Read more: {post.title}</span>
                      </SecondaryOrionButton>
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default RelatedBlogSection
