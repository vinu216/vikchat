import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function VikChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Namaste! Main VikChat Assistant hun 👋 Features samjhana ho, chat shuru karni ho, ya koi sawaal ho — main yahan hun! Kya jaanna chahte ho?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const sendMessage = async (text?: string) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");

    const newMessages: Message[] = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Oops! Kuch error aa gaya. Dobara try karo!";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Oops! Kuch error aa gaya. Dobara try karo!" }]);
    } finally {
      setLoading(false);
    }
  };

  const quickBtns = ["VikChat kya hai?", "Chat kaise karu?", "Spy Mode?", "Kya ye free hai?"];

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: "fixed", bottom: "24px", right: "24px",
            width: "56px", height: "56px", borderRadius: "50%",
            background: "linear-gradient(135deg,#C9A84C,#E8C97A)",
            border: "none", cursor: "pointer", zIndex: 9999,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 20px rgba(201,168,76,0.4)",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 2.98.97 4.29L2 22l5.71-.97C9.02 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" fill="#080810"/>
            <circle cx="8" cy="12" r="1.5" fill="#C9A84C"/>
            <circle cx="12" cy="12" r="1.5" fill="#C9A84C"/>
            <circle cx="16" cy="12" r="1.5" fill="#C9A84C"/>
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: "fixed", bottom: "24px", right: "24px",
          width: "360px", height: "520px",
          background: "#0d0d1a",
          border: "1px solid rgba(201,168,76,0.2)",
          borderRadius: "16px", zIndex: 9999,
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
        }}>
          {/* Header */}
          <div style={{
            background: "rgba(201,168,76,0.08)",
            borderBottom: "1px solid rgba(201,168,76,0.12)",
            padding: "12px 14px",
            display: "flex", alignItems: "center", gap: "10px",
          }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "9px", flexShrink: 0,
              background: "linear-gradient(135deg,#C9A84C,#E8C97A)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 2.98.97 4.29L2 22l5.71-.97C9.02 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" fill="#080810"/>
                <circle cx="8" cy="12" r="1.5" fill="#C9A84C"/>
                <circle cx="12" cy="12" r="1.5" fill="#C9A84C"/>
                <circle cx="16" cy="12" r="1.5" fill="#C9A84C"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#F0EBE0" }}>VikChat Assistant</div>
              <div style={{ fontSize: "11px", color: "rgba(201,168,76,0.7)", display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#C9A84C" }} />
                Online
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(240,235,224,0.4)", fontSize: "20px", lineHeight: 1, padding: "2px" }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "82%", padding: "9px 13px", fontSize: "13px", lineHeight: "1.5",
                  borderRadius: msg.role === "user" ? "12px 4px 12px 12px" : "4px 12px 12px 12px",
                  background: msg.role === "user"
                    ? "linear-gradient(135deg,#C9A84C,#E8C97A)"
                    : "rgba(201,168,76,0.08)",
                  border: msg.role === "user" ? "none" : "1px solid rgba(201,168,76,0.12)",
                  color: msg.role === "user" ? "#080810" : "rgba(240,235,224,0.85)",
                  fontWeight: msg.role === "user" ? 500 : 400,
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{
                  padding: "12px 14px", borderRadius: "4px 12px 12px 12px",
                  background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.12)",
                  display: "flex", gap: "4px", alignItems: "center",
                }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{
                      width: "6px", height: "6px", borderRadius: "50%",
                      background: "rgba(201,168,76,0.6)",
                      animation: `vcBounce 1.2s ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Buttons */}
          {messages.length <= 1 && (
            <div style={{ padding: "4px 14px 8px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {quickBtns.map((btn) => (
                <button
                  key={btn}
                  onClick={() => sendMessage(btn)}
                  style={{
                    background: "rgba(201,168,76,0.06)",
                    border: "1px solid rgba(201,168,76,0.18)",
                    color: "rgba(201,168,76,0.8)",
                    fontSize: "11px", padding: "4px 10px",
                    borderRadius: "20px", cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {btn}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: "10px 14px",
            borderTop: "1px solid rgba(201,168,76,0.1)",
            display: "flex", gap: "8px", alignItems: "center",
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Kuch bhi pucho..."
              style={{
                flex: 1, background: "rgba(201,168,76,0.05)",
                border: "1px solid rgba(201,168,76,0.15)",
                borderRadius: "20px", padding: "8px 14px",
                color: "#F0EBE0", fontSize: "13px", outline: "none",
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
            <button
              onClick={() => sendMessage()}
              style={{
                width: "34px", height: "34px", borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg,#C9A84C,#E8C97A)",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#080810">
                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes vcBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </>
  );
}
