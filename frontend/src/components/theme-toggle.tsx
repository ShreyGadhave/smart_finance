"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 border border-border/30 animate-pulse bg-muted/20" />
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full w-9 h-9 border border-border/30 bg-background/50 hover:bg-accent transition-all ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-foreground/80 hover:text-foreground" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-foreground/80 hover:text-foreground" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-2xl bg-popover/80 backdrop-blur-md border border-border/50 p-2 min-w-[120px] shadow-2xl animate-in zoom-in-95 duration-200">
        <DropdownMenuItem 
          onClick={() => setTheme("light")} 
          className={`rounded-xl cursor-pointer px-3 py-2 text-xs font-black uppercase tracking-widest mb-1 ${resolvedTheme === 'light' ? 'bg-accent' : ''}`}
        >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")} 
          className={`rounded-xl cursor-pointer px-3 py-2 text-xs font-black uppercase tracking-widest mb-1 ${resolvedTheme === 'dark' ? 'bg-accent' : ''}`}
        >
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")} 
          className="rounded-xl cursor-pointer px-3 py-2 text-xs font-black uppercase tracking-widest"
        >
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function useState(arg0: boolean): [any, any] {
    return React.useState(arg0);
}
