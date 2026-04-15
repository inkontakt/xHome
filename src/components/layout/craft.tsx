import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

type BaseProps = {
  children?: ReactNode
  className?: string
  id?: string
}

type DangerousHtmlProps = {
  dangerouslySetInnerHTML?: { __html: string }
}

type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
type GridValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
type GapValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12
type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>

type BoxProps = BaseProps & {
  direction?: ResponsiveValue<'row' | 'col'>
  wrap?: ResponsiveValue<'wrap' | 'nowrap'>
  gap?: ResponsiveValue<GapValue>
  cols?: ResponsiveValue<GridValue>
  rows?: ResponsiveValue<GridValue>
}

const typographyStyles = [
  'font-sans antialiased',
  '[&_h1]:text-4xl [&_h1]:font-medium [&_h1]:tracking-tight',
  '[&_h2]:text-3xl [&_h2]:font-medium [&_h2]:tracking-tight',
  '[&_h3]:text-2xl [&_h3]:font-medium [&_h3]:tracking-tight',
  '[&_h4]:text-xl [&_h4]:font-medium [&_h4]:tracking-tight',
  '[&_p]:text-base [&_p]:leading-7 [&_p]:mb-4',
  '[&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-primary/50 hover:[&_a]:decoration-primary hover:[&_a]:text-primary',
  '[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6',
  '[&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6',
  '[&_li]:leading-7',
  '[&_code]:rounded [&_code]:bg-muted/50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm',
  '[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:bg-muted/50 [&_pre]:p-4',
  '[&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg [&_img]:border',
  '[&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/20 [&_blockquote]:py-1 [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground'
]

const articleTypographyStyles = [
  ...typographyStyles,
  '[&_h1]:mt-8 [&_h1]:mb-4',
  '[&_h2]:mt-8 [&_h2]:mb-4',
  '[&_h3]:mt-6 [&_h3]:mb-3',
  '[&_h4]:mt-6 [&_h4]:mb-3'
]

const responsiveClass = <T extends string | number>(
  value: ResponsiveValue<T> | undefined,
  classMap: Record<T, string>
) => {
  if (!value) return ''
  if (typeof value !== 'object') return classMap[value]

  return Object.entries(value)
    .map(([breakpoint, item]) => {
      if (!item) return ''
      const prefix = breakpoint === 'base' ? '' : `${breakpoint}:`
      return `${prefix}${classMap[item as T]}`
    })
    .filter(Boolean)
    .join(' ')
}

const directionClasses = {
  row: 'flex-row',
  col: 'flex-col'
}

const wrapClasses = {
  wrap: 'flex-wrap',
  nowrap: 'flex-nowrap'
}

const gapClasses = {
  0: 'gap-0',
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
  8: 'gap-8',
  10: 'gap-10',
  12: 'gap-12'
}

const gridClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
  8: 'grid-cols-8',
  9: 'grid-cols-9',
  10: 'grid-cols-10',
  11: 'grid-cols-11',
  12: 'grid-cols-12'
}

const rowClasses = {
  1: 'grid-rows-1',
  2: 'grid-rows-2',
  3: 'grid-rows-3',
  4: 'grid-rows-4',
  5: 'grid-rows-5',
  6: 'grid-rows-6',
  7: 'grid-rows-7',
  8: 'grid-rows-8',
  9: 'grid-rows-9',
  10: 'grid-rows-10',
  11: 'grid-rows-11',
  12: 'grid-rows-12'
}

export function Section({ children, className, id, ...props }: BaseProps & HTMLAttributes<HTMLElement>) {
  return (
    <section id={id} className={cn('py-8 md:py-12', className)} {...props}>
      {children}
    </section>
  )
}

export function Container({ children, className, id, ...props }: BaseProps & HTMLAttributes<HTMLDivElement>) {
  return (
    <div id={id} className={cn('mx-auto w-full max-w-5xl px-6 sm:px-8', className)} {...props}>
      {children}
    </div>
  )
}

export function Article({
  children,
  className,
  id,
  dangerouslySetInnerHTML,
  ...props
}: BaseProps & DangerousHtmlProps & HTMLAttributes<HTMLElement>) {
  return (
    <article
      id={id}
      dangerouslySetInnerHTML={dangerouslySetInnerHTML}
      className={cn(articleTypographyStyles, 'max-w-prose [&>*+*]:mt-6', className)}
      {...props}
    >
      {children}
    </article>
  )
}

export function Prose({
  children,
  className,
  id,
  dangerouslySetInnerHTML,
  ...props
}: BaseProps & DangerousHtmlProps & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      id={id}
      dangerouslySetInnerHTML={dangerouslySetInnerHTML}
      className={cn(typographyStyles, '[&>*+*]:mt-6', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function Box({ children, className, direction = 'row', wrap = 'nowrap', gap = 0, cols, rows, id }: BoxProps) {
  return (
    <div
      id={id}
      className={cn(
        cols || rows ? 'grid' : 'flex',
        responsiveClass(direction, directionClasses),
        responsiveClass(wrap, wrapClasses),
        responsiveClass(gap, gapClasses),
        cols && responsiveClass(cols, gridClasses),
        rows && responsiveClass(rows, rowClasses),
        className
      )}
    >
      {children}
    </div>
  )
}
