"use client";
import { SidebarNav } from "@/components/sidebar-nav";
import { usePathname } from "next/navigation";
import { ChevronRight, Bell, Search } from "lucide-react";
import Link from "next/link";
import { SidebarProvider } from "@/components/sidebar-context";
import { Input } from "@/components/ui/input";
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Breadcrumb logic
  const paths = pathname.split('/').filter(p => p !== '');
  const breadcrumbs = paths.map((p, i) => ({
    label: p.charAt(0).toUpperCase() + p.slice(1),
    href: '/' + paths.slice(0, i + 1).join('/')
  }));

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden text-foreground">
        <SidebarNav />
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Tighter Top Navigation Bar */}
          <header className="h-12 flex items-center justify-between px-6 border-b border-border/10 bg-background/40 backdrop-blur-2xl z-40 sticky top-0 shrink-0 select-none">
            <nav className="flex items-center gap-2 overflow-hidden">
               <Link 
                href="/dashboard/overview" 
                className="text-[10px] font-black text-primary/70 hover:text-primary transition-all uppercase tracking-[0.2em]"
               >
                  Workstation
               </Link>
               {breadcrumbs.length > 1 && breadcrumbs.slice(1).map((crumb, i) => (
                  <div key={crumb.href} className="flex items-center gap-2 shrink-0 animate-in slide-in-from-left-1 duration-300">
                    <ChevronRight className="w-2.5 h-2.5 text-primary/30" />
                    <Link 
                      href={crumb.href}
                      className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                        i === breadcrumbs.length - 2 
                          ? "text-primary bg-primary/10 px-2 py-0.5 rounded-lg" 
                          : "text-primary/70 hover:text-primary"
                      } truncate max-w-[100px]`}
                    >
                      {crumb.label}
                    </Link>
                  </div>
               ))}
            </nav>

            <div className="flex items-center gap-4">
               <div className="relative hidden md:block group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary/30 group-hover:text-primary transition-colors" />
                  <Input 
                    placeholder="Fast Search..." 
                    className="pl-9 h-8 w-48 text-[11px] bg-primary/5 border-primary/20 rounded-xl focus:ring-primary/40 focus:w-64 transition-all font-bold"
                   />
               </div>
               <button className="relative p-1.5 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors">
                  <Bell className="w-4 h-4 text-primary/70" />
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-accent ring-1 ring-background" />
               </button>
            </div>
          </header>

          {/* Performance Optimized Main Area */}
          <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
            <div className="max-w-[1400px] mx-auto p-5 animate-in fade-in slide-in-from-top-1 duration-500">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
