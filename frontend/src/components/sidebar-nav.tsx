"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { useSidebar } from "@/components/sidebar-context";
import {
  LayoutDashboard,
  Rocket,
  PlusSquare,
  Microscope,
  Briefcase,
  Settings,
  User,
  LogOut,
  ChevronDown,
  PanelLeft,
  ChevronRight,
  Cpu
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navSections = [
  {
    title: "Main",
    items: [
      { href: "/dashboard/overview", label: "Dashboard", icon: LayoutDashboard },
    ]
  },
  {
    title: "Analysis",
    items: [
      { href: "/dashboard/runs", label: "Pipeline", icon: Rocket },
      { href: "/dashboard/terminal", label: "AI Terminal", icon: Cpu },
      { href: "/dashboard/articles", label: "Intelligence", icon: PlusSquare },
      { href: "/dashboard/research", label: "Reports", icon: Microscope },
    ]
  },
  {
    title: "Intelligence",
    items: [
      { href: "/dashboard/portfolio", label: "Optimizer", icon: Briefcase },
    ]
  },
  {
    title: "Sys",
    items: [
      { href: "/dashboard/settings", label: "Config", icon: Settings },
    ]
  }
];

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [email, setEmail] = useState<string>("admin@example.com");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchUser = async () => {
      const client = getSupabaseClient();
      if (client) {
        const { data: { user } } = await client.auth.getUser();
        if (user?.email) setEmail(user.email);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    const client = getSupabaseClient();
    if (client) {
      await client.auth.signOut();
    }
    document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/");
  };

  if (!mounted) return null;

  return (
    <nav 
      className={`flex flex-col h-screen bg-sidebar-background border-r border-sidebar-border h-[100vh] py-6 selection:bg-primary/20 
      transition-all duration-300 ease-in-out shrink-0 relative z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]
      ${isCollapsed ? "w-[64px]" : "w-[230px]"}`}
    >
      {/* Precision Header */}
      <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} mb-8 h-7 px-4 overflow-hidden`}>
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 font-black text-foreground shrink-0 transition-opacity">
             <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg text-[9px] shadow-primary/20">
                SF
             </div>
             <span className="tracking-tighter text-sm whitespace-nowrap uppercase font-black tracking-[0.05em]">Smart Finance</span>
          </Link>
        )}
        
        <button 
          onClick={toggleSidebar}
          className={`shrink-0 h-7 w-7 flex items-center justify-center rounded-lg bg-sidebar-accent hover:bg-white/10 transition-all duration-300 text-sidebar-foreground/80 hover:text-sidebar-foreground active:scale-90 ${isCollapsed ? "mt-0" : ""}`}
        >
           <PanelLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tighter Navigation List */}
      <div className="flex-1 space-y-4.5 px-2 overflow-x-hidden overflow-y-auto no-scrollbar">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1.5 min-w-0">
            {!isCollapsed && (
              <h3 className="px-3 text-[9px] font-black uppercase tracking-[0.2em] text-sidebar-foreground/30 mb-2 truncate">
                {section.title}
              </h3>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.label : ""}
                    className={`flex items-center gap-3 px-3 py-2 text-xs font-black rounded-lg transition-all duration-300 group relative ${
                      isActive
                        ? "bg-primary text-white shadow-xl shadow-primary/10"
                        : "text-sidebar-foreground/50 hover:bg-white/50 hover:text-primary"
                    } ${isCollapsed ? "justify-center px-0" : ""}`}
                  >
                    <item.icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-white" : "group-hover:text-primary font-bold"}`} />
                    {!isCollapsed && <span className="truncate whitespace-nowrap tracking-tight uppercase tracking-widest text-[9.5px]">{item.label}</span>}
                    {!isCollapsed && isActive && (
                       <div className="absolute right-2 w-1 h-3 rounded-full bg-white/40 animate-in slide-in-from-left-2 duration-700" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Compact User Profile */}
      <div className={`mt-auto pt-4 px-2 border-t border-sidebar-border overflow-hidden`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={`w-full flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-left overflow-hidden ${isCollapsed ? "justify-center p-2" : ""}`}>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-sidebar-background shrink-0">
                {email?.[0].toUpperCase() || "A"}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-black text-sidebar-foreground truncate tracking-tight uppercase">
                      {email.split('@')[0]}
                    </p>
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/20 font-black uppercase text-sidebar-foreground/90 tracking-tighter">
                      ADM
                    </span>
                  </div>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isCollapsed ? "start" : "end"} side={isCollapsed ? "right" : "bottom"} className="w-56 rounded-2xl p-2 bg-white border border-border shadow-2xl ml-3 mb-2">
            <DropdownMenuLabel className="px-3 py-1.5 text-foreground">
               <div className="flex flex-col space-y-0.5">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Workspace</p>
                  <p className="text-sm font-black text-foreground truncate">{email.split('@')[0]}</p>
                  <p className="text-[10px] text-muted-foreground truncate font-medium">{email}</p>
               </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/30 my-1.5" />
            <DropdownMenuItem className="rounded-xl px-2.5 py-2 cursor-pointer focus:bg-primary/5 group">
               <User className="w-3.5 h-3.5 mr-2.5 text-primary/70 group-hover:text-primary transition-colors" />
               <span className="text-xs font-black text-foreground/80 group-hover:text-foreground">Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl px-2.5 py-2 cursor-pointer focus:bg-primary/5 group">
               <Settings className="w-3.5 h-3.5 mr-2.5 text-primary/70 group-hover:text-primary transition-colors" />
               <span className="text-xs font-black text-foreground/80 group-hover:text-foreground">Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/30 my-1.5" />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="rounded-xl px-2.5 py-2 cursor-pointer focus:bg-destructive/10 text-destructive focus:text-destructive active:scale-95 group"
            >
               <LogOut className="w-3.5 h-3.5 mr-2.5" />
               <span className="text-xs font-black">Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
