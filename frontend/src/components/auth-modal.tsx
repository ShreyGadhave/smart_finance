"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Fingerprint,
  Zap,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const client = getSupabaseClient();
    if (!client) {
      setError("Supabase not configured");
      setLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        const { data, error: loginError } = await client.auth.signInWithPassword({ email, password });
        if (loginError) throw loginError;
        
        // Set cookie so middleware sees us
        const session = data?.session;
        if (session) {
           document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${session.expires_in}; SameSite=Lax`;
        }

        router.push("/dashboard/overview");
      } else {
        const { error: signUpError } = await client.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (signUpError) throw signUpError;
        setError("Success! Check your email for verification.");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      if (!error.includes("Success")) setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/60 backdrop-blur-xl" 
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/40 shadow-[0_64px_128px_-32px_rgba(79,70,229,0.25)] backdrop-blur-3xl p-1"
          >
            <div className="bg-white/40 rounded-[2.4rem] p-8 md:p-10 border border-white relative overflow-hidden">
              
              {/* Close Button */}
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-xl bg-white/40 border border-white/60 hover:bg-white transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* Header */}
              <div className="mb-10 text-center">
                 <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20">
                    <Fingerprint className="w-8 h-8 text-white" />
                 </div>
                 <h2 className="text-3xl font-black tracking-tighter uppercase mb-2">
                   {mode === 'login' ? 'Institutional Hub' : 'Establish Protocol'}
                 </h2>
                 <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">
                   {mode === 'login' ? 'Terminal Access Gateway' : 'New Node Registration'}
                 </p>
              </div>

              {/* Form */}
              <form onSubmit={handleAuth} className="space-y-4">
                {mode === 'signup' && (
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 transition-colors group-focus-within:text-primary" />
                    <Input
                      placeholder="Full Name (e.g. Satoshi Nakamoto)"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-14 pl-12 bg-primary/5 border-border/10 rounded-2xl text-[13px] font-bold"
                      required
                    />
                  </div>
                )}

                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 transition-colors group-focus-within:text-primary" />
                  <Input
                    type="email"
                    placeholder="Institutional Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 pl-12 bg-primary/5 border-border/10 rounded-2xl text-[13px] font-bold"
                    required
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 transition-colors group-focus-within:text-primary" />
                  <Input
                    type="password"
                    placeholder="Access Code (Password)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 pl-12 bg-primary/5 border-border/10 rounded-2xl text-[13px] font-bold"
                    required
                  />
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-destructive/5 border border-destructive/10">
                    <p className="text-[10px] font-black text-destructive uppercase tracking-widest text-center">{error}</p>
                  </motion.div>
                )}

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-14 bg-primary text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
                >
                  {loading ? '⚡ Syncing...' : mode === 'login' ? 'Authorize Gateway' : 'Initialize Protocol'}
                </Button>
              </form>

              {/* Footer Switch */}
              <div className="mt-8 text-center">
                 <button 
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-[10px] font-black text-muted-foreground/30 hover:text-primary uppercase tracking-[0.2em] transition-colors"
                 >
                   {mode === 'login' ? "Need a new node? Establish Protocol" : "Existing node detected? Authorize Hub"}
                 </button>
              </div>

              {/* Security Hint */}
              <div className="mt-12 pt-8 border-t border-border/5 flex items-center justify-center gap-6 opacity-20">
                 <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3 h-3" />
                    <span className="text-[8px] font-black uppercase tracking-widest">RSA Encrypted</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Globe className="w-3 h-3" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Global Auth</span>
                 </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
