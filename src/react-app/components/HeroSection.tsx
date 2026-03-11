import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export function HeroSection() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const target = 2847;
    const step = Math.ceil(target / 60);
    let current = 0;
    const t = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(current);
      if (current >= target) clearInterval(t);
    }, 25);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
      {/* Ambient lights */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-40 w-[600px] h-[600px] rounded-full blur-[120px]" style={{background:"rgba(201,168,76,0.06)"}} />
        <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] rounded-full blur-[100px]" style={{background:"rgba(201,168,76,0.04)"}} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px]" style={{background:"rgba(201,168,76,0.02)"}} />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{backgroundImage:"linear-gradient(rgba(201,168,76,1) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,1) 1px,transparent 1px)",backgroundSize:"80px 80px"}} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <div className="fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
              style={{background:"rgba(201,168,76,0.08)",border:"1px solid rgba(201,168,76,0.2)"}}>
              <div className="w-1.5 h-1.5 rounded-full status-pulse" style={{background:"#4ade80"}} />
              <span className="text-xs font-medium tracking-widest uppercase" style={{color:"#C9A84C",fontFamily:"'DM Sans',sans-serif"}}>
                {count.toLocaleString()} people online now
              </span>
            </div>

            <h1 className="fade-up-delay-1 font-display leading-none mb-6" style={{fontSize:"clamp(3.2rem,7vw,5.5rem)",color:"#F0EBE0",fontWeight:300,letterSpacing:"-0.01em"}}>
              Meet strangers.<br />
              <span className="shimmer font-semibold italic">Make magic.</span>
            </h1>

            <p className="fade-up-delay-2 text-base sm:text-lg leading-relaxed mb-10 max-w-lg"
              style={{color:"rgba(240,235,224,0.4)",fontFamily:"'DM Sans',sans-serif",fontWeight:300}}>
              Step into VikChat — a private salon for spontaneous human connection. Text chat, video chat, or observe as a silent witness. No identity required.
            </p>

            <div className="fade-up-delay-3 flex flex-col sm:flex-row gap-4 mb-14">
              <Link to="/chat">
                <button className="btn-luxury px-8 py-3.5 rounded-xl text-base font-semibold w-full sm:w-auto">
                  Begin Conversation
                </button>
              </Link>
              <Link to="/about">
                <button className="btn-outline-luxury px-8 py-3.5 rounded-xl text-base w-full sm:w-auto">
                  Learn More
                </button>
              </Link>
            </div>

            <div className="fade-up-delay-4 flex items-center gap-8">
              {[["10K+","Active Users"],["150+","Countries"],["1M+","Daily Chats"]].map(([val, label]) => (
                <div key={label} className="text-center">
                  <div className="font-display text-2xl font-semibold text-gradient">{val}</div>
                  <div className="text-xs mt-0.5 tracking-wide" style={{color:"rgba(240,235,224,0.3)",fontFamily:"'DM Sans',sans-serif"}}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — floating chat preview */}
          <div className="relative hidden lg:block h-[520px]">
            {/* Main chat window */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 rounded-2xl p-5 border-animated"
              style={{background:"rgba(14,14,24,0.9)",border:"1px solid rgba(201,168,76,0.15)",boxShadow:"0 30px 80px rgba(0,0,0,0.5),0 0 40px rgba(201,168,76,0.06)"}}>
              <div className="flex items-center gap-3 mb-5 pb-4" style={{borderBottom:"1px solid rgba(201,168,76,0.08)"}}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold" style={{background:"linear-gradient(135deg,#C9A84C,#E8C97A)",color:"#080810"}}>S</div>
                <div>
                  <div className="text-sm font-medium" style={{color:"#F0EBE0",fontFamily:"'DM Sans',sans-serif"}}>Stranger</div>
                  <div className="flex items-center gap-1.5 text-xs" style={{color:"#4ade80"}}>
                    <span className="w-1.5 h-1.5 rounded-full inline-block" style={{background:"#4ade80"}} />Connected
                  </div>
                </div>
                <div className="ml-auto text-xs px-2.5 py-1 rounded-full" style={{background:"rgba(201,168,76,0.1)",color:"#C9A84C",border:"1px solid rgba(201,168,76,0.15)"}}>Text</div>
              </div>
              <div className="space-y-3">
                {[
                  {me:false, text:"Hey! Where are you from? 👋"},
                  {me:true,  text:"Hi! I'm from Brazil 🇧🇷"},
                  {me:false, text:"That's amazing! I've always dreamed of visiting São Paulo."},
                ].map((msg, i) => (
                  <div key={i} className={`flex ${msg.me ? "justify-end" : "justify-start"}`}>
                    <div className="px-4 py-2.5 rounded-2xl text-sm max-w-[82%]"
                      style={{
                        background: msg.me ? "linear-gradient(135deg,#C9A84C,#E8C97A)" : "rgba(255,255,255,0.06)",
                        color: msg.me ? "#080810" : "rgba(240,235,224,0.85)",
                        fontFamily:"'DM Sans',sans-serif",
                        borderRadius: msg.me ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {/* Typing */}
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl" style={{background:"rgba(255,255,255,0.04)",borderRadius:"18px 18px 18px 4px"}}>
                    <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                  </div>
                </div>
              </div>
            </div>

            {/* Interest tag card */}
            <div className="absolute top-8 right-0 px-4 py-3 rounded-xl"
              style={{background:"rgba(14,14,24,0.95)",border:"1px solid rgba(201,168,76,0.15)",boxShadow:"0 10px 30px rgba(0,0,0,0.4)"}}>
              <div className="text-xs mb-2" style={{color:"rgba(201,168,76,0.6)",fontFamily:"'DM Sans',sans-serif",letterSpacing:"0.08em"}}>SHARED INTERESTS</div>
              <div className="flex gap-1.5">
                {["Music","Travel","Design"].map(tag => (
                  <span key={tag} className="tag-pill text-xs">{tag}</span>
                ))}
              </div>
            </div>

            {/* Mode selector card */}
            <div className="absolute bottom-20 left-0 px-4 py-3 rounded-xl"
              style={{background:"rgba(14,14,24,0.95)",border:"1px solid rgba(201,168,76,0.15)"}}>
              <div className="text-xs mb-2" style={{color:"rgba(201,168,76,0.6)",fontFamily:"'DM Sans',sans-serif",letterSpacing:"0.08em"}}>CHAT MODE</div>
              <div className="flex gap-1.5">
                {["Text","Video","Spy"].map((m, i) => (
                  <div key={m} className="px-3 py-1 rounded-full text-xs" style={{
                    background: i===0 ? "linear-gradient(135deg,#C9A84C,#E8C97A)" : "rgba(255,255,255,0.05)",
                    color: i===0 ? "#080810" : "rgba(240,235,224,0.45)",
                    fontFamily:"'DM Sans',sans-serif", fontWeight: i===0 ? 600 : 400,
                  }}>{m}</div>
                ))}
              </div>
            </div>

            {/* Online pill */}
            <div className="absolute bottom-8 right-4 flex items-center gap-2 px-4 py-2 rounded-full"
              style={{background:"rgba(14,14,24,0.95)",border:"1px solid rgba(201,168,76,0.12)"}}>
              <span className="w-2 h-2 rounded-full status-pulse" style={{background:"#4ade80"}} />
              <span className="text-sm font-medium" style={{color:"rgba(240,235,224,0.7)",fontFamily:"'DM Sans',sans-serif"}}>2,847 online</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
