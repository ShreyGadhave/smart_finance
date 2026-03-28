"use client";
import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2, Maximize2, Minimize2, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSupabaseClient } from "@/lib/supabase";
import { useParams } from "next/navigation";

export function TerminalChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const runId = params?.id; // Context for specific run if on detail page

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const client = getSupabaseClient();
      const session = client ? await client.auth.getSession() : null;
      const token = session?.data?.session?.access_token;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          message: input,
          run_id: runId ? parseInt(runId as string) : null
        })
      });

      const data = await res.json();
      const aiMsg = { role: "ai", text: data.response || "No response." };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "error", text: "Connection to local LLM failed." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex flex-col items-end gap-4 transition-all duration-500`}>
      {/* Chat Window */}
      {isOpen && (
        <Card 
          className={`glass-card overflow-hidden shadow-2xl border-primary/20 flex flex-col animate-in slide-in-from-bottom-5 duration-300
          ${isExpanded ? "w-[600px] h-[600px]" : "w-[380px] h-[500px]"}`}
        >
          {/* Header */}
          <div className="bg-primary p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                 <Bot className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-xs font-black uppercase tracking-widest leading-none">AI Workstation</p>
                 <p className="text-[9px] font-bold opacity-60 uppercase tracking-tighter mt-1">Ollama Engine Active</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
               <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 hover:bg-white/10 rounded-lg">
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
               </button>
               <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg">
                  <X className="w-4 h-4" />
               </button>
            </div>
          </div>

          {/* Messages Container */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-card/10">
            {messages.length === 0 && (
               <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 grayscale opacity-40">
                  <Sparkles className="w-10 h-10 text-primary" />
                  <p className="text-sm font-black uppercase tracking-widest text-foreground">Initiate Technical Analysis</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">Ask about technical metrics, fundamentals, or portfolio risk factors for this workstation.</p>
               </div>
            )}
            
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
                <div className={`max-w-[85%] rounded-[1.25rem] p-3.5 space-y-2 ${
                  m.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : m.role === 'error'
                    ? 'bg-destructive/10 text-destructive border border-destructive/20 text-xs'
                    : 'bg-white border border-border rounded-tl-none text-foreground'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {m.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                      {m.role === 'user' ? 'Client' : 'Analyst'}
                    </span>
                  </div>
                  <p className="text-xs font-bold leading-relaxed whitespace-pre-wrap">{m.text}</p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-white border border-border p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                   <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Synthesizing Data...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border/10 bg-white/50 backdrop-blur-md">
            <div className="relative group">
               <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Query Technical Cycle..."
                  className="w-full bg-background border-border/40 rounded-xl px-4 py-3 text-xs font-bold focus:ring-primary/20 transition-all outline-none"
               />
               <button 
                onClick={handleSend}
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-accent transition-all disabled:opacity-50"
               >
                  <Send className="w-3.5 h-3.5" />
               </button>
            </div>
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-3 text-center">
               <AlertCircle className="w-2.5 h-2.5 inline mr-1" /> Verified Financial Context Enabled
            </p>
          </div>
        </Card>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl bg-primary text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all group relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!isOpen && (
           <span className="absolute top-0 right-0 w-3 h-3 bg-accent rounded-full border-2 border-white" />
        )}
      </button>
    </div>
  );
}
