'use client'

import { useEffect, useState } from 'react'

import { COMPANY_INFO } from '@/consts'

import { LogInIcon } from 'lucide-react'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { SecondaryOrionButton } from '@/components/ui/orion-button'

import ThemeToggle from '@/components/layout/theme-toggle'

import { HeaderNavigation, HeaderNavigationSmallScreen, type Navigation } from '@/components/layout/header-navigation'

import Logo from '@/components/logo'

import { cn } from '@/lib/utils'

type HeaderProps = {
  navigationData: Navigation[]
  className?: string
  pathname?: string
}

const Header = ({ navigationData, className, pathname: serverPathname }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [pathname, setPathname] = useState(serverPathname || '/')

  // Sync pathname with client-side navigation
  useEffect(() => {
    const updatePathname = () => {
      setPathname(window.location.pathname)
    }

    // Update on initial load
    updatePathname()

    // Listen for Astro page transitions
    document.addEventListener('astro:page-load', updatePathname)

    return () => {
      document.removeEventListener('astro:page-load', updatePathname)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <header
      className={cn(
        'header-menu sticky top-0 z-50 w-full border-b bg-background/92 px-2 backdrop-blur supports-[backdrop-filter]:bg-background/78 sm:px-4',
        {
          'shadow-sm': isScrolled
        },
        className
      )}
    >
      <div className='mx-auto flex h-16 max-w-5xl items-center justify-between gap-2 border-x px-2 sm:px-4 lg:px-6'>
        {/* Logo */}
        <a href='/#home' aria-label={`${COMPANY_INFO.name} Home`} className='shrink-0'>
          <Logo />
        </a>

        {/* Navigation */}
        <HeaderNavigation
          navigationData={navigationData}
          navigationClassName='[&_[data-slot="navigation-menu-list"]]:gap-1'
          pathname={pathname}
        />

        {/* Actions */}
        <div className='flex shrink-0 items-center gap-1.5 sm:gap-2'>
          <div className='hidden min-[430px]:block'>
            <ThemeToggle />
          </div>
          <SecondaryOrionButton size='sm' className='hidden rounded-md sm:inline-flex' asChild>
            <a href='/register'>Sign up</a>
          </SecondaryOrionButton>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <SecondaryOrionButton size='icon-sm' className='hidden min-[430px]:inline-flex sm:hidden' asChild>
                  <a href='/register'>
                    <LogInIcon />
                    <span className='sr-only'>register</span>
                  </a>
                </SecondaryOrionButton>
              </TooltipTrigger>
              <TooltipContent>register</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <HeaderNavigationSmallScreen navigationData={navigationData} pathname={pathname} />
        </div>
      </div>
    </header>
  )
}

export default Header
