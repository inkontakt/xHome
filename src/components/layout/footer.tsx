import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { PrimaryOrionButton } from '@/components/ui/orion-button'

import Logo from '@/components/logo'

type FooterLink = {
  title: string
  href: string
}

type FooterSection = {
  title: string
  links: FooterLink[]
}

type FooterContent = {
  newsletterTitle: string
  newsletterDescription: string
  newsletterInputPlaceholder: string
  newsletterButtonLabel: string
  links: FooterSection[]
  copyrightSuffix: string
}

const Footer = ({ newsletter = true, content }: { newsletter?: boolean; content: FooterContent }) => {
  return (
    <>
      <Separator />

      <footer className='footer-menu px-3 sm:px-4'>
        <div className='mx-auto max-w-5xl space-y-10 border-x px-3 py-10 sm:px-4 sm:py-14 lg:px-6'>
          {newsletter && (
            <div className='grid grid-cols-1 items-center gap-5 border-b pb-10 md:grid-cols-[1.5fr_1fr]'>
              <div className='space-y-2'>
                <h6 className='text-2xl font-semibold tracking-normal'>{content.newsletterTitle}</h6>
                <p className='max-w-2xl text-sm leading-6 text-muted-foreground'>{content.newsletterDescription}</p>
              </div>
              <div>
                <div className='flex flex-col gap-3 sm:flex-row md:justify-end'>
                  <Input type='email' placeholder={content.newsletterInputPlaceholder} className='h-10 min-w-0 sm:max-w-72' />
                  <PrimaryOrionButton size='lg' className='shrink-0 rounded-md'>
                    {content.newsletterButtonLabel}
                  </PrimaryOrionButton>
                </div>
              </div>
            </div>
          )}

          <div className='grid grid-flow-row grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-3 lg:grid-cols-5'>
            {content.links.map((section, index) => (
              <div key={index} className='flex flex-col gap-4'>
                <div className='text-sm font-semibold uppercase tracking-normal'>{section.title}</div>
                <ul className='space-y-2.5 text-sm text-muted-foreground'>
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={link.href}
                        className='text-muted-foreground transition-colors duration-200 hover:text-foreground'
                      >
                        {link.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className='mx-auto max-w-5xl border-x'>
          <Separator />
          <div className='mx-auto flex flex-wrap items-center justify-between gap-4 px-3 py-5 sm:px-4 lg:px-6'>
            <a href='/#home'>
              <Logo />
            </a>
            <p className='text-sm font-light text-muted-foreground'>
              {'©' + new Date().getFullYear() + ' '}
              <a href='/#home' className='link-animated'>
                Orion
              </a>
              {', ' + content.copyrightSuffix}
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Footer
