'use client'

import { useRef, useState } from 'react'

import { ArrowUpRightIcon, Clock4Icon, LayoutDashboardIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { SecondaryOrionButton } from '@/components/ui/orion-button'

import SectionHeader from '@/components/blocks/section-header'

export type BlogPostMetadata = {
  slug: string
  title: string
  description: string
  category: string
  publishedAt?: string
  author: {
    name: string
    picture?: string
  }
  image: string
  readTime?: string
  featured?: boolean
}

// Category color mapping
const categoryColors: Record<string, { inactive: string; active: string }> = {
  'Workflow Automation': {
    inactive:
      'bg-sky-600/10 hover:bg-sky-600/15 text-sky-600 dark:text-sky-400 focus-visible:ring-sky-600/20 dark:bg-sky-400/10',
    active:
      'bg-sky-600 dark:bg-sky-400 hover:bg-sky-600/90 focus-visible:ring-sky-600/20 dark:focus-visible:ring-sky-600/40 dark:bg-sky-600/60 text-white'
  },
  'AI Agents': {
    inactive:
      'bg-green-600/10 hover:bg-green-600/15 text-green-600 dark:text-green-400 focus-visible:ring-green-600/20 dark:bg-green-400/10',
    active:
      'bg-green-600 dark:bg-green-400 hover:bg-green-600/90 focus-visible:ring-green-600/20 dark:focus-visible:ring-green-400/40 dark:bg-green-400/60 text-white'
  },
  'Business Operations': {
    inactive:
      'bg-amber-600/10 hover:bg-amber-600/15 text-amber-600 dark:text-amber-400 focus-visible:ring-amber-600/20 dark:bg-amber-400/10',
    active:
      'bg-amber-600 dark:bg-amber-400 hover:bg-amber-600/90 focus-visible:ring-amber-600/20 dark:focus-visible:ring-amber-600/40 dark:bg-amber-600/60 text-white'
  },
  'Product & Integrations': {
    inactive:
      'bg-destructive/10 hover:bg-destructive/15 [a&]:hover:bg-destructive/5 focus-visible:ring-destructive/20 text-destructive border-none',
    active: 'bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive/20 text-white'
  },
  All: {
    inactive: 'bg-primary/10 hover:bg-primary/15 text-primary focus-visible:ring-primary/20 dark:bg-primary/10',
    active: 'bg-primary hover:bg-primary/90 focus-visible:ring-primary/20 text-white'
  }
}

const BlogList = ({
  posts,
  onCategoryClick
}: {
  posts: BlogPostMetadata[]
  onCategoryClick: (category: string) => void
}) => {
  return (
    <>
      {posts.map((post, index) => (
        <Card
          key={index}
          className='group bg-background overflow-hidden rounded-none border-x-0 border-t-0 shadow-none lg:last:border-b-0'
        >
          <CardContent className='px-4 sm:px-6 lg:px-8'>
            <div className='flex flex-col items-center gap-5 md:max-lg:flex-row xl:flex-row'>
              {/* Image */}
              <a
                href={`/blog/${post.slug}`}
                className='w-full shrink-0 overflow-hidden rounded-md max-md:aspect-video md:h-59.5 md:max-lg:w-80 xl:w-72'
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className='size-full object-cover transition-transform duration-300 group-hover:scale-105'
                />
              </a>

              {/* Content */}
              <div className='flex flex-1 flex-col justify-between gap-5'>
                {/* Meta */}
                <div className='flex flex-wrap items-center justify-between gap-3'>
                  <div className='text-muted-foreground flex items-center gap-1.5'>
                    <Clock4Icon className='size-4.5' />
                    <span className='text-sm'>{post.readTime || '5 min'} read</span>
                  </div>
                  <Badge
                    onClick={() => onCategoryClick(post.category || '')}
                    className={`${categoryColors[post.category || '']?.inactive || categoryColors['Product & Integrations'].inactive} cursor-pointer border-none px-3 py-1 focus-visible:outline-none`}
                  >
                    {post.category}
                  </Badge>
                </div>

                {/* Title & Description */}
                <a href={`/blog/${post.slug}`}>
                  <h3 className='text-lg font-medium md:text-xl'>{post.title}</h3>
                </a>
                <p className='text-muted-foreground line-clamp-3'>{post.description}</p>

                {/* Footer */}
                <div className='flex items-center justify-between'>
                  <a href={`/blog/${post.slug}`}>
                    <p className='text-sm'>{post.author?.name}</p>
                  </a>
                  <SecondaryOrionButton size='icon' className='rounded-md' asChild>
                    <a href={`/blog/${post.slug}`}>
                      <ArrowUpRightIcon className='size-4' />
                      <span className='sr-only'>Read more: {post.title}</span>
                    </a>
                  </SecondaryOrionButton>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}

const FeaturedPostsSidebar = ({
  posts,
  categories,
  selectedCategory,
  onCategoryChange
}: {
  posts: BlogPostMetadata[]
  categories: string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
}) => {
  return (
    <div>
      <div className='lg:sticky lg:top-16'>
        {/* Categories */}
          <div className='space-y-5 border-b bg-card px-3 py-8 sm:px-4 lg:px-6'>
          <div className='flex items-center gap-4'>
            <LayoutDashboardIcon className='size-4.5' />
            <h2 className='text-xl font-medium'>Categories</h2>
          </div>
          <div className='flex flex-wrap gap-2.5'>
            {categories.map(category => {
              const isAll = category === 'All'
              const isActive = selectedCategory === category

              const colors = isAll
                ? categoryColors['All']
                : categoryColors[category] || categoryColors['Product & Integrations']

              return (
                <Badge
                  key={category}
                  onClick={() => onCategoryChange(category)}
                  className={`${isActive ? colors.active : colors.inactive} cursor-pointer border-none px-3 py-1 transition-colors focus-visible:outline-none`}
                >
                  {category}
                </Badge>
              )
            })}
          </div>
        </div>
        {/* Featured Posts */}
        {posts.length > 0 && (
          <div className='max-lg:hidden'>
            {posts.map((post, index) => (
              <a key={index} href={`/blog/${post.slug}`}>
                <Card className='group bg-background overflow-hidden rounded-none border-x-0 border-t-0 shadow-none transition-all duration-300'>
                  <CardContent className='px-4 sm:px-6 lg:px-8'>
                    <div className='flex items-center gap-4'>
                      {/* Image */}
                      <div className='aspect-video h-24 w-28 shrink-0 overflow-hidden rounded-md'>
                        <img
                          src={post.image}
                          alt={post.title}
                          className='size-full object-cover transition-transform duration-300 group-hover:scale-106'
                        />
                      </div>
                      {/* Content */}
                      <div className='flex flex-1 flex-col justify-between gap-1.5'>
                        <h3 className='line-clamp-2 text-xl font-medium'>{post.title}</h3>
                        <p className='text-muted-foreground line-clamp-2'>{post.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const BlogSection = ({ posts, featuredPosts }: { posts: BlogPostMetadata[]; featuredPosts: BlogPostMetadata[] }) => {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const sectionRef = useRef<HTMLElement>(null)

  const filterCategories = Array.from(
    new Set(posts.filter(post => post.featured !== true).map(post => post.category))
  ).filter(Boolean) as string[]

  const categories = ['All', ...filterCategories]

  const filteredPosts = posts.filter(post => {
    // Exclude featured posts from main list
    if (post.featured === true) return false

    // Category filter
    return selectedCategory === 'All' || post.category === selectedCategory
  })

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)

    // Scroll to top of section when category changes
    if (sectionRef.current) {
      const yOffset = -64 // Offset for fixed header
      const y = sectionRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset

      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return (
    <section ref={sectionRef}>
      <SectionHeader
        title='Blogs'
        description='Boost your efficiency with an AI agent that eliminates manual work and streamlines your operations.'
      />
      <div className='px-3 sm:px-4'>
        <div className='mx-auto max-w-5xl border-x'>
          <div className='flex flex-col-reverse lg:grid lg:grid-cols-[1fr_340px]'>
            {/* Featured Posts Small Screen */}
            {featuredPosts.length > 0 && (
              <div className='lg:hidden'>
                <h2 className='mt-6 px-6 text-xl font-semibold'>Featured Posts</h2>
                <div>
                  {featuredPosts.map((post, index) => (
                    <a key={index} href={`/blog/${post.slug}`} className='last:*:data-[slot=card]:border-b-0'>
                      <Card className='group bg-background overflow-hidden rounded-none border-x-0 border-t-0 shadow-none transition-all duration-300'>
                        <CardContent>
                          <div className='flex items-center gap-4'>
                            {/* Image */}
                      <div className='aspect-video h-24 w-28 shrink-0 overflow-hidden rounded-md'>
                              <img
                                src={post.image}
                                alt={post.title}
                                className='size-full object-cover transition-transform duration-300 group-hover:scale-106'
                              />
                            </div>
                            {/* Content */}
                            <div className='flex flex-1 flex-col justify-between gap-3'>
                              <h3 className='line-clamp-2 text-xl font-medium'>{post.title}</h3>
                              <p className='text-muted-foreground line-clamp-2'>{post.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </a>
                  ))}
                </div>
              </div>
            )}
            {/* Main Blog List */}
            <div className='lg:border-r'>
              {filteredPosts.length > 0 ? (
                <BlogList posts={filteredPosts} onCategoryClick={handleCategoryChange} />
              ) : (
                <div className='text-muted-foreground flex min-h-100 flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-8 text-center'>
                  <div className='space-y-2'>
                    <h3 className='text-foreground text-lg font-medium'>No posts found</h3>
                    <p className='text-sm'>No posts in &ldquo;{selectedCategory}&rdquo; category yet.</p>
                  </div>
                </div>
              )}
            </div>
            {/* Sidebar */}
            <FeaturedPostsSidebar
              posts={featuredPosts}
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default BlogSection
