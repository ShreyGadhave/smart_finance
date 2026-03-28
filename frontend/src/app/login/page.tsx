"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Loader2, ArrowRight, ShieldCheck, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { getSupabaseClient } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const client = getSupabaseClient();
    if (!client) {
      setError("Supabase client not configured");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        // Ensure profile exists
        const { error: profileError } = await client
          .from("profiles")
          .upsert({
            id: data.user.id,
            email: email,
            last_login: new Date().toISOString(),
          });

        if (profileError) {
          console.error("Profile sync error:", profileError.message);
        }

        document.cookie = `sb-access-token=${data.session?.access_token}; path=/; max-age=3600; SameSite=Lax`;
        router.push("/dashboard/overview");
      }
    } catch {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* 🌌 Animated Background Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.4, 0.3], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-[20%] w-96 h-96 rounded-full bg-primary/10 blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.3, 0.2], x: [0, -40, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-[20%] w-72 h-72 rounded-full bg-accent/10 blur-[100px]" 
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-6 relative z-10"
      >
        <Card className="glass-card rounded-[2.5rem] p-10 border-white/60 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[40px] pointer-events-none rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="text-center mb-10">
            <Link href="/" className="inline-block p-1 hover:scale-105 transition-transform mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
                <span className="text-xl font-black tracking-tighter">SF</span>
              </div>
            </Link>
            <h1 className="text-3xl font-black text-foreground tracking-tighter">Initialize Terminal</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-2">Connecting to Secure Node #0452</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
               <div>
                  <div className="flex items-center justify-between mb-2">
                     <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Institutional ID</label>
                  </div>
                  <Input
                    type="email"
                    placeholder="email@workstation.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 bg-white/40 border-border/10 focus:ring-primary rounded-xl text-xs font-bold"
                  />
               </div>

               <div>
                  <div className="flex items-center justify-between mb-2">
                     <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Access Key</label>
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 bg-white/40 border-border/10 focus:ring-primary rounded-xl text-xs font-bold"
                  />
               </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                className="text-[10px] text-destructive bg-destructive/5 border border-destructive/10 rounded-xl px-4 py-2.5 font-bold uppercase tracking-tight"
              >
                Signal Error: {error}
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-xl shadow-primary/10 transition-all flex gap-3 group active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Establishing Link...
                </>
              ) : (
                <>
                  Launch Workstation <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-10 pt-10 border-t border-border/5 flex flex-col items-center gap-4">
             <div className="flex items-center gap-3 opacity-30">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[9px] font-black uppercase tracking-widest italic">RSA-4096 Encrypted</span>
             </div>
             <p className="text-center text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none">
              Unauthorized Access Prohibited.{" "}
              <Link href="/signup" className="text-primary hover:underline transition-all">Establish Account</Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}