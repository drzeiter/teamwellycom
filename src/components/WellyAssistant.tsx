import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Bookmark, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import logoSubmark from "@/assets/logo-submark.png";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

type Message = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "welly-chat-history";
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/welly-assistant`;

const SUGGESTED_CHIPS = [
  { label: "Neck reset", icon: "🧘" },
  { label: "Low back reset", icon: "💪" },
  { label: "Desk setup", icon: "🖥️" },
  { label: "Breathing", icon: "🌬️" },
];

function loadHistory(): Message[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveHistory(messages: Message[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)));
  } catch {}
}

export default function WellyAssistant() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(loadHistory);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { saveHistory(messages); }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const streamChat = useCallback(async (allMessages: Message[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: allMessages }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "Request failed" }));
      throw new Error(err.error || `Error ${resp.status}`);
    }
    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantSoFar = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") { streamDone = true; break; }
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantSoFar += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
              }
              return [...prev, { role: "assistant", content: assistantSoFar }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            assistantSoFar += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
              }
              return [...prev, { role: "assistant", content: assistantSoFar }];
            });
          }
        } catch {}
      }
    }
  }, []);

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setIsLoading(true);

    try {
      await streamChat(updated);
    } catch (e: any) {
      toast({ title: "Welly AI", description: e.message || "Something went wrong", variant: "destructive" });
      // Remove failed assistant partial
      setMessages(prev => prev[prev.length - 1]?.role === "assistant" && !prev[prev.length - 1].content
        ? prev.slice(0, -1) : prev);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRoutine = async (assistantMessage: string) => {
    if (!user) return;
    // Extract routine-like content from the message
    const routineData = {
      routine_name: "Welly AI Routine",
      steps: [],
      source_condition: "AI Generated",
      full_text: assistantMessage,
    };

    try {
      const { error } = await supabase.functions.invoke("welly-assistant", {
        body: { action: "save_routine", routineData },
      });
      if (error) throw error;
      toast({ title: "Saved!", description: "Routine saved to your profile" });
    } catch {
      toast({ title: "Error", description: "Could not save routine", variant: "destructive" });
    }
  };

  const handleBookCall = () => {
    toast({ title: "Book a Call", description: "Coaching call booking coming soon!" });
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  if (!user) return null;

  const chatContent = (
    <div className="flex flex-col h-full min-h-0">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8 space-y-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <img src={logoSubmark} alt="Welly" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Hey! I'm Welly AI</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your recovery coach. Tell me what's bothering you and I'll build a plan.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center pt-2">
              {SUGGESTED_CHIPS.map(chip => (
                <button
                  key={chip.label}
                  onClick={() => send(chip.label)}
                  className="px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
                >
                  {chip.icon} {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-muted text-foreground rounded-bl-md"
            }`}>
              {msg.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1 [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-sm [&>h1]:font-bold [&>h2]:font-semibold [&>h3]:font-semibold">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
              {/* Action buttons on assistant messages */}
              {msg.role === "assistant" && msg.content.length > 50 && (
                <div className="flex gap-2 mt-2 pt-2 border-t border-border/50">
                  <button
                    onClick={() => handleSaveRoutine(msg.content)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Bookmark className="w-3 h-3" /> Save Routine
                  </button>
                  <button
                    onClick={handleBookCall}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Phone className="w-3 h-3" /> Book a Call
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested chips (when there are messages) */}
      {messages.length > 0 && !isLoading && (
        <div className="px-4 pb-2">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {SUGGESTED_CHIPS.map(chip => (
              <button
                key={chip.label}
                onClick={() => send(chip.label)}
                className="px-2.5 py-1 rounded-full bg-secondary/60 text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors whitespace-nowrap flex-shrink-0"
              >
                {chip.icon} {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-border bg-background">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send(input)}
            placeholder="Describe what's bothering you..."
            className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isLoading}
          />
          <Button
            size="icon"
            className="rounded-full h-9 w-9 flex-shrink-0"
            onClick={() => send(input)}
            disabled={!input.trim() || isLoading}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} className="text-xs text-muted-foreground hover:text-foreground mt-2 ml-2 transition-colors">
            Clear chat
          </button>
        )}
      </div>
    </div>
  );

  const headerContent = (
      <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        <img src={logoSubmark} alt="Welly" className="w-5 h-5 object-contain" />
      </div>
      <span>Ask Welly AI</span>
    </div>
  );

  return (
    <>
      {/* FAB */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
          aria-label="Open Welly AI Assistant"
        >
          <img src={logoSubmark} alt="Welly" className="w-7 h-7 object-contain brightness-0 invert" />
        </button>
      )}

      {/* Desktop: Sheet / Mobile: Drawer */}
      {isMobile ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="h-[80vh] max-h-[80vh]">
            <DrawerHeader className="pb-2">
              <DrawerTitle>{headerContent}</DrawerTitle>
            </DrawerHeader>
            {chatContent}
          </DrawerContent>
        </Drawer>
      ) : (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="right" className="w-[420px] sm:max-w-[420px] p-0 flex flex-col">
            <SheetHeader className="p-4 pb-2 border-b border-border">
              <SheetTitle>{headerContent}</SheetTitle>
            </SheetHeader>
            {chatContent}
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
