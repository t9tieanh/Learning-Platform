import { useEffect, useRef } from 'react'

interface CelebrationFireworksProps {
  active: boolean
}

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
  gravity: number
  type: 'rocket' | 'spark' | 'confetti'
  rotation?: number
  rotationSpeed?: number
  width?: number
  height?: number
}

const COLORS = ['#3b82f6', '#6366f1', '#818cf8', '#fbbf24', '#34d399', '#f472b6', '#ffffff', '#93c5fd']

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)]
}

function spawnBurst(particles: Particle[], x: number, y: number, count = 36) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3
    const speed = 2 + Math.random() * 4.5
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: 55 + Math.random() * 35,
      color: randomColor(),
      size: 2 + Math.random() * 2.5,
      gravity: 0.04 + Math.random() * 0.02,
      type: 'spark'
    })
  }
}

function spawnConfetti(particles: Particle[], w: number) {
  particles.push({
    x: Math.random() * w,
    y: -10,
    vx: (Math.random() - 0.5) * 2,
    vy: 2 + Math.random() * 3,
    life: 0,
    maxLife: 120 + Math.random() * 80,
    color: randomColor(),
    size: 4,
    gravity: 0.06,
    type: 'confetti',
    rotation: Math.random() * Math.PI,
    rotationSpeed: (Math.random() - 0.5) * 0.2,
    width: 6 + Math.random() * 4,
    height: 3 + Math.random() * 2
  })
}

export default function CelebrationFireworks({ active }: CelebrationFireworksProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!active) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const particles: Particle[] = []
    let frame = 0
    let burstTimer = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // initial big bursts
    const cx = canvas.width / 2
    const cy = canvas.height * 0.35
    spawnBurst(particles, cx * 0.55, cy, 42)
    spawnBurst(particles, cx * 1.35, cy * 0.9, 38)
    spawnBurst(particles, cx, cy * 0.75, 48)

    const tick = () => {
      frame++
      burstTimer++

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (burstTimer % 45 === 0 && burstTimer < 280) {
        const bx = canvas.width * (0.2 + Math.random() * 0.6)
        const by = canvas.height * (0.15 + Math.random() * 0.35)
        spawnBurst(particles, bx, by, 30 + Math.floor(Math.random() * 12))
      }

      if (frame % 4 === 0 && frame < 360) {
        for (let i = 0; i < 3; i++) spawnConfetti(particles, canvas.width)
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.life++
        p.x += p.vx
        p.y += p.vy
        p.vy += p.gravity
        p.vx *= 0.99

        const alpha = 1 - p.life / p.maxLife
        if (alpha <= 0) {
          particles.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.globalAlpha = alpha

        if (p.type === 'confetti' && p.rotation != null && p.width && p.height) {
          p.rotation += p.rotationSpeed ?? 0
          ctx.translate(p.x, p.y)
          ctx.rotate(p.rotation)
          ctx.fillStyle = p.color
          ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height)
        } else {
          ctx.beginPath()
          ctx.fillStyle = p.color
          ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.restore()
      }

      if (frame < 420 || particles.length > 0) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(rafRef.current)
    }
  }, [active])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      className='pointer-events-none fixed inset-0 z-[250]'
      aria-hidden
    />
  )
}
