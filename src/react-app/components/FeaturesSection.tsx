import { Shield, Zap, Globe, Lock, Eye, Video } from "lucide-react";

const features = [
  { icon: Zap, title: "Instant Matching", desc: "Connected with a stranger in seconds. Powered by intelligent interest-based matching.", badge: "Fast" },
  { icon: Shield, title: "Fully Anonymous", desc: "No accounts, no profiles, no traces. Your privacy is sacred — chat with complete peace of mind.", badge: "Secure" },
  { icon: Globe, title: "Global Reach", desc: "150+ countries. Filter by language or region, or embrace the serendipity of random global connections.", badge: "Worldwide" },
  { icon: Eye, title: "Spy Mode", desc: "Observe a conversation in real time. Submit a question, stay silent, and watch two strangers discuss it.", badge: "Unique" },
  { icon: Video, title: "Video Chat", desc: "Face-to-face connections with your stranger. High quality, low latency video powered by WebRTC.", badge: "Soon" },
  { icon: Lock, title: "Zero Registration", desc: "No email. No password. No tracking. Open the site and you're already inside. Pure, frictionless access.", badge: "Private" },
];

export function FeaturesSection() {
  return (
    <section className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full blur-[140px]" style={{background:"rgba(201,168,76,0.03)"}} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="ornament text-xs mb-5 font-medium tracking-widest uppercase max-w-xs mx-auto" style={{color:"rgba(201,168,76,0.5)",fontFamily:"'DM Sans',sans-serif"}}>
            Why VikChat
          </div>
          <h2 className="font-display mb-4" style={{fontSize:"clamp(2.2rem,5vw,3.5rem)",color:"#F0EBE0",fontWeight:400,lineHeight:1.15}}>
            Crafted for <span className="text-gradient italic">human connection</span>
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{color:"rgba(240,235,224,0.35)",fontFamily:"'DM Sans',sans-serif",fontWeight:300}}>
            Every feature is designed with one purpose — making your conversations richer, safer, and more memorable.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="glass-card-hover rounded-2xl p-7 relative overflow-hidden">
              {/* Badge */}
              <div className="absolute top-5 right-5 text-xs px-2.5 py-1 rounded-full font-medium"
                style={{background:"rgba(201,168,76,0.1)",color:"rgba(201,168,76,0.7)",border:"1px solid rgba(201,168,76,0.15)",fontFamily:"'DM Sans',sans-serif",letterSpacing:"0.06em"}}>
                {f.badge}
              </div>

              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                style={{background:"rgba(201,168,76,0.1)",border:"1px solid rgba(201,168,76,0.2)"}}>
                <f.icon className="w-5 h-5" style={{color:"#C9A84C"}} />
              </div>

              <h3 className="font-display text-xl font-semibold mb-3" style={{color:"#F0EBE0"}}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{color:"rgba(240,235,224,0.38)",fontFamily:"'DM Sans',sans-serif",fontWeight:300}}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
