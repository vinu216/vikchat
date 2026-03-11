import { Navbar } from "@/react-app/components/Navbar";
import { Footer } from "@/react-app/components/Footer";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: "By accessing or using VikChat, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service. These terms apply to all users of the platform.",
  },
  {
    title: "2. Age Requirement",
    content: "You must be at least 18 years of age to use VikChat. By using this service, you represent and warrant that you are 18 years of age or older. We do not knowingly permit minors to use our platform.",
  },
  {
    title: "3. Acceptable Use",
    content: "You agree not to use VikChat to: share illegal, harmful, threatening, abusive, harassing, defamatory, or obscene content; solicit personal information from minors; impersonate any person or entity; transmit spam or unsolicited messages; engage in any activity that violates applicable local, national, or international laws.",
  },
  {
    title: "4. Anonymous Nature of the Service",
    content: "VikChat is designed for anonymous conversations. We do not require registration or personal information to use the service. However, anonymity does not exempt you from these Terms. You are still responsible for all activity conducted through your session.",
  },
  {
    title: "5. Spy Mode",
    content: "Spy Mode allows users to observe conversations between two strangers. By participating as a talker in a conversation, you acknowledge that a third-party observer may be silently present. The observer cannot interact with the conversation.",
  },
  {
    title: "6. Content Responsibility",
    content: "You are solely responsible for the content you share in chats. VikChat does not monitor or moderate conversations in real time. However, we reserve the right to terminate sessions that violate these terms and to cooperate with law enforcement when required.",
  },
  {
    title: "7. Disclaimers",
    content: "VikChat is provided 'as is' without warranties of any kind. We do not guarantee that the service will be uninterrupted, error-free, or free of harmful components. Your use of the service is at your sole risk.",
  },
  {
    title: "8. Limitation of Liability",
    content: "To the fullest extent permitted by law, VikChat shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of, or inability to use, the service.",
  },
  {
    title: "9. Changes to Terms",
    content: "We reserve the right to modify these Terms at any time. Continued use of VikChat after changes constitutes your acceptance of the revised Terms. We encourage you to review this page periodically.",
  },
  {
    title: "10. Contact",
    content: "If you have questions about these Terms, please contact us at legal@vikchat.com.",
  },
];

export default function Terms() {
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
              Terms of <span className="text-gradient italic">Service</span>
            </h1>
            <p className="text-sm" style={{ color: "rgba(240,235,224,0.3)", fontFamily: "'DM Sans',sans-serif" }}>
              Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          {/* Intro box */}
          <div
            className="rounded-2xl p-6 mb-10"
            style={{ background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)" }}
          >
            <p className="text-sm leading-relaxed" style={{ color: "rgba(240,235,224,0.5)", fontFamily: "'DM Sans',sans-serif", fontWeight: 300 }}>
              Please read these Terms of Service carefully before using VikChat. These terms govern your access to and use of our anonymous chat platform. By using VikChat, you enter into a binding agreement with us.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((sec) => (
              <div
                key={sec.title}
                className="glass-card rounded-2xl p-7"
              >
                <h2
                  className="font-display text-xl font-semibold mb-4"
                  style={{ color: "#F0EBE0" }}
                >
                  {sec.title}
                </h2>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "rgba(240,235,224,0.45)", fontFamily: "'DM Sans',sans-serif", fontWeight: 300 }}
                >
                  {sec.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
