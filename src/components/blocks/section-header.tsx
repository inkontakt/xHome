'use client'

import { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

type SectionHeaderProps = {
  title: string
  description: string
  className?: string
  titleClassName?: string
  descriptionClassName?: string
  id?: string
}

const SectionHeader = ({
  title,
  description,
  className,
  titleClassName,
  descriptionClassName,
  id
}: SectionHeaderProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) return

    const ctx = canvas.getContext('2d')

    if (!ctx) return

    const squareSize = 4
    const gridGap = 6
    const flickerChance = 0.15
    const maxOpacity = 0.15

    const dpr = window.devicePixelRatio || 1
    const width = canvas.parentElement!.offsetWidth
    const height = canvas.parentElement!.offsetHeight

    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const cols = Math.floor(width / (squareSize + gridGap))
    const rows = Math.floor(height / (squareSize + gridGap))
    const squares = new Float32Array(cols * rows)
    let slowFrameCount = 0

    // #region agent log
    fetch('http://localhost:7433/ingest/2b9349a0-c0a1-4e81-9aa0-918008adcca8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c66fb0'},body:JSON.stringify({sessionId:'c66fb0',runId:'slow-homepage-1',hypothesisId:'H2',location:'section-header.tsx:useEffect',message:'canvas_animation_started',data:{id:id??null,width,height,cols,rows,squares:squares.length},timestamp:Date.now()})}).catch(()=>{})
    // #endregion

    for (let i = 0; i < squares.length; i++) {
      squares[i] = Math.random() * maxOpacity
    }

    let lastTime = 0
    let animationFrameId: number

    const animate = (time: number) => {
      const deltaTime = (time - lastTime) / 1000

      lastTime = time
      if (deltaTime > 0.12 && slowFrameCount < 3) {
        slowFrameCount += 1
        // #region agent log
        fetch('http://localhost:7433/ingest/2b9349a0-c0a1-4e81-9aa0-918008adcca8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c66fb0'},body:JSON.stringify({sessionId:'c66fb0',runId:'slow-homepage-1',hypothesisId:'H2',location:'section-header.tsx:animate',message:'slow_frame_detected',data:{id:id??null,deltaMs:Math.round(deltaTime*1000),slowFrameCount},timestamp:Date.now()})}).catch(()=>{})
        // #endregion
      }

      // Update squares
      for (let i = 0; i < squares.length; i++) {
        if (Math.random() < flickerChance * deltaTime) {
          squares[i] = Math.random() * maxOpacity
        }
      }

      // Draw grid
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Check theme on each frame to handle dynamic theme switching
      const isDark = document.documentElement.classList.contains('dark')

      // Light mode: rgb(0, 0, 0) for black
      // Dark mode: rgb(138, 143, 149) for muted color
      const [r, g, b] = isDark ? [255, 255, 255] : [0, 0, 0]

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const opacity = squares[i * rows + j]

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`
          ctx.fillRect(
            i * (squareSize + gridGap) * dpr,
            j * (squareSize + gridGap) * dpr,
            squareSize * dpr,
            squareSize * dpr
          )
        }
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <>
      <Separator />
      <div className={cn('relative z-1 overflow-hidden pt-8 pb-5 text-center', className)} id={id}>
        <canvas ref={canvasRef} className='pointer-events-none absolute inset-0 -z-2 opacity-40' />
        <div className='to-background absolute bottom-0 -z-1 h-full w-full bg-linear-to-b from-transparent'></div>
        <div className='space-y-4'>
          <h2 className={cn('text-xl font-medium tracking-wider uppercase', titleClassName)}>{title}</h2>
          <p className={cn('text-muted-foreground text-base', descriptionClassName)}>{description}</p>
        </div>
      </div>
      <Separator />
    </>
  )
}

export default SectionHeader
