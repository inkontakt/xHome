'use client'

import { useRef, useState } from 'react'

import { SearchIcon } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PrimaryOrionButton, SecondaryOrionButton } from '@/components/ui/orion-button'
import { cn } from '@/lib/utils'

import SectionHeader from '@/components/blocks/section-header'

export interface IntegrationTool {
  id: string
  name: string
  icon: string
  category: 'Productivity' | 'Communication' | 'Collaboration' | 'Marketing'
  description: string
  link: string
  className?: string
}

type IntegrationToolsProps = {
  tools: IntegrationTool[]
  categories: readonly string[]
}

const IntegrationTools = ({ tools, categories }: IntegrationToolsProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All tools')
  const sectionRef = useRef<HTMLElement>(null)

  // Filter tools based on search and category
  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All tools' || tool.category === selectedCategory

    return matchesSearch && matchesCategory
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
    <section id='integration-tools' ref={sectionRef}>
      <SectionHeader
        title='Integration Tools'
        description='Check tools which you can integrate with ai agent and make your daily tasks easy '
      />
      <div className='relative px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-7xl border-x'>
          <div className='grid grid-cols-1 gap-0 lg:grid-cols-[280px_1fr] xl:grid-cols-[350px_1fr]'>
            {/* Left Sidebar - Search & Categories */}
            <aside className='border-border border-b py-6 lg:border-r lg:border-b-0 lg:py-9'>
              <div className='sticky top-20 space-y-6'>
                {/* Search */}
                <div className='px-4 sm:px-6 lg:px-8'>
                  <h3 className='mb-2.5 text-xl font-medium'>Find tool</h3>
                  <div className='relative'>
                    <div className='text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50'>
                      <SearchIcon className='size-4' />
                      <span className='sr-only'>Search</span>
                    </div>
                    <Input
                      type='search'
                      placeholder='Search app here'
                      value={searchQuery}
                      name='search'
                      id='integration-tools-search'
                      onChange={e => setSearchQuery(e.target.value)}
                      className='peer h-10 px-9 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none'
                    />
                  </div>
                </div>

                <hr className='border-border' />

                {/* Categories */}
                <div className='space-y-3 px-4 sm:px-6 lg:px-8'>
                  <h3 className='text-muted-foreground'>Categories</h3>
                  <div className='flex flex-col gap-2'>
                    {categories.map(category => {
                      const isActive = selectedCategory === category

                      return isActive ? (
                        <PrimaryOrionButton
                          key={category}
                          size='lg'
                          onClick={() => handleCategoryChange(category)}
                          className='justify-start'
                        >
                          {category}
                        </PrimaryOrionButton>
                      ) : (
                        <Button
                          variant='ghost'
                          key={category}
                          size='lg'
                          onClick={() => handleCategoryChange(category)}
                          className='text-primary hover:bg-primary/10! hover:text-primary justify-start'
                        >
                          {category}
                        </Button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </aside>
            {/* Right Content - Tools Grid */}
            <div className='-mb-px grid grid-cols-1 gap-0 sm:grid-cols-2'>
              {filteredTools.length > 0 ? (
                filteredTools.map(tool => (
                  <div key={tool.id} className='sm:[&:nth-child(2n)>div]:border-r-0'>
                    <Card
                      className={cn(
                        'bg-background overflow-hidden rounded-none border-0 shadow-none lg:py-9',

                        // Right border management
                        'sm:border-r',

                        // Bottom border management
                        'border-b'
                      )}
                    >
                      <CardContent className='flex h-full flex-col justify-between gap-5 lg:px-8'>
                        {/* Header */}
                        <div className='flex items-center justify-between gap-1.5'>
                          <div className='flex items-center gap-1.5'>
                            <Avatar className='size-10 rounded-md border p-2'>
                              <AvatarImage src={tool.icon} alt={tool.name} className={tool.className} loading='lazy' />
                              <AvatarFallback>{tool.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <h3 className='text-lg font-semibold'>{tool.name}</h3>
                          </div>
                          <Badge className='bg-primary/10 text-primary shrink-0 border-none px-3 py-1'>
                            {tool.category}
                          </Badge>
                        </div>
                        {/* Description */}
                        <p className='text-muted-foreground line-clamp-3 min-h-19.5 leading-relaxed'>
                          {tool.description}
                        </p>
                        {/* Learn More Button */}
                        <SecondaryOrionButton asChild>
                          <a href={tool.link} target='_blank' rel='noopener noreferrer'>
                            Learn more
                          </a>
                        </SecondaryOrionButton>
                      </CardContent>
                    </Card>
                  </div>
                ))
              ) : (
                <div className='col-span-full p-12 text-center'>
                  <p className='text-muted-foreground text-lg'>No tools found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default IntegrationTools
