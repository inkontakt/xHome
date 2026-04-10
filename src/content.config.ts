import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    id: z.number(),
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    imageUrl: z.string().optional(),
    imageAlt: z.string().optional(),
    pubDate: z.string(),
    author: z.string().default('shadcn Studio'),
    avatarUrl: z.string().optional(),
    category: z.string().default('General'),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false)
  })
})

const landing = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/landing' }),
  schema: z.object({
    seo: z.object({
      title: z.string(),
      description: z.string(),
      keywords: z.string(),
      siteName: z.string()
    }),
    integrations: z.object({
      formId: z.number().int().positive().optional(),
      bookingCalendarId: z.number().int().positive().optional(),
      bookingEventId: z.number().int().positive().optional(),
      standaloneBookingUrl: z.string().url().optional()
    }).optional(),
    hero: z.object({
      badge: z.object({
        label: z.string(),
        text: z.string()
      }),
      title: z.array(z.string()).length(2),
      description: z.string(),
      primaryCta: z.object({ label: z.string(), href: z.string() }),
      secondaryCta: z.object({ label: z.string(), href: z.string() }),
      usersText: z.string(),
      ratingText: z.string(),
      tabs: z.array(
        z.object({
          value: z.enum([
            'lead-qualifier',
            'meeting-prep',
            'follow-ups',
            'data-sync',
            'reporting',
            'content-drafting'
          ]),
          name: z.string()
        })
      )
    }),
    features: z.object({
      title: z.string(),
      description: z.string(),
      cards: z.array(
        z.object({
          title: z.string(),
          description: z.string()
        })
      ).length(5)
    }),
    worksFeatures: z.object({
      title: z.string(),
      description: z.string(),
      steps: z.array(
        z.object({
          id: z.enum(['describe-workflow', 'connect-tools', 'review-and-refine']),
          title: z.string(),
          description: z.string()
        })
      ).length(3)
    }),
    useCases: z.object({
      title: z.string(),
      description: z.string(),
      heading: z.string(),
      learnMoreLabel: z.string(),
      tabs: z.array(
        z.object({
          name: z.string(),
          value: z.enum(['sales', 'marketing', 'founders']),
          image: z.string(),
          title: z.string(),
          description: z.string(),
          link: z.string(),
          testimonials: z.array(
            z.object({
              id: z.string(),
              review: z.string()
            })
          )
        })
      ).length(3)
    }),
    testimonials: z.object({
      title: z.string(),
      description: z.string(),
      items: z.array(
        z.object({
          id: z.string(),
          avatar: z.string(),
          fallback: z.string(),
          name: z.string(),
          designation: z.string(),
          companyName: z.string(),
          companyLogo: z.string(),
          companyLogoDark: z.string().optional(),
          message: z.string()
        })
      )
    }),
    pricing: z.object({
      title: z.string(),
      description: z.string(),
      heading: z.string(),
      subheading: z.string(),
      monthlyLabel: z.string(),
      yearlyLabel: z.string(),
      yearlySaveLabel: z.string(),
      plans: z.array(
        z.object({
          name: z.string(),
          description: z.string(),
          price: z.number(),
          yearlyPrice: z.number(),
          currency: z.string(),
          period: z.string(),
          features: z.array(z.string()),
          buttonText: z.string(),
          buttonVariant: z.enum(['primary', 'secondary'])
        })
      )
    }),
    faq: z.object({
      title: z.string(),
      description: z.string(),
      heading: z.string(),
      subheading: z.string(),
      docsButton: z.object({ label: z.string(), href: z.string() }),
      contactButton: z.object({ label: z.string(), href: z.string() }),
      leftColumnTitle: z.string(),
      rightColumnTitle: z.string(),
      items: z.array(
        z.object({
          question: z.string(),
          answer: z.string()
        })
      )
    }),
    cta: z.object({
      heading: z.string(),
      description: z.string(),
      primaryCta: z.object({ label: z.string(), href: z.string() }),
      secondaryCta: z.object({ label: z.string(), href: z.string() }),
      stats: z.array(
        z.object({
          number: z.number(),
          pointNumber: z.number().optional(),
          suffix: z.string(),
          description: z.string()
        })
      )
    }),
    footer: z.object({
      newsletterTitle: z.string(),
      newsletterDescription: z.string(),
      newsletterInputPlaceholder: z.string(),
      newsletterButtonLabel: z.string(),
      links: z.array(
        z.object({
          title: z.string(),
          links: z.array(
            z.object({
              title: z.string(),
              href: z.string()
            })
          )
        })
      ),
      copyrightSuffix: z.string()
    })
  })
})

export const collections = { blog, landing }
