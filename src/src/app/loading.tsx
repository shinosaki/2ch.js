import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export default function Loading({
  show = false,
  text = 'Now loading...',
  Icon = Loader2,
}) {
  return (
    <div className={cn(show ? 'flex' : 'hidden', 'absolute z-10 flex-col justify-center items-center w-full h-screen bg-primary/70 text-secondary')}>
      <div className="animate-pulse">
        <Icon size={64} className="animate-[spin_2s_ease-in-out_infinite]" />
      </div>
      <p>{text}</p>
    </div>
  )
}