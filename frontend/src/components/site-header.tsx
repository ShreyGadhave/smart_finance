"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type SiteHeaderProps = {
  showAuthCtas?: boolean;
  onLoginClick?: () => void;
  onSignupClick?: () => void;
};

export function SiteHeader({ 
  showAuthCtas = true, 
  onLoginClick, 
  onSignupClick 
}: SiteHeaderProps) {
  return (
    <header className="border-b border-border/50 backdrop-blur-md bg-background/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-all duration-300">
              <span className="text-white font-bold text-sm tracking-tighter">SF</span>
            </div>
            <span className="text-lg font-black text-foreground tracking-tighter uppercase tracking-[0.05em]">Smart Finance</span>
          </Link>
          
          {showAuthCtas && (
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={onLoginClick}
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors h-10 px-6 cursor-pointer"
              >
                Sign In
              </Button>
              <Button 
                onClick={onSignupClick}
                className="bg-primary hover:opacity-90 text-white border-0 rounded-xl px-6 h-10 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95 cursor-pointer"
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
