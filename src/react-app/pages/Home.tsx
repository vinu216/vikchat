import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/react-app/components/Navbar";
import { HeroSection } from "@/react-app/components/HeroSection";
import { FeaturesSection } from "@/react-app/components/FeaturesSection";
import { Footer } from "@/react-app/components/Footer";
import { MessageSquare, Video, Eye, X, Plus, ChevronRight } from "lucide-react";

const SUGGESTED_INTERESTS = [
  "Music","Travel","Art","Gaming","Movies","Books","Sports","Tech","Food","Photography","Fashion","Fitness","Anime","Science","Politics","Nature","Comedy","Coding","Dance","Cars"
];

export default function Home() {
  const [interests, setInterests] = useState<string[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [mode, setMode] = useState<"text"|"video"|"spy">("text");
  const [spyQuestion, setSpyQuestion] = useState("");
  const navigate = useNavigate();

  const addInterest = (tag: string) => {
    const clean = tag.trim().toLowerCase().replace(/[^a-z0-9 ]/g,"");
    if (clean && !interests.includes(clean) && interests.length < 10) {
      setInterests([...interests, clean]);
    }
    setInputVal("");
  };

  const removeInterest = (tag: string) => setInterests(interests.filter(t => t !== tag));

  const handleInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && inputVal.trim()) {
      e.preventDefault();
      addInterest(inputVal);
    }
  };

  const startChat = () => {
    const params = new URLSearchParams();
    params.set("mode", mode);
    if (interests.length > 0) params.set("interests", interests.join(","));
    if (mode === "spy" && spyQuestion.trim()) params.set("question", spyQuestion.trim());
    mode === "video" ? navigate(`/video?${params.toString()}`) : navigate(`/chat?${params.toString()}`);
  };

  const modes = [
    { id: "text" as const, icon: MessageSquare, title: "Text Chat", desc: "Anonymous text conversation", available: true },
    { id: "video" as const, icon: Video, title: "Video Chat", desc: "Face-to-face with a stranger", available: true },
    { id: "spy" as const, icon: Eye, title: "Spy Mode", desc: "Observe two strangers talk", available: true },
  ];

  return (
    <div className="min-h-screen noise-bg" style={{background:"#080810"}}>
      <Navbar />
      <main>
        <HeroSection />

        {/* ── Chat Launcher ── */}
        <section className="py-24 relative">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px" style={{background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.2),transparent)"}} />
          </div>

          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-12">
              <div className="ornament text-xs mb-4 font-medium tracking-widest uppercase max-w-xs mx-auto" style={{color:"rgba(201,168,76,0.4)",fontFamily:"'DM Sans',sans-serif"}}>Start Now</div>
              <h2 className="font-display text-4xl font-light mb-3" style={{color:"#F0EBE0"}}>
                Choose your <span className="text-gradient italic">experience</span>
              </h2>
            </div>

            {/* Mode selection */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {modes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => m.available && setMode(m.id)}
                  disabled={!m.available}
                  className="relative rounded-2xl p-5 text-left transition-all duration-300"
                  style={{
                    background: mode===m.id ? "rgba(201,168,76,0.1)" : "rgba(255,255,255,0.03)",
                    border: mode===m.id ? "1px solid rgba(201,168,76,0.4)" : "1px solid rgba(255,255,255,0.06)",
                    boxShadow: mode===m.id ? "0 0 25px rgba(201,168,76,0.1)" : "none",
                    opacity: !m.available ? 0.5 : 1,
                    cursor: !m.available ? "not-allowed" : "pointer",
                  }}>
                  {!m.available && (
                    <span className="absolute top-2.5 right-2.5 text-xs px-2 py-0.5 rounded-full"
                      style={{background:"rgba(201,168,76,0.08)",color:"rgba(201,168,76,0.5)",fontSize:"10px",fontFamily:"'DM Sans',sans-serif"}}>SOON</span>
                  )}
                  <m.icon className="w-5 h-5 mb-3" style={{color: mode===m.id ? "#C9A84C" : "rgba(240,235,224,0.3)"}} />
                  <div className="text-sm font-semibold mb-1" style={{color: mode===m.id ? "#F0EBE0" : "rgba(240,235,224,0.5)",fontFamily:"'DM Sans',sans-serif"}}>{m.title}</div>
                  <div className="text-xs" style={{color:"rgba(240,235,224,0.25)",fontFamily:"'DM Sans',sans-serif"}}>{m.desc}</div>
                </button>
              ))}
            </div>

            {/* Spy question input */}
            {mode === "spy" && (
              <div className="mb-6 p-5 rounded-2xl" style={{background:"rgba(201,168,76,0.05)",border:"1px solid rgba(201,168,76,0.15)"}}>
                <label className="block text-xs font-semibold mb-2 tracking-widest uppercase" style={{color:"rgba(201,168,76,0.6)",fontFamily:"'DM Sans',sans-serif"}}>
                  Your question for the two strangers
                </label>
                <input
                  type="text"
                  value={spyQuestion}
                  onChange={e => setSpyQuestion(e.target.value)}
                  placeholder="e.g. If you could live anywhere, where would it be?"
                  maxLength={120}
                  className="input-luxury w-full px-4 py-3 rounded-xl text-sm"
                  style={{fontFamily:"'DM Sans',sans-serif"}}
                />
                <p className="text-xs mt-2" style={{color:"rgba(240,235,224,0.2)",fontFamily:"'DM Sans',sans-serif"}}>
                  You will silently observe while two strangers answer your question. You cannot send messages.
                </p>
              </div>
            )}

            {/* Interests */}
            <div className="mb-8 p-6 rounded-2xl" style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)"}}>
              <label className="block text-xs font-semibold mb-4 tracking-widest uppercase" style={{color:"rgba(201,168,76,0.5)",fontFamily:"'DM Sans',sans-serif"}}>
                Interests <span style={{color:"rgba(240,235,224,0.2)",fontWeight:400,textTransform:"none",letterSpacing:0}}>(optional — get matched with someone similar)</span>
              </label>

              {/* Tags display */}
              {interests.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {interests.map(tag => (
                    <span key={tag} className="tag-pill cursor-pointer" onClick={() => removeInterest(tag)}>
                      {tag}
                      <X className="w-3 h-3 opacity-60 hover:opacity-100" />
                    </span>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  onKeyDown={handleInputKey}
                  placeholder="Add an interest and press Enter..."
                  className="input-luxury flex-1 px-4 py-2.5 rounded-xl text-sm"
                  style={{fontFamily:"'DM Sans',sans-serif"}}
                />
                <button
                  onClick={() => inputVal.trim() && addInterest(inputVal)}
                  className="px-4 py-2.5 rounded-xl transition-all duration-200"
                  style={{background:"rgba(201,168,76,0.1)",border:"1px solid rgba(201,168,76,0.2)",color:"#C9A84C"}}>
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_INTERESTS.filter(s => !interests.includes(s.toLowerCase())).slice(0, 12).map(s => (
                  <button key={s} onClick={() => addInterest(s)}
                    className="text-xs px-3 py-1 rounded-full transition-all duration-200"
                    style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",color:"rgba(240,235,224,0.35)",fontFamily:"'DM Sans',sans-serif"}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="rgba(201,168,76,0.08)";(e.currentTarget as HTMLElement).style.borderColor="rgba(201,168,76,0.2)";(e.currentTarget as HTMLElement).style.color="#C9A84C"}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.03)";(e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.07)";(e.currentTarget as HTMLElement).style.color="rgba(240,235,224,0.35)"}}>
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Start button */}
            <button onClick={startChat} className="btn-luxury w-full py-4 rounded-xl text-base font-semibold flex items-center justify-center gap-2">
              {mode === "text" && <><MessageSquare className="w-5 h-5" /> Start Text Chat</>}
              {mode === "video" && <><Video className="w-5 h-5" /> Start Video Chat</>}
              {mode === "spy" && <><Eye className="w-5 h-5" /> Enter Spy Mode</>}
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>

            <p className="text-center text-xs mt-4" style={{color:"rgba(240,235,224,0.2)",fontFamily:"'DM Sans',sans-serif"}}>
              By clicking, you agree to our{" "}
              <Link to="/terms" style={{color:"rgba(201,168,76,0.5)"}}>Terms of Service</Link>
              {" "}and confirm you are 18+.
            </p>
          </div>
        </section>

        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
}
