import LogoSvg from '@/assets/svg/orion-logo'

// Util Imports
import { cn } from '@/lib/utils'

const Logo = ({ className, logoSize, fontSize }: { className?: string; logoSize?: string; fontSize?: string }) => {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <LogoSvg className={cn('size-8', logoSize)} />
      <span className={cn('text-xl font-semibold', fontSize)}>Orion</span>
    </div>
  )
}

export default Logo
