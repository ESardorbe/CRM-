import { useState, useRef, useEffect, useCallback } from 'react'
import { RotateCcw, RotateCw, ZoomIn, ZoomOut, X, Check } from 'lucide-react'

interface Props {
  src: string
  onCrop: (base64: string) => void
  onClose: () => void
}

const SIZE = 280

export default function ImageCropModal({ src, onCrop, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const dragging = useRef(false)
  const lastMouse = useRef({ x: 0, y: 0 })

  // Load image
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imgRef.current = img
      setImgLoaded(true)
    }
    img.src = src
  }, [src])

  // Draw canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img) return
    const ctx = canvas.getContext('2d')!

    ctx.clearRect(0, 0, SIZE, SIZE)
    ctx.fillStyle = '#e5e7eb'
    ctx.fillRect(0, 0, SIZE, SIZE)

    const { naturalWidth: w, naturalHeight: h } = img
    const coverScale = Math.max(SIZE / w, SIZE / h)

    ctx.save()
    ctx.translate(SIZE / 2 + pos.x, SIZE / 2 + pos.y)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(scale * coverScale, scale * coverScale)
    ctx.drawImage(img, -w / 2, -h / 2, w, h)
    ctx.restore()
  }, [pos.x, pos.y, rotation, scale, imgLoaded])

  useEffect(() => { draw() }, [draw])

  // Mouse drag
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    dragging.current = true
    lastMouse.current = { x: e.clientX, y: e.clientY }
    e.preventDefault()
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current) return
    const dx = e.clientX - lastMouse.current.x
    const dy = e.clientY - lastMouse.current.y
    setPos((prev) => ({ x: prev.x + dx, y: prev.y + dy }))
    lastMouse.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handleMouseUp = useCallback(() => { dragging.current = false }, [])

  // Touch drag
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    dragging.current = true
    lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!dragging.current) return
    const dx = e.touches[0].clientX - lastMouse.current.x
    const dy = e.touches[0].clientY - lastMouse.current.y
    setPos((prev) => ({ x: prev.x + dx, y: prev.y + dy }))
    lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }, [])

  const handleTouchEnd = useCallback(() => { dragging.current = false }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  const handleCrop = () => {
    const canvas = canvasRef.current!
    onCrop(canvas.toDataURL('image/jpeg', 0.92))
  }

  const btnClass = 'p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-card-dark rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800 dark:text-white text-base">Rasmni tahrirlash</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Canvas crop area */}
        <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
          <canvas
            ref={canvasRef}
            width={SIZE}
            height={SIZE}
            className="rounded-full border-4 border-primary cursor-grab active:cursor-grabbing"
            style={{ display: 'block' }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          />
          {!imgLoaded && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gray-100">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        <p className="text-xs text-center text-gray-400 mt-2">Rasmni sudrab joylashtiring</p>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <button title="90° chapga" onClick={() => setRotation((r) => r - 90)} className={btnClass}>
            <RotateCcw size={18} />
          </button>
          <button title="Kichraytirish" onClick={() => setScale((s) => Math.max(0.3, +(s - 0.15).toFixed(2)))} className={btnClass}>
            <ZoomOut size={18} />
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button title="Kattalashtirish" onClick={() => setScale((s) => Math.min(4, +(s + 0.15).toFixed(2)))} className={btnClass}>
            <ZoomIn size={18} />
          </button>
          <button title="90° o'ngga" onClick={() => setRotation((r) => r + 90)} className={btnClass}>
            <RotateCw size={18} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleCrop}
            className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm"
          >
            <Check size={16} /> Tasdiqlash
          </button>
        </div>
      </div>
    </div>
  )
}
