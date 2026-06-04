"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"


export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) throw new Error("useSidebar must be used within SidebarProvider")
  return context
}

const SidebarContext = React.createContext<{
  open: boolean
  setOpen: (value: boolean) => void
}>({
  open: false,
  setOpen: () => { },
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(() => {
    if (typeof window === "undefined") return true
    return window.innerWidth >= 1024
  })

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)")
    const handleChange = (event: MediaQueryListEvent) => {
      setOpen(event.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      <div className="flex min-h-screen w-full">
        <main className="flex-1 min-w-0 transition-all duration-300">
          {children}
        </main>
      </div>
    </SidebarContext.Provider>
  )
}

export function Sidebar({
  children,
  className,
  collapsible,
}: {
  children: React.ReactNode
  className?: string
  collapsible?: "icon" | "none"
}) {
  const { open, setOpen } = useSidebar()
  return (
    <>
      <div
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[1px] transition-opacity duration-300 lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r bg-white transition-all duration-300 ease-in-out lg:static lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        {children}
      </aside>
    </>
  )
}

export function SidebarTrigger() {
  const { open, setOpen } = useSidebar()
  return (
    <button
      onClick={() => setOpen(!open)}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 lg:h-11 lg:w-11"
      aria-label={open ? "Thu gọn thanh điều hướng" : "Mở thanh điều hướng"}
    >
      ☰
    </button>
  )
}

export function SidebarContent({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {children}
    </div>
  )
}

export function SidebarGroup({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn("mt-4 space-y-2", className)}>{children}</div>
}

export function SidebarGroupLabel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "px-2 text-xs font-semibold uppercase text-gray-500",
        className
      )}
    >
      {children}
    </div>
  )
}


export function SidebarGroupContent({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1">{children}</div>
}

export function SidebarMenu({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <ul className={cn("space-y-1", className)}>{children}</ul>
}

export function SidebarMenuItem({ children }: { children: React.ReactNode }) {
  return <li>{children}</li>
}
export function SidebarMenuButton({
  children,
  onClick,
  active,
  asChild = false,
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  active?: boolean
  asChild?: boolean
  className?: string
}) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        asChild
          ? "bg-transparent text-inherit hover:bg-transparent focus:bg-transparent"
          : active
            ? "bg-blue-100 text-blue-700"
            : "text-gray-700 hover:bg-gray-100 focus:bg-gray-100",
        className
      )}
    >
      {children}
    </Comp>
  )
}
