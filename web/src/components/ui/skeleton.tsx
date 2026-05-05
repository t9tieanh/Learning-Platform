import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='skeleton'
      className={cn(
        'animate-pulse rounded-md bg-neutral-200/60 dark:bg-neutral-700/45',
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
