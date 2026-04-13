import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const linkSchema = z.object({
  label: z.string(),
  href: z.string(),
});

const heroTabValueSchema = z.enum([
  "lead-qualifier",
  "meeting-prep",
  "follow-ups",
  "data-sync",
  "reporting",
  "content-drafting",
]);

const worksFeatureStepIdSchema = z.enum([
  "describe-workflow",
  "connect-tools",
  "review-and-refine",
]);

const useCaseTabValueSchema = z.enum(["sales", "marketing", "founders"]);

const pricingButtonVariantSchema = z.enum(["primary", "secondary"]);

const seoSchema = z.object({
  title: z.string(),
  description: z.string(),
  keywords: z.string(),
  siteName: z.string(),
});

const integrationsSchema = z.object({
  formId: z.number().int().positive().optional(),
  bookingCalendarId: z.number().int().positive().optional(),
  bookingEventId: z.number().int().positive().optional(),
  standaloneBookingUrl: z.string().url().optional(),
});

const heroSchema = z.object({
  badge: z.object({
    label: z.string(),
    text: z.string(),
  }),
  title: z.array(z.string()).length(2),
  description: z.string(),
  primaryCta: linkSchema,
  secondaryCta: linkSchema,
  usersText: z.string(),
  ratingText: z.string(),
  tabs: z.array(
    z.object({
      value: heroTabValueSchema,
      name: z.string(),
    }),
  ),
});

const featuresSchema = z.object({
  title: z.string(),
  description: z.string(),
  cards: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
      }),
    )
    .length(5),
});

const worksFeaturesSchema = z.object({
  title: z.string(),
  description: z.string(),
  steps: z
    .array(
      z.object({
        id: worksFeatureStepIdSchema,
        title: z.string(),
        description: z.string(),
      }),
    )
    .length(3),
});

const useCasesSchema = z.object({
  title: z.string(),
  description: z.string(),
  heading: z.string(),
  learnMoreLabel: z.string(),
  tabs: z
    .array(
      z.object({
        name: z.string(),
        value: useCaseTabValueSchema,
        image: z.string(),
        title: z.string(),
        description: z.string(),
        link: z.string(),
        testimonials: z.array(
          z.object({
            id: z.string(),
            review: z.string(),
          }),
        ),
      }),
    )
    .length(3),
});

const testimonialsSchema = z.object({
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
      message: z.string(),
    }),
  ),
});

const pricingSchema = z.object({
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
      buttonVariant: pricingButtonVariantSchema,
    }),
  ),
});

const faqSchema = z.object({
  title: z.string(),
  description: z.string(),
  heading: z.string(),
  subheading: z.string(),
  docsButton: linkSchema,
  contactButton: linkSchema,
  leftColumnTitle: z.string(),
  rightColumnTitle: z.string(),
  items: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    }),
  ),
});

const ctaSchema = z.object({
  heading: z.string(),
  description: z.string(),
  primaryCta: linkSchema,
  secondaryCta: linkSchema,
  stats: z.array(
    z.object({
      number: z.number(),
      pointNumber: z.number().optional(),
      suffix: z.string(),
      description: z.string(),
    }),
  ),
});

const footerSchema = z.object({
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
          href: z.string(),
        }),
      ),
    }),
  ),
  copyrightSuffix: z.string(),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    id: z.number(),
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    imageUrl: z.string().optional(),
    imageAlt: z.string().optional(),
    pubDate: z.string(),
    author: z.string().default("shadcn Studio"),
    avatarUrl: z.string().optional(),
    category: z.string().default("General"),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
  }),
});

const landingSettings = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/landing-settings" }),
  schema: z.object({
    seo: seoSchema,
    integrations: integrationsSchema.optional(),
  }),
});

const landingSections = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/landing-sections" }),
  schema: z.discriminatedUnion("section", [
    heroSchema.extend({
      section: z.literal("hero"),
    }),
    featuresSchema.extend({
      section: z.literal("features"),
    }),
    worksFeaturesSchema.extend({
      section: z.literal("works-features"),
    }),
    useCasesSchema.extend({
      section: z.literal("use-cases"),
    }),
    testimonialsSchema.extend({
      section: z.literal("testimonials"),
    }),
    pricingSchema.extend({
      section: z.literal("pricing"),
    }),
    faqSchema.extend({
      section: z.literal("faq"),
    }),
    ctaSchema.extend({
      section: z.literal("cta"),
    }),
    footerSchema.extend({
      section: z.literal("footer"),
    }),
  ]),
});

export const collections = { blog, landingSettings, landingSections };
