import { Navbar } from "@/react-app/components/Navbar";
import { Footer } from "@/react-app/components/Footer";
import { Users, Shield, Globe, Zap, Heart, Eye } from "lucide-react";

const values = [
  { icon: Users, title: "Human First", desc: "We believe in the power of authentic conversations between strangers who might never have met otherwise." },
  { icon: Shield, title: "Privacy Sacred", desc: "Your anonymity is our promise. No accounts, no data sold, no surveillance. Just pure conversation." },
  { icon: Globe, title: "No Borders", desc: "Connect across languages, cultures, and time zones. The world shrinks when people talk honestly." },
  { icon: Zap, title: "Instant Access", desc: "No onboarding. No friction. You arrive, you connect. That's the entire product." },
  { icon: Eye, title: "Spy Mode", desc: "Our unique feature: submit a question and silently observe two strangers answer it in real time." },
  { icon: Heart, title: "Kindness Matters", desc: "We build tools for genuine connection. Treat others as you'd want to be treated." },
];

export default function About() {
  return (
    <div className="min-h-screen" style={{background:"#080810"}}>
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center mb-20">
            <div className="ornament text-xs mb-5 font-medium tracking-widest uppercase max-w-xs mx-auto" style={{color:"rgba(201,168,76,0.4)",fontFamily:"'DM Sans',sans-serif"}}>Our Story</div>
            <h1 className="font-display mb-6" style={{fontSize:"clamp(2.5rem,6vw,4rem)",color:"#F0EBE0",fontWeight:300,lineHeight:1.15}}>
              About <span className="text-gradient italic">VikChat</span>
            </h1>
            <p className="text-base leading-relaxed max-w-2xl mx-auto" style={{color:"rgba(240,235,224,0.38)",fontFamily:"'DM Sans',sans-serif",fontWeight:300}}>
              VikChat is a modern take on random chat — a private salon for spontaneous human connection. Built for those who crave real conversation with complete anonymity.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-20">
            {[["10M+","Conversations"],["150+","Countries"],["100%","Anonymous"]].map(([val, label]) => (
              <div key={label} className="glass-card rounded-2xl p-6 text-center">
                <div className="font-display text-3xl font-semibold text-gradient mb-2">{val}</div>
                <div className="text-xs tracking-wide uppercase" style={{color:"rgba(240,235,224,0.3)",fontFamily:"'DM Sans',sans-serif"}}>{label}</div>
              </div>
            ))}
          </div>

          {/* Values */}
          <div className="ornament text-xs mb-10 font-medium tracking-widest uppercase" style={{color:"rgba(201,168,76,0.4)",fontFamily:"'DM Sans',sans-serif"}}>Our Values</div>
          <div className="grid md:grid-cols-2 gap-4">
            {values.map((v) => (
              <div key={v.title} className="glass-card-hover rounded-2xl p-6 flex gap-4">
                <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center" style={{background:"rgba(201,168,76,0.1)",border:"1px solid rgba(201,168,76,0.15)"}}>
                  <v.icon className="w-4.5 h-4.5" style={{color:"#C9A84C"}} />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold mb-1.5" style={{color:"#F0EBE0"}}>{v.title}</h3>
                  <p className="text-sm leading-relaxed" style={{color:"rgba(240,235,224,0.38)",fontFamily:"'DM Sans',sans-serif",fontWeight:300}}>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
