import type { ReactNode } from 'react'

import Logo from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface AuthFormSectionProps {
  title: string
  subtitle: string
  showSocialButtons?: boolean
  socialButtons?: {
    google?: boolean
    facebook?: boolean
  }
  showDivider?: boolean
  dividerText?: string
  children: ReactNode
  footerText?: string
  footerLinkText?: string
  footerLinkHref?: string
}

const AuthFormSection = ({
  title,
  subtitle,
  showSocialButtons = false,
  socialButtons = { google: false, facebook: false },
  showDivider = false,
  dividerText = 'or',
  children,
  footerText,
  footerLinkText,
  footerLinkHref
}: AuthFormSectionProps) => {
  return (
    <div className='flex h-full items-center justify-center space-y-6'>
      <div className='flex w-full flex-col gap-6'>
        <div className='space-y-6 px-4 sm:px-6 lg:px-8 xl:px-12'>
          <a href='/' className='inline-block'>
            <Logo logoSize='size-10' fontSize='text-2xl' />
          </a>
          <div>
            <h2 className='mb-3 text-xl font-medium'>{title}</h2>
            <p className='text-muted-foreground'>{subtitle}</p>
          </div>
          {showSocialButtons && (
            <div className='flex flex-wrap gap-4'>
              {socialButtons.google && (
                <Button variant='outline' className='flex-1' asChild>
                  <a href='#'>
                    Sign {title.includes('Sign In') || title.includes('Welcome Back') ? 'in' : 'up'} with Google
                  </a>
                </Button>
              )}
              {socialButtons.facebook && (
                <Button variant='outline' className='flex-1' asChild>
                  <a href='#'>
                    Sign {title.includes('Sign In') || title.includes('Welcome Back') ? 'in' : 'up'} with Facebook
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>

        {showDivider && (
          <div className='flex items-center gap-4'>
            <Separator className='flex-1' />
            <p>{dividerText}</p>
            <Separator className='flex-1' />
          </div>
        )}

        <div className='space-y-4 px-4 sm:px-6 lg:px-8 xl:px-12'>
          {children}

          {(footerText || footerLinkText || footerLinkHref) && (
            <p className='text-muted-foreground text-center'>
              {footerText}{' '}
              {footerLinkHref && footerLinkText && (
                <a href={footerLinkHref} className='text-foreground whitespace-nowrap hover:underline'>
                  {footerLinkText}
                </a>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthFormSection
