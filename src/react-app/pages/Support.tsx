import { useState } from "react";
import { Navbar } from "@/react-app/components/Navbar";
import { Footer } from "@/react-app/components/Footer";
import { ChevronDown, ChevronUp, Shield, MessageCircle, AlertTriangle } from "lucide-react";

const faqs = [
  { q: "How does VikChat work?", a: "VikChat instantly connects you with a random stranger. Click 'Start Chatting', we find someone online, and you begin talking — anonymously, instantly, with no account required." },
  { q: "What is Spy Mode?", a: "Spy Mode lets you submit a question and silently observe two strangers discuss it in real time. You can read their messages but cannot write anything yourself. Great for philosophical questions and people-watching." },
  { q: "Is my chat completely anonymous?", a: "Yes. We don't require any sign-up, email, or personal information. Your session is identified by a random token stored in your browser, not linked to any identity." },
  { q: "How does interest matching work?", a: "Before chatting, you can add interest tags like 'music', 'gaming', or 'travel'. We'll prioritize matching you with someone who shares at least one interest. You can always skip to someone random." },
  { q: "What if someone is rude or inappropriate?", a: "Just click Skip or Disconnect immediately. You're never obligated to continue a conversation. We encourage reporting persistent abuse via our support form." },
  { q: "Is there a mobile app?", a: "VikChat is fully optimized for mobile browsers — no app needed. Open it in Safari or Chrome on your phone and you get the full experience." },
];

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{background: open ? "rgba(201,168,76,0.05)" : "rgba(255,255,255,0.02)", border: open ? "1px solid rgba(201,168,76,0.2)" : "1px solid rgba(255,255,255,0.05)"}}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-5 text-left">
        <span className="text-sm font-semibold pr-4" style={{color:"#F0EBE0",fontFamily:"'DM Sans',sans-serif"}}>{q}</span>
        {open ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{color:"#C9A84C"}} /> : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{color:"rgba(240,235,224,0.3)"}} />}
      </button>
      {open && <div className="px-6 pb-5 text-sm leading-relaxed" style={{color:"rgba(240,235,224,0.4)",fontFamily:"'DM Sans',sans-serif",fontWeight:300,borderTop:"1px solid rgba(201,168,76,0.08)"}}><div className="pt-4">{a}</div></div>}
    </div>
  );
}

export default function Support() {
  return (
    <div className="min-h-screen" style={{background:"#080810"}}>
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="ornament text-xs mb-5 font-medium tracking-widest uppercase max-w-xs mx-auto" style={{color:"rgba(201,168,76,0.4)",fontFamily:"'DM Sans',sans-serif"}}>Help Center</div>
            <h1 className="font-display mb-4" style={{fontSize:"clamp(2.2rem,5vw,3.2rem)",color:"#F0EBE0",fontWeight:300}}>
              Support & <span className="text-gradient italic">FAQ</span>
            </h1>
            <p className="text-sm" style={{color:"rgba(240,235,224,0.35)",fontFamily:"'DM Sans',sans-serif"}}>Everything you need to know about VikChat.</p>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-3 gap-3 mb-12">
            {[
              { icon: MessageCircle, title: "Chat Help", desc: "How chatting works" },
              { icon: Shield, title: "Safety", desc: "Stay safe online" },
              { icon: AlertTriangle, title: "Report", desc: "Report abuse" },
            ].map(item => (
              <div key={item.title} className="glass-card rounded-xl p-4 text-center">
                <item.icon className="w-5 h-5 mx-auto mb-2" style={{color:"#C9A84C"}} />
                <div className="text-xs font-semibold mb-0.5" style={{color:"#F0EBE0",fontFamily:"'DM Sans',sans-serif"}}>{item.title}</div>
                <div className="text-xs" style={{color:"rgba(240,235,224,0.25)",fontFamily:"'DM Sans',sans-serif"}}>{item.desc}</div>
              </div>
            ))}
          </div>

          <div className="ornament text-xs mb-8 font-medium tracking-widest uppercase" style={{color:"rgba(201,168,76,0.4)",fontFamily:"'DM Sans',sans-serif"}}>
            Frequently Asked
          </div>

          <div className="space-y-3 mb-16">
            {faqs.map(faq => <FAQ key={faq.q} q={faq.q} a={faq.a} />)}
          </div>

          {/* Contact */}
          <div className="text-center p-8 rounded-2xl" style={{background:"rgba(201,168,76,0.04)",border:"1px solid rgba(201,168,76,0.12)"}}>
            <h3 className="font-display text-2xl font-light mb-3" style={{color:"#F0EBE0"}}>Still need help?</h3>
            <p className="text-sm mb-5" style={{color:"rgba(240,235,224,0.35)",fontFamily:"'DM Sans',sans-serif"}}>We're here to help. Reach out and we'll get back to you.</p>
            <a href="mailto:support@vikchat.com">
              <button className="btn-luxury px-8 py-2.5 rounded-xl text-sm">Contact Support</button>
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
