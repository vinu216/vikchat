import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Video, VideoOff, Mic, MicOff,
  SkipForward, X, Users, Loader2, MessageCircle, PhoneOff
} from "lucide-react";

type VideoStatus = "idle" | "searching" | "connecting" | "connected" | "disconnected";

interface SignalMsg {
  type: "offer" | "answer" | "candidate" | "ready" | "bye";
  data?: unknown;
  chatId?: number;
  sessionToken?: string;
}

// ICE config — outside component so it's stable
const ICE_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export default function VideoChat() {
  const [params] = useSearchParams();
  const interests = useMemo(() => params.get("interests")?.split(",").filter(Boolean) ?? [], [params]);

  const [status, setStatus] = useState<VideoStatus>("idle");
  const [onlineCount, setOnlineCount] = useState(150);
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [chatId, setChatId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [messages, setMessages] = useState<{ text: string; me: boolean }[]>([]);
  const [chatInput, setChatInput] = useState("");

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const tokenRef = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statusPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);



  // ── Fetch online count ──
  useEffect(() => {
    const fetch_ = async () => {
      try {
        const r = await fetch("/api/chat/online");
        const d = await r.json();
        if (d.online) setOnlineCount(d.online);
      } catch {}
    };
    fetch_();
    const t = setInterval(fetch_, 30000);
    return () => clearInterval(t);
  }, []);

  // ── Get local camera/mic ──
  const getLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (e) {
      setErrorMsg("Camera/microphone access denied. Please allow access and try again.");
      return null;
    }
  }, []);

  // ── Create RTCPeerConnection ──
  const createPC = useCallback((stream: MediaStream) => {
    const pc = new RTCPeerConnection(ICE_CONFIG);
    pcRef.current = pc;

    // Add local tracks
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    // Remote stream
    pc.ontrack = (e) => {
      if (remoteVideoRef.current && e.streams[0]) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };

    // ICE candidates — send via signaling
    pc.onicecandidate = async (e) => {
      if (e.candidate && tokenRef.current) {
        try {
          await fetch("/api/video/signal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionToken: tokenRef.current,
              type: "candidate",
              data: e.candidate,
            }),
          });
        } catch {}
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") setStatus("connected");
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        handleDisconnect();
      }
    };

    // Data channel for text chat
    const dc = pc.createDataChannel("chat");
    dataChannelRef.current = dc;
    dc.onmessage = (e) => {
      setMessages(prev => [...prev, { text: e.data, me: false }]);
    };
    pc.ondatachannel = (e) => {
      dataChannelRef.current = e.channel;
      e.channel.onmessage = (ev) => {
        setMessages(prev => [...prev, { text: ev.data, me: false }]);
      };
    };

    return pc;
  }, []);

  // ── Signaling poll — fetch signals from server ──
  const pollSignals = useCallback(async () => {
    if (!tokenRef.current) return;
    try {
      const r = await fetch("/api/video/signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken: tokenRef.current }),
      });
      const d = await r.json();
      if (!d.signals?.length) return;

      for (const sig of d.signals as SignalMsg[]) {
        const pc = pcRef.current;
        if (!pc) continue;

        if (sig.type === "offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(sig.data as RTCSessionDescriptionInit));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await fetch("/api/video/signal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionToken: tokenRef.current, type: "answer", data: answer }),
          });
          setStatus("connecting");
        } else if (sig.type === "answer") {
          await pc.setRemoteDescription(new RTCSessionDescription(sig.data as RTCSessionDescriptionInit));
          setStatus("connecting");
        } else if (sig.type === "candidate") {
          try { await pc.addIceCandidate(new RTCIceCandidate(sig.data as RTCIceCandidateInit)); } catch {}
        } else if (sig.type === "ready") {
          // We are the offerer — create offer
          setStatus("connecting");
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            await fetch("/api/video/signal", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionToken: tokenRef.current, type: "offer", data: offer }),
            });
          } catch {}
        } else if (sig.type === "bye") {
          handleDisconnect();
        }
      }
    } catch {}
  }, []);

  // ── Poll for match while searching ──
  const pollMatch = useCallback(async () => {
    if (!tokenRef.current) return;
    try {
      const r = await fetch("/api/video/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken: tokenRef.current }),
      });
      const d = await r.json();
      if (d.status === "matched" && d.chatId && pcRef.current) {
        setChatId(d.chatId);
        if (statusPollRef.current) { clearInterval(statusPollRef.current); statusPollRef.current = null; }
        // Start signal polling
        pollRef.current = setInterval(pollSignals, 800);
        // If we're "A" — send ready signal to trigger offer from other side
        if (d.role === "A") {
          await fetch("/api/video/signal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionToken: tokenRef.current, type: "ready" }),
          });
        }
      } else if (d.status === "disconnected") {
        setStatus("disconnected");
      }
    } catch {}
  }, [pollSignals]);

  // ── Start video chat ──
  const startVideo = useCallback(async () => {
    setErrorMsg("");
    setStatus("searching");
    setMessages([]);
    setChatId(null);

    const stream = await getLocalStream();
    if (!stream) { setStatus("idle"); return; }

    createPC(stream);

    try {
      const r = await fetch("/api/video/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken: tokenRef.current, interests }),
      });
      const d = await r.json();
      if (d.sessionToken) tokenRef.current = d.sessionToken;

      if (d.status === "matched" && d.chatId) {
        setChatId(d.chatId);
        pollRef.current = setInterval(pollSignals, 800);
        if (d.role === "A") {
          await fetch("/api/video/signal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionToken: tokenRef.current, type: "ready" }),
          });
        }
      } else {
        statusPollRef.current = setInterval(pollMatch, 1500);
      }
    } catch {
      setStatus("idle");
      setErrorMsg("Failed to connect to server. Please try again.");
    }
  }, [getLocalStream, createPC, pollSignals, pollMatch, interests]);

  // ── Disconnect ──
  const handleDisconnect = useCallback(async () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (statusPollRef.current) { clearInterval(statusPollRef.current); statusPollRef.current = null; }
    if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (tokenRef.current) {
      try {
        await fetch("/api/video/disconnect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionToken: tokenRef.current }),
        });
      } catch {}
    }
    setStatus("disconnected");
    setChatId(null);
  }, []);

  const skipToNext = useCallback(async () => {
    await handleDisconnect();
    setTimeout(() => startVideo(), 300);
  }, [handleDisconnect, startVideo]);

  // ── Camera/Mic toggles ──
  const toggleCam = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
      setCamOn(p => !p);
    }
  };
  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
      setMicOn(p => !p);
    }
  };

  // ── Send chat message ──
  const sendChat = () => {
    if (!chatInput.trim() || !dataChannelRef.current) return;
    if (dataChannelRef.current.readyState === "open") {
      dataChannelRef.current.send(chatInput.trim());
      setMessages(prev => [...prev, { text: chatInput.trim(), me: true }]);
      setChatInput("");
    }
  };

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => {
      handleDisconnect();
      localStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#080810" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 flex-shrink-0" style={{ background: "rgba(8,8,16,0.95)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between py-3.5">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 transition-colors" style={{ color: "rgba(240,235,224,0.4)" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#C9A84C"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(240,235,224,0.4)"}>
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm hidden sm:inline" style={{ fontFamily: "'DM Sans',sans-serif" }}>Home</span>
            </Link>
            <div className="w-px h-4" style={{ background: "rgba(201,168,76,0.15)" }} />
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#C9A84C,#E8C97A)" }}>
                <Video className="w-3.5 h-3.5" style={{ color: "#080810" }} />
              </div>
              <span className="font-display font-semibold text-lg" style={{ color: "#F0EBE0" }}>
                Vik<span className="text-gradient">Chat</span>
                <span className="text-xs ml-2 font-sans" style={{ color: "rgba(201,168,76,0.6)", fontFamily: "'DM Sans',sans-serif" }}>Video</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {status === "connected" && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#4ade80", boxShadow: "0 0 6px #4ade80" }} />
                <span className="text-xs font-medium" style={{ color: "#4ade80", fontFamily: "'DM Sans',sans-serif" }}>Live</span>
              </div>
            )}
            {status === "searching" && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.15)" }}>
                <Loader2 className="w-3 h-3 animate-spin" style={{ color: "#facc15" }} />
                <span className="text-xs font-medium" style={{ color: "#facc15", fontFamily: "'DM Sans',sans-serif" }}>Searching...</span>
              </div>
            )}
            <div className="flex items-center gap-1.5" style={{ color: "rgba(240,235,224,0.3)" }}>
              <Users className="w-3.5 h-3.5" />
              <span className="text-xs" style={{ fontFamily: "'DM Sans',sans-serif" }}>{onlineCount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-6xl w-full mx-auto p-4 gap-4">

        {/* Video area */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Videos */}
          <div className="grid grid-cols-2 gap-3 flex-1">
            {/* Remote */}
            <div className="relative rounded-2xl overflow-hidden aspect-video lg:aspect-auto"
              style={{ background: "rgba(14,14,24,0.9)", border: "1px solid rgba(201,168,76,0.1)", minHeight: "200px" }}>
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
              {(status !== "connected" && status !== "connecting") && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
                    style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)" }}>
                    <Users className="w-6 h-6" style={{ color: "rgba(201,168,76,0.4)" }} />
                  </div>
                  <p className="text-xs" style={{ color: "rgba(240,235,224,0.25)", fontFamily: "'DM Sans',sans-serif" }}>
                    {status === "idle" ? "Stranger's camera" : status === "searching" ? "Finding someone..." : "Connecting..."}
                  </p>
                </div>
              )}
              <div className="absolute bottom-2 left-2 text-xs px-2 py-1 rounded-full"
                style={{ background: "rgba(8,8,16,0.7)", color: "rgba(240,235,224,0.5)", fontFamily: "'DM Sans',sans-serif" }}>
                Stranger
              </div>
            </div>

            {/* Local */}
            <div className="relative rounded-2xl overflow-hidden aspect-video lg:aspect-auto"
              style={{ background: "rgba(14,14,24,0.9)", border: "1px solid rgba(201,168,76,0.1)", minHeight: "200px" }}>
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
              {!camOn && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(8,8,16,0.85)" }}>
                  <VideoOff className="w-8 h-8" style={{ color: "rgba(201,168,76,0.3)" }} />
                </div>
              )}
              <div className="absolute bottom-2 left-2 text-xs px-2 py-1 rounded-full"
                style={{ background: "rgba(8,8,16,0.7)", color: "rgba(240,235,224,0.5)", fontFamily: "'DM Sans',sans-serif" }}>
                You
              </div>
            </div>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "rgba(239,68,68,0.8)", fontFamily: "'DM Sans',sans-serif" }}>
              {errorMsg}
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 py-2">
            {/* Mic */}
            <button onClick={toggleMic}
              className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200"
              style={{ background: micOn ? "rgba(255,255,255,0.05)" : "rgba(239,68,68,0.15)", border: micOn ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(239,68,68,0.3)", color: micOn ? "rgba(240,235,224,0.6)" : "#ef4444" }}>
              {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            {/* Main action */}
            {status === "idle" && (
              <button onClick={startVideo} className="btn-luxury px-8 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2">
                <Video className="w-4 h-4" /> Start Video Chat
              </button>
            )}
            {status === "searching" && (
              <button onClick={handleDisconnect}
                className="px-6 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-200"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "rgba(239,68,68,0.7)", fontFamily: "'DM Sans',sans-serif" }}>
                <X className="w-4 h-4" /> Cancel
              </button>
            )}
            {(status === "connecting" || status === "connected") && (
              <>
                <button onClick={handleDisconnect}
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200"
                  style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444" }}>
                  <PhoneOff className="w-4 h-4" />
                </button>
                <button onClick={skipToNext}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm transition-all duration-200"
                  style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", color: "#C9A84C", fontFamily: "'DM Sans',sans-serif" }}>
                  <SkipForward className="w-4 h-4" /> Next
                </button>
              </>
            )}
            {status === "disconnected" && (
              <button onClick={startVideo} className="btn-luxury px-8 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2">
                <Video className="w-4 h-4" /> New Chat
              </button>
            )}

            {/* Camera */}
            <button onClick={toggleCam}
              className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200"
              style={{ background: camOn ? "rgba(255,255,255,0.05)" : "rgba(239,68,68,0.15)", border: camOn ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(239,68,68,0.3)", color: camOn ? "rgba(240,235,224,0.6)" : "#ef4444" }}>
              {camOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Side chat */}
        <div className="w-full lg:w-72 flex flex-col rounded-2xl overflow-hidden"
          style={{ background: "rgba(14,14,24,0.7)", border: "1px solid rgba(201,168,76,0.1)", maxHeight: "500px" }}>
          <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(201,168,76,0.08)" }}>
            <MessageCircle className="w-3.5 h-3.5" style={{ color: "rgba(201,168,76,0.5)" }} />
            <span className="text-xs font-semibold tracking-wide" style={{ color: "rgba(240,235,224,0.4)", fontFamily: "'DM Sans',sans-serif" }}>Side Chat</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 && (
              <p className="text-xs text-center mt-8" style={{ color: "rgba(240,235,224,0.18)", fontFamily: "'DM Sans',sans-serif" }}>
                Messages will appear here
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.me ? "justify-end" : "justify-start"}`}>
                <div className="px-3 py-2 rounded-xl text-xs max-w-[85%] break-words"
                  style={{
                    background: m.me ? "linear-gradient(135deg,#C9A84C,#E8C97A)" : "rgba(255,255,255,0.06)",
                    color: m.me ? "#080810" : "rgba(240,235,224,0.8)",
                    borderRadius: m.me ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
                    fontFamily: "'DM Sans',sans-serif",
                  }}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3" style={{ borderTop: "1px solid rgba(201,168,76,0.08)" }}>
            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendChat()}
                placeholder={status === "connected" ? "Type a message..." : "Connect first..."}
                disabled={status !== "connected"}
                className="input-luxury flex-1 px-3 py-2 rounded-lg text-xs"
                style={{ fontFamily: "'DM Sans',sans-serif", opacity: status !== "connected" ? 0.4 : 1 }}
              />
              <button onClick={sendChat} disabled={!chatInput.trim() || status !== "connected"}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0"
                style={{ background: chatInput.trim() && status === "connected" ? "linear-gradient(135deg,#C9A84C,#E8C97A)" : "rgba(255,255,255,0.05)", color: chatInput.trim() && status === "connected" ? "#080810" : "rgba(255,255,255,0.2)" }}>
                <MessageCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
