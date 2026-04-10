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
        'sticky top-0 z-50 h-16 w-full border-b px-4 transition-all duration-300 sm:px-6 lg:px-8',
        {
          'bg-card/75 shadow-xl backdrop-blur': isScrolled
        },
        className
      )}
    >
      <div className='mx-auto flex h-full max-w-7xl items-center justify-between gap-4 border-x px-4 sm:px-6 lg:px-8'>
        {/* Logo */}
        <a href='/#home' aria-label={`${COMPANY_INFO.name} Home`}>
          <Logo />
        </a>

        {/* Navigation */}
        <HeaderNavigation
          navigationData={navigationData}
          navigationClassName='[&_[data-slot="navigation-menu-list"]]:gap-1'
          pathname={pathname}
        />

        {/* Actions */}
        <div className='flex items-center gap-3'>
          <ThemeToggle />
          <SecondaryOrionButton size='lg' className='max-sm:hidden' asChild>
            <a href='/register'>Sign up</a>
          </SecondaryOrionButton>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <SecondaryOrionButton size='icon-lg' className='sm:hidden' asChild>
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
