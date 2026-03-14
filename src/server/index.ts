import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Types ──────────────────────────────────────────────────────────────────

type SessionStatus = "waiting" | "connected" | "disconnected";
type ChatMode = "text" | "video" | "spy";

interface Session {
  token: string;
  chatId: number | null;
  spyChatId: number | null;
  status: SessionStatus;
  mode: ChatMode;
  interests: string[];
  isTyping: boolean;
  typingAt: number;
  lastSeenAt: number;
  createdAt: Date;
}

interface RegularChat {
  id: number;
  type: "regular";
  sessionA: string;
  sessionB: string;
  active: boolean;
  commonInterests: string[];
}

interface SpyChat {
  id: number;
  type: "spy";
  question: string;
  spyToken: string;
  talkerA: string;
  talkerB: string;
  active: boolean;
}

type Chat = RegularChat | SpyChat;

interface Message {
  id: number;
  chatId: number;
  sessionToken: string; // who sent it
  content: string;
  createdAt: Date;
}

// ─── Store ──────────────────────────────────────────────────────────────────

const sessions = new Map<string, Session>();
const chats = new Map<number, Chat>();
const messages: Message[] = [];

let chatCounter = 1;
let msgCounter = 1;

// Waiting queues
const textQueue: string[] = [];   // tokens waiting for text chat
const spyQueue: Array<{token: string; question: string}> = []; // spies waiting
const talkerQueue: string[] = []; // tokens waiting to be talkers in spy chat

// ─── Helpers ────────────────────────────────────────────────────────────────

function newToken() { return crypto.randomUUID(); }

function getOrCreate(token: string | null): Session {
  if (token && sessions.has(token)) return sessions.get(token)!;
  const t = newToken();
  const s: Session = { token: t, chatId: null, spyChatId: null, status: "disconnected", mode: "text", interests: [], isTyping: false, typingAt: 0, lastSeenAt: Date.now(), createdAt: new Date() };
  sessions.set(t, s);
  return s;
}

function commonInterests(a: string[], b: string[]): string[] {
  const setB = new Set(b.map(x => x.toLowerCase()));
  return a.map(x => x.toLowerCase()).filter(x => setB.has(x));
}

function matchTextSessions(tokA: string, tokB: string): RegularChat {
  const sA = sessions.get(tokA)!;
  const sB = sessions.get(tokB)!;
  const ci = commonInterests(sA.interests, sB.interests);
  const chat: RegularChat = { id: chatCounter++, type: "regular", sessionA: tokA, sessionB: tokB, active: true, commonInterests: ci };
  chats.set(chat.id, chat);
  sA.chatId = chat.id; sA.status = "connected";
  sB.chatId = chat.id; sB.status = "connected";
  return chat;
}

function createSpyChat(spyToken: string, question: string, talkerA: string, talkerB: string): SpyChat {
  const sA = sessions.get(talkerA)!;
  const sB = sessions.get(talkerB)!;
  const spy = sessions.get(spyToken)!;
  const chat: SpyChat = { id: chatCounter++, type: "spy", question, spyToken, talkerA, talkerB, active: true };
  chats.set(chat.id, chat);
  sA.chatId = chat.id; sA.status = "connected";
  sB.chatId = chat.id; sB.status = "connected";
  spy.spyChatId = chat.id; spy.status = "connected";
  return chat;
}

function disconnectSession(token: string) {
  const s = sessions.get(token);
  if (!s) return;

  // Disconnect regular chat
  if (s.chatId) {
    const chat = chats.get(s.chatId);
    if (chat && chat.active) {
      chat.active = false;
      if (chat.type === "regular") {
        const partnerToken = chat.sessionA === token ? chat.sessionB : chat.sessionA;
        const partner = sessions.get(partnerToken);
        if (partner) { partner.status = "disconnected"; partner.chatId = null; }
      } else if (chat.type === "spy") {
        // Notify both talkers
        [chat.talkerA, chat.talkerB, chat.spyToken].forEach(t => {
          if (t !== token) {
            const p = sessions.get(t);
            if (p) { p.status = "disconnected"; p.chatId = null; p.spyChatId = null; }
          }
        });
      }
    }
    s.chatId = null;
  }

  // Disconnect spy chat
  if (s.spyChatId) {
    const chat = chats.get(s.spyChatId) as SpyChat | undefined;
    if (chat && chat.active) {
      // Spy left — just remove spy, talkers continue
      s.spyChatId = null;
    }
  }

  s.status = "disconnected";
  s.isTyping = false;
}

function removeFromQueues(token: string) {
  const i1 = textQueue.indexOf(token);
  if (i1 !== -1) textQueue.splice(i1, 1);
  const i2 = talkerQueue.indexOf(token);
  if (i2 !== -1) talkerQueue.splice(i2, 1);
  const i3 = spyQueue.findIndex(q => q.token === token);
  if (i3 !== -1) spyQueue.splice(i3, 1);
}

function getOnlineCount() {
  const cutoff = Date.now() - 5 * 60 * 1000;
  const active = [...sessions.values()].filter(s => s.lastSeenAt > cutoff).length;
  return Math.max(active + 120, 150);
}

// Cleanup stale sessions
setInterval(() => {
  const cutoff = Date.now() - 30 * 60 * 1000;
  for (const [t, s] of sessions.entries()) {
    if (s.lastSeenAt < cutoff) {
      disconnectSession(t);
      removeFromQueues(t);
      sessions.delete(t);
    }
  }
  if (messages.length > 5000) messages.splice(0, 1000);
}, 5 * 60 * 1000);

// ─── App ────────────────────────────────────────────────────────────────────

const app = new Hono();
app.use("*", cors({ origin: "*" }));

// GET /api/chat/online
app.get("/api/chat/online", (c) => c.json({ online: getOnlineCount() }));

// POST /api/chat/join
app.post("/api/chat/join", async (c) => {
  const body = await c.req.json<{ sessionToken?: string; mode?: ChatMode; interests?: string[]; question?: string }>();
  const session = getOrCreate(body.sessionToken ?? null);
  session.lastSeenAt = Date.now();

  // Reset if was in a chat
  if (session.status !== "disconnected") {
    disconnectSession(session.token);
  }
  removeFromQueues(session.token);

  session.mode = body.mode || "text";
  session.interests = (body.interests || []).map(x => x.toLowerCase().trim()).filter(Boolean);
  session.isTyping = false;

  if (session.mode === "spy") {
    const question = (body.question || "").trim() || "What is the meaning of life?";
    // Need 2 talkers waiting
    const talkerA = talkerQueue.shift();
    const talkerB = talkerA ? talkerQueue.shift() : undefined;

    if (talkerA && talkerB) {
      const chat = createSpyChat(session.token, question, talkerA, talkerB);
      return c.json({ sessionToken: session.token, status: "connected", chatId: chat.id, isSpy: true, question });
    }

    // Not enough talkers — queue spy
    spyQueue.push({ token: session.token, question });
    session.status = "waiting";
    return c.json({ sessionToken: session.token, status: "searching", chatId: null });
  }

  // Text/video mode — add as potential talker AND match with others
  // First try to match with another text waiter
  let matched = false;
  for (let i = 0; i < textQueue.length; i++) {
    const partnerToken = textQueue[i];
    const partner = sessions.get(partnerToken);
    if (!partner || partner.status !== "waiting") { textQueue.splice(i, 1); i--; continue; }

    textQueue.splice(i, 1);
    const chat = matchTextSessions(partnerToken, session.token);
    matched = true;

    // Try to serve a queued spy with this pair
    if (spyQueue.length > 0 && talkerQueue.length >= 1) {
      // covered later
    }

    return c.json({
      sessionToken: session.token,
      status: "connected",
      chatId: chat.id,
      isSpy: false,
      commonInterests: chat.commonInterests,
    });
  }

  if (!matched) {
    // Add to text queue and also talker queue (same person can be a talker for spy)
    session.status = "waiting";
    textQueue.push(session.token);
    talkerQueue.push(session.token);

    // Check if we can fulfill a spy request
    if (spyQueue.length > 0 && talkerQueue.length >= 2) {
      const spyEntry = spyQueue.shift()!;
      const tA = talkerQueue.shift()!;
      const tB = talkerQueue.shift()!;
      // Remove talkers from text queue too
      [tA, tB].forEach(t => { const i = textQueue.indexOf(t); if (i !== -1) textQueue.splice(i, 1); });
      createSpyChat(spyEntry.token, spyEntry.question, tA, tB);
    }
  }

  return c.json({ sessionToken: session.token, status: "searching", chatId: null });
});

// POST /api/chat/status
app.post("/api/chat/status", async (c) => {
  const body = await c.req.json<{ sessionToken: string }>();
  const s = sessions.get(body.sessionToken);
  if (!s) return c.json({ status: "disconnected", chatId: null });
  s.lastSeenAt = Date.now();

  // Check if still waiting and can be matched now
  if (s.status === "waiting") {
    if (s.mode === "spy") {
      // Check if spy was matched
      if (s.spyChatId) {
        const chat = chats.get(s.spyChatId) as SpyChat;
        if (chat) return c.json({ status: "connected", chatId: s.spyChatId, isSpy: true, question: chat.question });
      }
      return c.json({ status: "searching", chatId: null });
    }

    // Clean stale entries, then find a partner
    for (let i = textQueue.length - 1; i >= 0; i--) {
      const p = sessions.get(textQueue[i]);
      if (!p || p.status !== "waiting") textQueue.splice(i, 1);
    }
    const partnerIdx = textQueue.findIndex(t => t !== s.token);
    if (partnerIdx !== -1) {
      const partnerToken = textQueue[partnerIdx];
      textQueue.splice(partnerIdx, 1);
      const myIdx = textQueue.indexOf(s.token);
      if (myIdx !== -1) textQueue.splice(myIdx, 1);
      const chat = matchTextSessions(partnerToken, s.token);
      return c.json({ status: "connected", chatId: chat.id, isSpy: false, commonInterests: chat.commonInterests });
    }
    return c.json({ status: "searching", chatId: null });
  }

  if (s.status === "connected") {
    const chatId = s.chatId || s.spyChatId;
    if (!chatId) return c.json({ status: "disconnected" });
    const chat = chats.get(chatId);
    if (!chat || !chat.active) {
      s.status = "disconnected"; s.chatId = null; s.spyChatId = null;
      return c.json({ status: "disconnected", chatId: null });
    }
    const isSpy = s.spyChatId !== null && chat.type === "spy";
    return c.json({
      status: "connected",
      chatId,
      isSpy,
      question: chat.type === "spy" ? chat.question : undefined,
      commonInterests: chat.type === "regular" ? chat.commonInterests : [],
    });
  }

  return c.json({ status: s.status, chatId: s.chatId });
});

// POST /api/chat/messages
app.post("/api/chat/messages", async (c) => {
  const body = await c.req.json<{ sessionToken: string; lastMessageId: number | null }>();
  const s = sessions.get(body.sessionToken);
  if (!s) return c.json({ messages: [], strangerTyping: false });
  s.lastSeenAt = Date.now();

  const chatId = s.chatId || s.spyChatId;
  if (!chatId) return c.json({ messages: [], strangerTyping: false });

  const chat = chats.get(chatId);
  if (!chat) return c.json({ messages: [], strangerTyping: false });

  const msgs = messages.filter(m => m.chatId === chatId && (body.lastMessageId === null || m.id > body.lastMessageId));

  // Stranger typing — check partner(s)
  let strangerTyping = false;
  const now = Date.now();
  if (chat.type === "regular") {
    const partnerToken = chat.sessionA === s.token ? chat.sessionB : chat.sessionA;
    const partner = sessions.get(partnerToken);
    strangerTyping = !!(partner && partner.isTyping && (now - partner.typingAt) < 4000);
  } else if (chat.type === "spy") {
    // Spy sees both talkers typing
    const talkers = [sessions.get(chat.talkerA), sessions.get(chat.talkerB)];
    strangerTyping = talkers.some(p => p && p.isTyping && (now - p.typingAt) < 4000);
  }

  return c.json({
    messages: msgs.map(m => ({
      id: m.id,
      content: m.content,
      isMe: m.sessionToken === s.token,
      createdAt: m.createdAt.toISOString(),
    })),
    strangerTyping,
  });
});

// POST /api/chat/message
app.post("/api/chat/message", async (c) => {
  const body = await c.req.json<{ sessionToken: string; content: string }>();
  const s = sessions.get(body.sessionToken);
  if (!s || !s.chatId || s.status !== "connected") return c.json({ error: "Not connected" }, 400);

  // Spies cannot send
  if (s.spyChatId && !s.chatId) return c.json({ error: "Spies cannot send messages" }, 403);

  const chat = chats.get(s.chatId!);
  if (!chat || !chat.active) return c.json({ error: "Chat ended" }, 400);

  const msg: Message = { id: msgCounter++, chatId: s.chatId!, sessionToken: s.token, content: body.content.trim(), createdAt: new Date() };
  messages.push(msg);
  s.isTyping = false;

  return c.json({ message: { id: msg.id, createdAt: msg.createdAt.toISOString() } });
});

// POST /api/chat/typing
app.post("/api/chat/typing", async (c) => {
  const body = await c.req.json<{ sessionToken: string; typing: boolean }>();
  const s = sessions.get(body.sessionToken);
  if (!s) return c.json({ ok: true });
  s.lastSeenAt = Date.now();
  s.isTyping = body.typing;
  s.typingAt = body.typing ? Date.now() : 0;
  return c.json({ ok: true });
});

// POST /api/chat/disconnect
app.post("/api/chat/disconnect", async (c) => {
  const body = await c.req.json<{ sessionToken: string }>();
  disconnectSession(body.sessionToken);
  removeFromQueues(body.sessionToken);
  return c.json({ ok: true });
});

// POST /api/chat/skip
app.post("/api/chat/skip", async (c) => {
  const body = await c.req.json<{ sessionToken: string; mode?: ChatMode; interests?: string[]; question?: string }>();
  const s = sessions.get(body.sessionToken);
  if (!s) return c.json({ status: "searching", chatId: null });

  disconnectSession(body.sessionToken);
  removeFromQueues(body.sessionToken);

  s.mode = body.mode || s.mode;
  s.interests = (body.interests || s.interests).map(x => x.toLowerCase().trim());
  s.status = "waiting";
  s.isTyping = false;

  if (s.mode === "spy") {
    const question = (body.question || "").trim() || "What is the meaning of life?";
    const talkerA = talkerQueue.shift();
    const talkerB = talkerA ? talkerQueue.shift() : undefined;
    if (talkerA && talkerB) {
      const chat = createSpyChat(s.token, question, talkerA, talkerB);
      return c.json({ status: "connected", chatId: chat.id, isSpy: true, question });
    }
    spyQueue.push({ token: s.token, question });
    return c.json({ status: "searching", chatId: null });
  }

  // Try matching
  for (let i = 0; i < textQueue.length; i++) {
    const pt = textQueue[i];
    const partner = sessions.get(pt);
    if (!partner || partner.status !== "waiting") { textQueue.splice(i, 1); i--; continue; }
    textQueue.splice(i, 1);
    const chat = matchTextSessions(pt, s.token);
    return c.json({ status: "connected", chatId: chat.id, isSpy: false, commonInterests: chat.commonInterests });
  }

  textQueue.push(s.token);
  talkerQueue.push(s.token);
  return c.json({ status: "searching", chatId: null });
});

// ─── Video Signaling API ─────────────────────────────────────────────────────

interface VideoSession {
  token: string;
  chatId: number | null;
  role: "A" | "B" | null;
  status: "waiting" | "matched" | "disconnected";
  interests: string[];
  signals: { type: string; data: unknown }[];
  lastSeenAt: number;
}

const videoSessions = new Map<string, VideoSession>();
const videoQueue: string[] = [];
let videoChatCounter = 1;

function getOrCreateVideo(token: string | null): VideoSession {
  if (token && videoSessions.has(token)) return videoSessions.get(token)!;
  const t = crypto.randomUUID();
  const s: VideoSession = { token: t, chatId: null, role: null, status: "disconnected", interests: [], signals: [], lastSeenAt: Date.now() };
  videoSessions.set(t, s);
  return s;
}

// Cleanup stale video sessions
setInterval(() => {
  const cutoff = Date.now() - 10 * 60 * 1000;
  for (const [t, s] of videoSessions.entries()) {
    if (s.lastSeenAt < cutoff) {
      const i = videoQueue.indexOf(t);
      if (i !== -1) videoQueue.splice(i, 1);
      videoSessions.delete(t);
    }
  }
}, 2 * 60 * 1000);

// POST /api/video/join
app.post("/api/video/join", async (c) => {
  const body = await c.req.json<{ sessionToken?: string; interests?: string[] }>();
  const s = getOrCreateVideo(body.sessionToken ?? null);
  s.lastSeenAt = Date.now();
  s.interests = body.interests || [];
  s.signals = [];

  // Remove from queue if already there
  const qi = videoQueue.indexOf(s.token);
  if (qi !== -1) videoQueue.splice(qi, 1);

  // Try to match
  for (let i = 0; i < videoQueue.length; i++) {
    const pt = videoQueue[i];
    const partner = videoSessions.get(pt);
    if (!partner || partner.status !== "waiting") { videoQueue.splice(i, 1); i--; continue; }
    videoQueue.splice(i, 1);

    const chatId = videoChatCounter++;
    s.chatId = chatId; s.role = "B"; s.status = "matched";
    partner.chatId = chatId; partner.role = "A"; partner.status = "matched";

    return c.json({ sessionToken: s.token, status: "matched", chatId, role: "B" });
  }

  s.status = "waiting";
  videoQueue.push(s.token);
  return c.json({ sessionToken: s.token, status: "searching" });
});

// POST /api/video/status
app.post("/api/video/status", async (c) => {
  const body = await c.req.json<{ sessionToken: string }>();
  const s = videoSessions.get(body.sessionToken);
  if (!s) return c.json({ status: "disconnected" });
  s.lastSeenAt = Date.now();

  if (s.status === "waiting") {
    // Try match now
    for (let i = 0; i < videoQueue.length; i++) {
      const pt = videoQueue[i];
      if (pt === s.token) continue;
      const partner = videoSessions.get(pt);
      if (!partner || partner.status !== "waiting") { videoQueue.splice(i, 1); i--; continue; }
      videoQueue.splice(i, 1);
      const qi = videoQueue.indexOf(s.token);
      if (qi !== -1) videoQueue.splice(qi, 1);

      const chatId = videoChatCounter++;
      s.chatId = chatId; s.role = "B"; s.status = "matched";
      partner.chatId = chatId; partner.role = "A"; partner.status = "matched";
      return c.json({ status: "matched", chatId, role: "B" });
    }
    return c.json({ status: "searching" });
  }

  return c.json({ status: s.status, chatId: s.chatId, role: s.role });
});

// POST /api/video/signal — send a signal to partner
app.post("/api/video/signal", async (c) => {
  const body = await c.req.json<{ sessionToken: string; type: string; data?: unknown }>();
  const s = videoSessions.get(body.sessionToken);
  if (!s || !s.chatId) return c.json({ ok: false });
  s.lastSeenAt = Date.now();

  // Find partner
  const partner = [...videoSessions.values()].find(
    v => v.chatId === s.chatId && v.token !== s.token
  );
  if (!partner) return c.json({ ok: false });

  partner.signals.push({ type: body.type, data: body.data });
  return c.json({ ok: true });
});

// POST /api/video/signals — receive pending signals
app.post("/api/video/signals", async (c) => {
  const body = await c.req.json<{ sessionToken: string }>();
  const s = videoSessions.get(body.sessionToken);
  if (!s) return c.json({ signals: [] });
  s.lastSeenAt = Date.now();

  const signals = [...s.signals];
  s.signals = [];
  return c.json({ signals });
});

// POST /api/video/disconnect
app.post("/api/video/disconnect", async (c) => {
  const body = await c.req.json<{ sessionToken: string }>();
  const s = videoSessions.get(body.sessionToken);
  if (!s) return c.json({ ok: true });

  // Notify partner
  if (s.chatId) {
    const partner = [...videoSessions.values()].find(v => v.chatId === s.chatId && v.token !== s.token);
    if (partner) {
      partner.signals.push({ type: "bye", data: null });
      partner.status = "disconnected";
      partner.chatId = null;
    }
  }

  const qi = videoQueue.indexOf(s.token);
  if (qi !== -1) videoQueue.splice(qi, 1);

  s.status = "disconnected";
  s.chatId = null;
  s.role = null;
  return c.json({ ok: true });
});


// ── AI Assistant Proxy ───────────────────────────────────────────────────────

app.post("/api/assistant", async (c) => {
  try {
    const body = await c.req.json<{ messages: { role: string; content: string }[] }>();
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return c.json({ content: [{ type: "text", text: "Assistant unavailable right now." }] });
    }
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        max_tokens: 300,
        messages: [
          {
            role: "system",
            content: "You are VikChat Assistant — a friendly helpful AI for VikChat website. VikChat is a free anonymous chat platform. Features: Text Chat (instant anonymous chat with strangers), Video Chat (face-to-face), Spy Mode (watch two strangers chat and ask one question anonymously). Zero registration — no email, no password needed. 100% Free and Private. Reply in same language as user (Hindi/English/Hinglish). Keep answers short — 2-3 sentences max.",
          },
          ...body.messages,
        ],
      }),
    });
    const data = await response.json() as { choices?: { message: { content: string } }[]; error?: { message: string } };
    if (data.error || !data.choices?.[0]) {
      return c.json({ content: [{ type: "text", text: "Kuch error aa gaya. Thodi der baad try karo!" }] });
    }
    return c.json({ content: [{ type: "text", text: data.choices[0].message.content }] });
  } catch {
    return c.json({ content: [{ type: "text", text: "Server error. Dobara try karo!" }] });
  }
});

// ── Static frontend ──────────────────────────────────────────────────────────

app.use("/*", serveStatic({ root: path.join(__dirname, "../../dist/frontend") }));

app.get("*", async (c) => {
  const indexPath = path.join(__dirname, "../../dist/frontend/index.html");
  try {
    const html = readFileSync(indexPath, "utf-8");
    return c.html(html);
  } catch {
    return c.text("Frontend not built yet. Run: npm run build", 500);
  }
});

// ── Start ────────────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT ?? "3001", 10);
serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`\n✅  VikChat server running at http://localhost:${info.port}`);
  console.log(`    Mode: Production | API: /api/chat/*\n`);
});
