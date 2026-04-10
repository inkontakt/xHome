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

      <footer className='px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-7xl space-y-8 border-x px-4 py-8 sm:px-6 sm:py-16 md:py-24 lg:px-8'>
          {newsletter && (
            <div className='grid grid-cols-1 items-center gap-4 lg:grid-cols-5 xl:gap-24'>
              <div className='col-span-1 space-y-2 lg:col-span-3'>
                <h6 className='text-2xl font-semibold'>{content.newsletterTitle}</h6>
                <p className='text-muted-foreground'>{content.newsletterDescription}</p>
              </div>
              <div className='col-span-1 lg:col-span-2'>
                <div className='flex justify-start gap-3 lg:justify-end'>
                  <Input type='email' placeholder={content.newsletterInputPlaceholder} className='h-10 max-w-70' />
                  <PrimaryOrionButton size='lg' className='rounded-lg'>
                    {content.newsletterButtonLabel}
                  </PrimaryOrionButton>
                </div>
              </div>
            </div>
          )}

          <div className='grid grid-flow-row grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5'>
            {content.links.map((section, index) => (
              <div key={index} className='flex flex-col gap-5'>
                <div className='text-lg font-medium'>{section.title}</div>
                <ul className='text-muted-foreground space-y-3'>
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={link.href}
                        className='text-muted-foreground hover:text-foreground transition-colors duration-300'
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

        <div className='mx-auto max-w-7xl border-x'>
          <Separator />
          <div className='mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 p-4 sm:px-6 lg:px-8'>
            <a href='/#home'>
              <Logo />
            </a>
            <p className='text-muted-foreground font-light'>
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
