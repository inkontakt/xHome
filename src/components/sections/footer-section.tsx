import Footer from '@/components/layout/footer'
import { useFreshLandingContent } from '@/hooks/useFreshLandingContent'

type FooterSectionContent = {
  newsletterTitle: string
  newsletterDescription: string
  newsletterInputPlaceholder: string
  newsletterButtonLabel: string
  links: Array<{ title: string; links: Array<{ title: string; href: string }> }>
  copyrightSuffix: string
}

const defaultContent: FooterSectionContent = {
  newsletterTitle: 'Subscribe to our newsletter',
  newsletterDescription:
    'Stay in the loop with the latest updates on AI productivity, automation tips, and new features. One email a week no spam, just smart insights.',
  newsletterInputPlaceholder: 'Your Email',
  newsletterButtonLabel: 'Subscribe',
  links: [
    {
      title: 'Pages',
      links: [
        { title: 'Features', href: '/#features' },
        { title: 'Use cases', href: '/#use-cases' },
        { title: 'Testimonials', href: '/#testimonials' },
        { title: 'Pricing', href: '/#pricing' },
        { title: 'App Integration', href: '/app-integration' }
      ]
    },
    {
      title: 'Company',
      links: [
        { title: 'About Us', href: '#' },
        { title: 'Careers', href: '#' },
        { title: 'News', href: '#' },
        { title: 'Media kit', href: '#' },
        { title: 'Contact', href: '#' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { title: 'Blog', href: '/blog' },
        { title: 'Help Center', href: '#' },
        { title: 'Tutorials', href: '#' },
        { title: 'Api Docs', href: '#' },
        { title: 'Community', href: '#' },
        { title: 'Support', href: '#' }
      ]
    },
    {
      title: 'Social',
      links: [
        { title: 'X', href: '#' },
        { title: 'LinkedIn', href: '#' },
        { title: 'Facebook', href: '#' },
        { title: 'Github', href: '#' },
        { title: 'Product Hunt', href: '#' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { title: 'Terms of Service', href: '#' },
        { title: 'Privacy Policy', href: '#' },
        { title: 'Cookie Policy', href: '#' },
        { title: 'Licenses', href: '#' },
        { title: 'Security', href: '#' },
        { title: 'Accessibility', href: '#' }
      ]
    }
  ],
  copyrightSuffix: 'Made with passion and creativity.'
}

const FooterSection = ({ newsletter = false, content = defaultContent }: { newsletter?: boolean; content?: FooterSectionContent }) => {
  const freshContent = useFreshLandingContent(content, 'footer')

  return <Footer newsletter={newsletter} content={freshContent} />
}

export default FooterSection
