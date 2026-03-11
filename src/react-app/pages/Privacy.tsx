import { Navbar } from "@/react-app/components/Navbar";
import { Footer } from "@/react-app/components/Footer";
import { Shield, Eye, Database, Lock, Globe, Mail } from "lucide-react";

const sections = [
  {
    icon: Database,
    title: "Information We Collect",
    content: "VikChat is built with privacy at its core. We do not require registration, email addresses, or any personally identifiable information. The only data we generate is a random session token stored in your browser's localStorage. This token is used solely to maintain your chat session and is not linked to any identity.",
  },
  {
    icon: Eye,
    title: "Chat Content",
    content: "Conversations on VikChat are ephemeral. Chat messages are stored temporarily in server memory only for the duration of an active session and are permanently deleted when the chat ends or the server restarts. We do not log, archive, or analyze your conversation content.",
  },
  {
    icon: Globe,
    title: "Technical Data",
    content: "Like all web servers, our server may receive your IP address as part of standard HTTP requests. We do not store IP addresses beyond the immediate connection, and we do not use them to track or identify users. We do not use cookies, tracking pixels, or analytics scripts.",
  },
  {
    icon: Shield,
    title: "Third Parties",
    content: "VikChat does not sell, rent, or share any data with third parties. We do not use advertising networks, social media trackers, or data brokers. The only third-party service we use is Google Fonts for typography — which is loaded from Google's CDN and subject to Google's own privacy policy.",
  },
  {
    icon: Lock,
    title: "Data Security",
    content: "We use industry-standard security practices to protect the infrastructure that runs VikChat. However, no internet transmission is 100% secure. Given our ephemeral architecture, even in the event of a breach, there is no persistent user data that could be exposed.",
  },
  {
    icon: Mail,
    title: "Children's Privacy",
    content: "VikChat is strictly for users 18 years of age and older. We do not knowingly collect any information from minors. If you believe a minor has used our service, please contact us immediately at privacy@vikchat.com and we will take appropriate action.",
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen" style={{ background: "#080810" }}>
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div
              className="ornament text-xs mb-5 font-medium tracking-widest uppercase max-w-xs mx-auto"
              style={{ color: "rgba(201,168,76,0.4)", fontFamily: "'DM Sans',sans-serif" }}
            >
              Legal
            </div>
            <h1
              className="font-display mb-4"
              style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)", color: "#F0EBE0", fontWeight: 300, lineHeight: 1.15 }}
            >
              Privacy <span className="text-gradient italic">Policy</span>
            </h1>
            <p className="text-sm" style={{ color: "rgba(240,235,224,0.3)", fontFamily: "'DM Sans',sans-serif" }}>
              Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          {/* Privacy promise */}
          <div
            className="rounded-2xl p-6 mb-10 flex gap-4 items-start"
            style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5"
              style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.25)" }}
            >
              <Shield className="w-5 h-5" style={{ color: "#C9A84C" }} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold mb-2" style={{ color: "#F0EBE0" }}>
                Our Privacy Promise
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(240,235,224,0.5)", fontFamily: "'DM Sans',sans-serif", fontWeight: 300 }}>
                VikChat was built with a single principle: <strong style={{ color: "#C9A84C" }}>your conversations belong to you, not us.</strong> We collect the absolute minimum to make the service work, and nothing more.
              </p>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-5">
            {sections.map((sec) => (
              <div key={sec.title} className="glass-card-hover rounded-2xl p-7 flex gap-5">
                <div
                  className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center mt-1"
                  style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.15)" }}
                >
                  <sec.icon className="w-5 h-5" style={{ color: "#C9A84C" }} />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold mb-3" style={{ color: "#F0EBE0" }}>
                    {sec.title}
                  </h2>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "rgba(240,235,224,0.45)", fontFamily: "'DM Sans',sans-serif", fontWeight: 300 }}
                  >
                    {sec.content}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div
            className="text-center mt-12 p-8 rounded-2xl"
            style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.12)" }}
          >
            <h3 className="font-display text-2xl font-light mb-3" style={{ color: "#F0EBE0" }}>
              Questions about privacy?
            </h3>
            <p className="text-sm mb-5" style={{ color: "rgba(240,235,224,0.35)", fontFamily: "'DM Sans',sans-serif" }}>
              We're committed to transparency. Reach out anytime.
            </p>
            <a href="mailto:privacy@vikchat.com">
              <button className="btn-luxury px-8 py-2.5 rounded-xl text-sm">
                Contact Privacy Team
              </button>
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
