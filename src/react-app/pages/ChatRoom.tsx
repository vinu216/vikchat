import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Send, SkipForward, X, MessageCircle, Loader2, ArrowLeft, Users, Eye } from "lucide-react";
import { useChat, type ChatMode } from "@/react-app/hooks/useChat";

export default function ChatRoom() {
  const [params] = useSearchParams();
  const mode = (params.get("mode") || "text") as ChatMode;
  const question = params.get("question") || "";
  // Memoize so array reference is stable across renders — avoids stale useCallback deps
  const interests = useMemo(
    () => params.get("interests")?.split(",").filter(Boolean) ?? [],
    [params]
  );

  const { status, messages, onlineCount, strangerTyping, commonInterests, isSpyMode, spyQ, startSearching, sendMessage, sendTyping, disconnect, skipToNext } = useChat(mode, interests, question);

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, strangerTyping]);
  useEffect(() => { if (status === "connected" && !isSpyMode) inputRef.current?.focus(); }, [status, isSpyMode]);

  const handleSend = () => {
    if (!input.trim() || status !== "connected" || isSpyMode) return;
    sendMessage(input.trim());
    setInput("");
    sendTyping(false);
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    if (val) {
      sendTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => sendTyping(false), 2500);
    } else {
      sendTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const modeLabel = isSpyMode ? "Spy Mode" : mode === "video" ? "Video" : "Text Chat";
  const modeIcon = isSpyMode ? Eye : mode === "video" ? Mic : MessageCircle;
  const ModeIcon = modeIcon;

  return (
    <div className="min-h-screen flex flex-col" style={{background:"#080810"}}>

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 flex-shrink-0" style={{background:"rgba(8,8,16,0.95)",backdropFilter:"blur(24px)",borderBottom:"1px solid rgba(201,168,76,0.1)"}}>
        <div className="max-w-4xl mx-auto px-4 h-15 flex items-center justify-between py-3.5">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 transition-colors"
              style={{color:"rgba(240,235,224,0.4)"}}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color="#C9A84C"}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color="rgba(240,235,224,0.4)"}>
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm hidden sm:inline" style={{fontFamily:"'DM Sans',sans-serif"}}>Home</span>
            </Link>
            <div className="w-px h-4" style={{background:"rgba(201,168,76,0.15)"}} />
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:"linear-gradient(135deg,#C9A84C,#E8C97A)"}}>
                <ModeIcon className="w-3.5 h-3.5" style={{color:"#080810"}} />
              </div>
              <span className="font-display font-semibold text-lg" style={{color:"#F0EBE0"}}>
                Vik<span className="text-gradient">Chat</span>
              </span>
            </Link>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{background:"rgba(201,168,76,0.06)",border:"1px solid rgba(201,168,76,0.12)"}}>
              <ModeIcon className="w-3 h-3" style={{color:"#C9A84C"}} />
              <span className="text-xs font-medium" style={{color:"rgba(201,168,76,0.7)",fontFamily:"'DM Sans',sans-serif"}}>{modeLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {status === "connected" && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.15)"}}>
                <span className="w-1.5 h-1.5 rounded-full" style={{background:"#4ade80",boxShadow:"0 0 6px #4ade80"}} />
                <span className="text-xs font-medium" style={{color:"#4ade80",fontFamily:"'DM Sans',sans-serif"}}>Connected</span>
              </div>
            )}
            {status === "searching" && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{background:"rgba(234,179,8,0.08)",border:"1px solid rgba(234,179,8,0.15)"}}>
                <Loader2 className="w-3 h-3 animate-spin" style={{color:"#facc15"}} />
                <span className="text-xs font-medium" style={{color:"#facc15",fontFamily:"'DM Sans',sans-serif"}}>Searching...</span>
              </div>
            )}
            <div className="flex items-center gap-1.5" style={{color:"rgba(240,235,224,0.3)"}}>
              <Users className="w-3.5 h-3.5" />
              <span className="text-xs" style={{fontFamily:"'DM Sans',sans-serif"}}>{onlineCount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Common interests bar */}
        {status === "connected" && commonInterests.length > 0 && (
          <div className="max-w-4xl mx-auto px-4 pb-2.5 flex items-center gap-2">
            <span className="text-xs" style={{color:"rgba(201,168,76,0.5)",fontFamily:"'DM Sans',sans-serif"}}>Common:</span>
            {commonInterests.map(t => <span key={t} className="tag-pill" style={{fontSize:"11px",padding:"2px 10px"}}>{t}</span>)}
          </div>
        )}

        {/* Spy question */}
        {status === "connected" && isSpyMode && spyQ && (
          <div className="max-w-4xl mx-auto px-4 pb-3">
            <div className="flex items-start gap-2 px-4 py-2.5 rounded-xl" style={{background:"rgba(201,168,76,0.07)",border:"1px solid rgba(201,168,76,0.15)"}}>
              <Eye className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{color:"#C9A84C"}} />
              <span className="text-xs italic" style={{color:"rgba(201,168,76,0.8)",fontFamily:"'DM Sans',sans-serif"}}>"{spyQ}"</span>
            </div>
          </div>
        )}
      </header>

      {/* ── Messages ── */}
      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto">
        <div className="flex-1 overflow-y-auto px-4 py-6">

          {status === "idle" && <IdleState onStart={() => startSearching()} mode={mode} onlineCount={onlineCount} isSpyMode={isSpyMode} />}
          {status === "searching" && <SearchingState />}

          {(status === "connected" || status === "disconnected") && (
            <div className="space-y-1">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
              {strangerTyping && (
                <div className="flex justify-start pt-1">
                  <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl" style={{background:"rgba(255,255,255,0.05)",borderRadius:"18px 18px 18px 4px"}}>
                    <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ── Input ── */}
        <div className="flex-shrink-0 p-4" style={{background:"rgba(8,8,16,0.8)",borderTop:"1px solid rgba(201,168,76,0.08)"}}>
          <div className="max-w-4xl mx-auto">
            {status === "connected" && !isSpyMode && (
              <div className="flex gap-2.5">
                <button onClick={disconnect} title="Disconnect"
                  className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
                  style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",color:"rgba(239,68,68,0.7)"}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="rgba(239,68,68,0.15)";(e.currentTarget as HTMLElement).style.color="#ef4444"}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="rgba(239,68,68,0.08)";(e.currentTarget as HTMLElement).style.color="rgba(239,68,68,0.7)"}}>
                  <X className="w-4 h-4" />
                </button>

                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="input-luxury w-full px-4 pr-12 py-2.5 rounded-xl text-sm h-10"
                    style={{fontFamily:"'DM Sans',sans-serif"}}
                  />
                  <button onClick={handleSend} disabled={!input.trim()}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200"
                    style={{background: input.trim() ? "linear-gradient(135deg,#C9A84C,#E8C97A)" : "rgba(255,255,255,0.05)", color: input.trim() ? "#080810" : "rgba(255,255,255,0.2)"}}>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button onClick={skipToNext}
                  className="flex-shrink-0 flex items-center gap-1.5 px-4 h-10 rounded-xl transition-all duration-200 text-sm font-medium"
                  style={{background:"rgba(201,168,76,0.08)",border:"1px solid rgba(201,168,76,0.2)",color:"#C9A84C",fontFamily:"'DM Sans',sans-serif"}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="rgba(201,168,76,0.15)"}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="rgba(201,168,76,0.08)"}}>
                  <SkipForward className="w-4 h-4" />
                  <span className="hidden sm:inline">Next</span>
                </button>
              </div>
            )}

            {status === "connected" && isSpyMode && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm" style={{color:"rgba(201,168,76,0.6)",fontFamily:"'DM Sans',sans-serif"}}>
                  <Eye className="w-4 h-4" />
                  Observing silently — you cannot send messages
                </div>
                <button onClick={disconnect}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-all duration-200"
                  style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",color:"rgba(239,68,68,0.7)",fontFamily:"'DM Sans',sans-serif"}}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background="rgba(239,68,68,0.15)"}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background="rgba(239,68,68,0.08)"}>
                  <X className="w-3.5 h-3.5" /> Leave
                </button>
              </div>
            )}

            {status === "disconnected" && (
              <div className="flex justify-center gap-3">
                <button onClick={() => startSearching()} className="btn-luxury px-6 py-2.5 rounded-xl text-sm flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" /> New Chat
                </button>
                <Link to="/">
                  <button className="btn-outline-luxury px-6 py-2.5 rounded-xl text-sm">Home</button>
                </Link>
              </div>
            )}

            {(status === "idle" || status === "searching") && (
              <p className="text-center text-xs" style={{color:"rgba(240,235,224,0.2)",fontFamily:"'DM Sans',sans-serif"}}>
                {status === "searching" ? "Finding someone to connect with..." : "Press the button above to begin."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function MessageBubble({ msg }: { msg: { id: string; content: string; sender: "me"|"stranger"|"system"; timestamp: Date } }) {
  if (msg.sender === "system") {
    return (
      <div className="flex justify-center my-3">
        <span className="text-xs px-4 py-1.5 rounded-full" style={{background:"rgba(201,168,76,0.07)",color:"rgba(201,168,76,0.55)",fontFamily:"'DM Sans',sans-serif",border:"1px solid rgba(201,168,76,0.1)"}}>
          {msg.content}
        </span>
      </div>
    );
  }
  const isMe = msg.sender === "me";
  return (
    <div className={`flex msg-enter ${isMe ? "justify-end" : "justify-start"} mb-1`}>
      <div className="max-w-[78%] sm:max-w-[65%] px-4 py-2.5 text-sm break-words"
        style={{
          background: isMe ? "linear-gradient(135deg,#C9A84C,#E8C97A)" : "rgba(255,255,255,0.06)",
          color: isMe ? "#080810" : "rgba(240,235,224,0.85)",
          borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          fontFamily:"'DM Sans',sans-serif",
          boxShadow: isMe ? "0 4px 12px rgba(201,168,76,0.15)" : "none",
        }}>
        {msg.content}
      </div>
    </div>
  );
}

function IdleState({ onStart, mode, onlineCount, isSpyMode }: { onStart: () => void; mode: ChatMode; onlineCount: number; isSpyMode: boolean }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-4 py-20">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{background:"linear-gradient(135deg,#C9A84C,#E8C97A)",boxShadow:"0 0 40px rgba(201,168,76,0.25)"}}>
        {isSpyMode ? <Eye className="w-8 h-8" style={{color:"#080810"}} /> : <MessageCircle className="w-8 h-8" style={{color:"#080810"}} />}
      </div>
      <h2 className="font-display text-3xl font-light mb-3" style={{color:"#F0EBE0"}}>
        {isSpyMode ? "Enter Spy Mode" : "Ready to connect?"}
      </h2>
      <p className="text-sm mb-8 max-w-sm" style={{color:"rgba(240,235,224,0.35)",fontFamily:"'DM Sans',sans-serif",fontWeight:300}}>
        {isSpyMode
          ? "You'll silently observe two strangers answer your question."
          : "Click below to be matched with a random stranger from anywhere in the world."}
      </p>
      <button onClick={onStart} className="btn-luxury px-10 py-3.5 rounded-xl text-base font-semibold">
        {isSpyMode ? "Start Observing" : "Start Chatting"}
      </button>
      <div className="mt-8 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full" style={{background:"#4ade80",boxShadow:"0 0 6px #4ade80"}} />
        <span className="text-xs" style={{color:"rgba(240,235,224,0.25)",fontFamily:"'DM Sans',sans-serif"}}>
          {onlineCount.toLocaleString()} online now
        </span>
      </div>
    </div>
  );
}

function SearchingState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-4 py-20">
      <div className="relative mb-8">
        <div className="w-16 h-16 rounded-full border-2 animate-spin" style={{borderColor:"rgba(201,168,76,0.15)",borderTopColor:"#C9A84C"}} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Users className="w-6 h-6" style={{color:"#C9A84C"}} />
        </div>
      </div>
      <h2 className="font-display text-2xl font-light mb-2" style={{color:"#F0EBE0"}}>Finding someone...</h2>
      <p className="text-sm" style={{color:"rgba(240,235,224,0.25)",fontFamily:"'DM Sans',sans-serif"}}>Matching by your interests</p>
    </div>
  );
}
