import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Support", path: "/support" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? "rgba(8,8,16,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(201,168,76,0.12)" : "1px solid transparent",
      }}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105"
              style={{ background: "linear-gradient(135deg,#C9A84C,#E8C97A)", boxShadow: "0 0 20px rgba(201,168,76,0.3)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 2.98.97 4.29L2 22l5.71-.97C9.02 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" fill="#080810"/>
                <circle cx="8" cy="12" r="1.5" fill="#080810"/>
                <circle cx="12" cy="12" r="1.5" fill="#080810"/>
                <circle cx="16" cy="12" r="1.5" fill="#080810"/>
              </svg>
            </div>
            <span className="font-display text-xl font-semibold tracking-wide" style={{color:"#F0EBE0"}}>
              Vik<span className="text-gradient">Chat</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className="text-sm font-medium tracking-wide transition-colors duration-200"
                style={{ color: location.pathname===link.path ? "#C9A84C" : "rgba(240,235,224,0.45)", fontFamily:"'DM Sans',sans-serif" }}>
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:block">
            <Link to="/chat">
              <button className="btn-luxury px-5 py-2 rounded-lg text-sm">Start Chatting</button>
            </Link>
          </div>

          <button className="md:hidden p-2" style={{color:"rgba(240,235,224,0.7)"}} onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden py-5 border-t" style={{borderColor:"rgba(201,168,76,0.1)"}}>
            <div className="flex flex-col gap-5">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)} className="text-sm font-medium"
                  style={{ color: location.pathname===link.path ? "#C9A84C" : "rgba(240,235,224,0.5)", fontFamily:"'DM Sans',sans-serif" }}>
                  {link.name}
                </Link>
              ))}
              <Link to="/chat" onClick={() => setMobileOpen(false)}>
                <button className="btn-luxury px-6 py-2.5 rounded-lg text-sm w-full">Start Chatting</button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
