"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Loader2, ArrowRight, ShieldCheck, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { getSupabaseClient } from "@/lib/supabase";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Authorization keys do not match");
      setLoading(false);
      return;
    }

    const client = getSupabaseClient();
    if (!client) {
      setError("Supabase client not configured");
      setLoading(false);
      return;
    }

    try {
      const { data, error: signupError } = await client.auth.signUp({
        email,
        password,
      });

      if (signupError) {
        setError(signupError.message);
      } else if (data.user) {
        // Prepare profile sequence
        const { error: profileError } = await client
          .from("profiles")
          .insert({
            id: data.user.id,
            email: email,
            created_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error("Profile initialization failed:", profileError.message);
        }

        setMessage("Link Sent: Verify institutional email to establish node.");
        setTimeout(() => router.push("/login"), 4000);
      }
    } catch {
      setError("Initialization sequence failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* 🌌 Animated Background Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.3, 0.2], x: [0, -30, 0], y: [0, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-[15%] w-96 h-96 rounded-full bg-accent/10 blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.4, 0.3], x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-[15%] w-80 h-80 rounded-full bg-primary/10 blur-[100px]" 
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md px-6 relative z-10"
      >
        <Card className="glass-card rounded-[2.5rem] p-10 border-white/60 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[40px] pointer-events-none rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="text-center mb-10">
            <Link href="/" className="inline-block p-1 hover:scale-105 transition-transform mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/10">
                <span className="text-xl font-black tracking-tighter">SF</span>
              </div>
            </Link>
            <h1 className="text-3xl font-black text-foreground tracking-tighter">Initiate Node</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-2">Establish Institutional Credentials</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-4">
               <div>
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 block mb-2">Institutional Email</label>
                  <Input
                    type="email"
                    placeholder="analyst@workstation.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 bg-white/40 border-border/10 focus:ring-primary rounded-xl text-xs font-bold"
                  />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 block mb-2">Access Key</label>
                    <Input
                      type="password"
                      placeholder="Min 6 chars"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-12 bg-white/40 border-border/10 focus:ring-primary rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 block mb-2">Verify Key</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-12 bg-white/40 border-border/10 focus:ring-primary rounded-xl text-xs font-bold"
                    />
                  </div>
               </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[9px] text-destructive bg-destructive/5 border border-destructive/10 rounded-xl px-4 py-2.5 font-bold uppercase tracking-widest">
                Signal Error: {error}
              </motion.div>
            )}

            {message && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[9px] text-primary bg-primary/5 border border-primary/10 rounded-xl px-4 py-2.5 font-bold uppercase tracking-widest flex items-center gap-3">
                <MailCheck className="w-3.5 h-3.5" /> {message}
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
                  Initiating...
                </>
              ) : (
                <>
                  Establish Access <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-10 pt-10 border-t border-border/5 flex flex-col items-center gap-4">
             <div className="flex items-center gap-3 opacity-30">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[9px] font-black uppercase tracking-widest italic">Node Encryption Active</span>
             </div>
             <p className="text-center text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none">
              Already credentialed?{" "}
              <Link href="/login" className="text-primary hover:underline transition-all font-bold">Access Terminal</Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}