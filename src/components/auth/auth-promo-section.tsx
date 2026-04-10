import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import LogoVector from '@/assets/svg/logo-vector'

interface AuthPromoSectionProps {
  title: string
  description: string
  cardTitle: string
  cardDescription: string
  avatars?: Array<{
    src: string
    fallback: string
    name: string
  }>
  avatarCount?: string
}

const AuthPromoSection = ({
  title,
  description,
  cardTitle,
  cardDescription,
  avatars = [],
  avatarCount = '+3695'
}: AuthPromoSectionProps) => {
  return (
    <div className='bg-muted h-screen max-lg:hidden'>
      <Card className='bg-primary relative z-1 h-full justify-between overflow-hidden rounded-none border-none py-8'>
        <CardHeader className='gap-6 px-8'>
          <CardTitle className='text-primary-foreground text-4xl font-bold lg:text-5xl/15.5'>{title}</CardTitle>
          <p className='text-primary-foreground text-xl'>{description}</p>
        </CardHeader>

        <LogoVector className='text-background pointer-events-none absolute bottom-30 -left-40 -z-1 size-120 rotate-30 opacity-20' />

        <CardContent className='relative z-1 mx-8 min-h-71 overflow-hidden rounded-4xl rounded-tr-none p-6 md:p-8'>
          <svg
            width='575'
            height='284'
            viewBox='0 0 575 284'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            className='pointer-events-none absolute top-0 right-0 -z-1 h-full select-none'
          >
            <path
              d='M0 16C0 7.16344 7.16344 0 16 0H287.5H482.87C491.707 0 498.87 7.16344 498.87 16V59C498.87 67.8366 506.034 75 514.87 75H559C567.837 75 575 82.1634 575 91V268C575 276.837 567.836 284 559 284H16C7.16343 284 0 276.837 0 268V16Z'
              fill='var(--card)'
            />
          </svg>

          <div className='bg-card absolute top-0 right-0 flex size-15 items-center justify-center rounded-2xl'>
            <LogoVector className='text-primary size-9' />
          </div>

          <div className='flex h-full flex-col justify-between gap-5'>
            <div className='space-y-6'>
              <p className='line-clamp-2 pr-12 text-3xl font-bold'>{cardTitle}</p>
              <p className='line-clamp-2 text-lg'>{cardDescription}</p>
            </div>

            {avatars.length > 0 && (
              <div className='flex -space-x-4 self-end *:transition-all *:duration-300 *:ease-in-out hover:space-x-1'>
                {avatars.map((avatar, index) => (
                  <Avatar key={index} className='ring-background size-12 ring-2'>
                    <AvatarImage src={avatar.src} alt={avatar.name} />
                    <AvatarFallback className='text-xs'>{avatar.fallback}</AvatarFallback>
                  </Avatar>
                ))}
                <Avatar className='ring-background size-12 ring-2'>
                  <AvatarFallback className='text-xs'>{avatarCount}</AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AuthPromoSection
