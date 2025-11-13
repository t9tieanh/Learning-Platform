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
  const [open, setOpen] = React.useState(true)

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 transition-all duration-300">
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
  const { open } = useSidebar()
  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r bg-white transition-all duration-300 ease-in-out",
        className
      )}
    >
      {children}
    </aside>
  )
}

export function SidebarTrigger() {
  const { open, setOpen } = useSidebar()
  return (
    <button
      onClick={() => setOpen(!open)}
      className="m-2 rounded-lg border p-2 hover:bg-gray-100"
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

export function SidebarGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 space-y-2">{children}</div>
  )
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

export function SidebarMenu({ children }: { children: React.ReactNode }) {
  return <ul className="space-y-1">{children}</ul>
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
        active
          ? "bg-blue-100 text-blue-700"
          : "text-gray-700 hover:bg-gray-100 focus:bg-gray-100",
        className
      )}
    >
      {children}
    </Comp>
  )
}