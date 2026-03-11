import { useState, useCallback, useRef, useEffect } from "react";

export type ChatMode = "text" | "video" | "spy";
export type ChatStatus = "idle" | "searching" | "connected" | "disconnected";

export interface Message {
  id: string;
  content: string;
  sender: "me" | "stranger" | "system";
  timestamp: Date;
}

const SESSION_KEY = "vikchat_session_token";
function getToken() { try { return localStorage.getItem(SESSION_KEY); } catch { return null; } }
function saveToken(t: string) { try { localStorage.setItem(SESSION_KEY, t); } catch {} }

export function useChat(initialMode: ChatMode = "text", initialInterests: string[] = [], spyQuestion: string = "") {
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineCount, setOnlineCount] = useState(150);
  const [chatId, setChatId] = useState<number | null>(null);
  const [strangerTyping, setStrangerTyping] = useState(false);
  const [commonInterests, setCommonInterests] = useState<string[]>([]);
  const [isSpyMode, setIsSpyMode] = useState(initialMode === "spy");
  const [spyQ, setSpyQ] = useState(spyQuestion);

  const tokenRef = useRef<string | null>(getToken());
  const lastMsgIdRef = useRef<number | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statusPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingLastSentRef = useRef<number>(0);

  const addSystemMsg = (text: string) => {
    setMessages(prev => [...prev, {
      id: `sys-${Date.now()}`,
      content: text,
      sender: "system",
      timestamp: new Date(),
    }]);
  };

  const fetchOnline = useCallback(async () => {
    try {
      const r = await fetch("/api/chat/online");
      const d = await r.json();
      if (d.online) setOnlineCount(d.online);
    } catch {}
  }, []);

  const pollMessages = useCallback(async () => {
    if (!tokenRef.current || !chatId) return;
    try {
      const r = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken: tokenRef.current, lastMessageId: lastMsgIdRef.current }),
      });
      const d = await r.json();
      if (d.strangerTyping !== undefined) setStrangerTyping(d.strangerTyping);
      if (d.messages?.length) {
        const newMsgs: Message[] = d.messages.map((m: { id: number; content: string; isMe: boolean; createdAt: string }) => ({
          id: m.id.toString(),
          content: m.content,
          sender: m.isMe ? "me" : "stranger",
          timestamp: new Date(m.createdAt),
        }));
        setMessages(prev => {
          const ids = new Set(prev.map(m => m.id));
          return [...prev, ...newMsgs.filter(m => !ids.has(m.id))];
        });
        lastMsgIdRef.current = d.messages[d.messages.length - 1].id;
      }
    } catch {}
  }, [chatId]);

  const pollStatus = useCallback(async () => {
    if (!tokenRef.current) return;
    try {
      const r = await fetch("/api/chat/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken: tokenRef.current }),
      });
      const d = await r.json();
      if (d.status === "connected" && d.chatId) {
        setStatus("connected");
        setChatId(d.chatId);
        setIsSpyMode(d.isSpy || false);
        setSpyQ(d.question || "");
        if (d.commonInterests?.length) setCommonInterests(d.commonInterests);
        lastMsgIdRef.current = null;
        setMessages([]);
        if (d.isSpy) addSystemMsg(`🔍 Spy Mode: You are observing two strangers discuss: "${d.question}"`);
        else addSystemMsg("You are now chatting with a random stranger. Say hello!");
      } else if (d.status === "disconnected") {
        setStatus("disconnected");
        setChatId(null);
      }
    } catch {}
  }, []);

  const startSearching = useCallback(async (overrideMode?: ChatMode, overrideInterests?: string[], overrideQuestion?: string) => {
    const chatMode = overrideMode || initialMode;
    const chatInterests = overrideInterests || initialInterests;
    const question = overrideQuestion !== undefined ? overrideQuestion : spyQuestion;

    setStatus("searching");
    setMessages([]);
    setChatId(null);
    setCommonInterests([]);
    setStrangerTyping(false);
    lastMsgIdRef.current = null;

    try {
      const r = await fetch("/api/chat/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionToken: tokenRef.current,
          mode: chatMode,
          interests: chatInterests,
          question,
        }),
      });
      const d = await r.json();
      if (d.sessionToken) { tokenRef.current = d.sessionToken; saveToken(d.sessionToken); }
      if (d.status === "connected" && d.chatId) {
        setStatus("connected");
        setChatId(d.chatId);
        setIsSpyMode(d.isSpy || false);
        setSpyQ(d.question || "");
        if (d.commonInterests?.length) setCommonInterests(d.commonInterests);
        if (d.isSpy) addSystemMsg(`🔍 Spy Mode: You are observing two strangers discuss: "${d.question}"`);
        else addSystemMsg("You are now chatting with a random stranger. Say hello!");
      } else {
        setStatus("searching");
      }
    } catch { setStatus("idle"); }
  }, [initialMode, initialInterests, spyQuestion]);

  const sendMessage = useCallback(async (content: string) => {
    if (!tokenRef.current || !content.trim() || isSpyMode) return;
    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [...prev, { id: tempId, content: content.trim(), sender: "me", timestamp: new Date() }]);
    typingLastSentRef.current = 0;
    try {
      const r = await fetch("/api/chat/message", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken: tokenRef.current, content: content.trim() }),
      });
      const d = await r.json();
      if (d.message) {
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: d.message.id.toString() } : m));
        lastMsgIdRef.current = d.message.id;
      }
    } catch {}
  }, [isSpyMode]);

  const sendTyping = useCallback(async (typing: boolean) => {
    if (!tokenRef.current || isSpyMode) return;
    const now = Date.now();
    if (typing && now - typingLastSentRef.current < 2000) return;
    typingLastSentRef.current = now;
    try {
      await fetch("/api/chat/typing", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken: tokenRef.current, typing }),
      });
    } catch {}
  }, [isSpyMode]);

  const disconnect = useCallback(async () => {
    if (!tokenRef.current) return;
    try { await fetch("/api/chat/disconnect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionToken: tokenRef.current }) }); } catch {}
    addSystemMsg("You have disconnected.");
    setStatus("disconnected");
    setChatId(null);
    setStrangerTyping(false);
  }, []);

  const skipToNext = useCallback(async () => {
    if (!tokenRef.current) return;
    setStatus("searching");
    setMessages([]);
    setCommonInterests([]);
    setStrangerTyping(false);
    lastMsgIdRef.current = null;
    try {
      const r = await fetch("/api/chat/skip", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken: tokenRef.current, mode: initialMode, interests: initialInterests, question: spyQuestion }),
      });
      const d = await r.json();
      if (d.status === "connected" && d.chatId) {
        setStatus("connected");
        setChatId(d.chatId);
        setIsSpyMode(d.isSpy || false);
        setSpyQ(d.question || "");
        if (d.commonInterests?.length) setCommonInterests(d.commonInterests);
        if (d.isSpy) addSystemMsg(`🔍 Spy Mode: Observing: "${d.question}"`);
        else addSystemMsg("You are now chatting with a new stranger. Say hello!");
      } else {
        setStatus("searching");
      }
    } catch { setStatus("idle"); }
  }, [initialMode, initialInterests, spyQuestion]);

  // Online count
  useEffect(() => {
    fetchOnline();
    const t = setInterval(fetchOnline, 30000);
    return () => clearInterval(t);
  }, [fetchOnline]);

  // Message polling when connected
  useEffect(() => {
    if (status === "connected" && chatId) {
      pollMessages();
      pollRef.current = setInterval(pollMessages, 1000);
    } else {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [status, chatId, pollMessages]);

  // Status polling
  useEffect(() => {
    if (status === "searching") {
      statusPollRef.current = setInterval(pollStatus, 1500);
    } else {
      if (statusPollRef.current) { clearInterval(statusPollRef.current); statusPollRef.current = null; }
    }
    return () => { if (statusPollRef.current) clearInterval(statusPollRef.current); };
  }, [status, pollStatus]);

  // Check if partner disconnected
  useEffect(() => {
    if (status === "connected") {
      const t = setInterval(async () => {
        if (!tokenRef.current) return;
        try {
          const r = await fetch("/api/chat/status", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({sessionToken:tokenRef.current}) });
          const d = await r.json();
          if (d.status === "disconnected") {
            setStatus("disconnected");
            setChatId(null);
            setStrangerTyping(false);
            addSystemMsg("Stranger has disconnected.");
          }
        } catch {}
      }, 3000);
      return () => clearInterval(t);
    }
  }, [status]);

  return { status, messages, onlineCount, strangerTyping, commonInterests, isSpyMode, spyQ, startSearching, sendMessage, sendTyping, disconnect, skipToNext };
}
