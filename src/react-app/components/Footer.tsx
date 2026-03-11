import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid rgba(201,168,76,0.1)", background: "rgba(8,8,16,0.8)" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:"linear-gradient(135deg,#C9A84C,#E8C97A)",boxShadow:"0 0 15px rgba(201,168,76,0.25)"}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 2.98.97 4.29L2 22l5.71-.97C9.02 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" fill="#080810"/>
                  <circle cx="8" cy="12" r="1.5" fill="#080810"/><circle cx="12" cy="12" r="1.5" fill="#080810"/><circle cx="16" cy="12" r="1.5" fill="#080810"/>
                </svg>
              </div>
              <span className="font-display text-xl font-semibold" style={{color:"#F0EBE0"}}>
                Vik<span className="text-gradient">Chat</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs" style={{color:"rgba(240,235,224,0.35)",fontFamily:"'DM Sans',sans-serif"}}>
              A private salon for spontaneous connection. Meet strangers, share moments, make friends — all with complete anonymity.
            </p>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold mb-4 tracking-widest uppercase" style={{color:"rgba(201,168,76,0.7)"}}>Company</h4>
            <ul className="space-y-3">
              {[["About", "/about"], ["Support", "/support"]].map(([name, path]) => (
                <li key={path}>
                  <Link to={path} className="text-sm transition-colors duration-200"
                    style={{color:"rgba(240,235,224,0.35)",fontFamily:"'DM Sans',sans-serif"}}
                    onMouseEnter={e => (e.target as HTMLElement).style.color="#C9A84C"}
                    onMouseLeave={e => (e.target as HTMLElement).style.color="rgba(240,235,224,0.35)"}>
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold mb-4 tracking-widest uppercase" style={{color:"rgba(201,168,76,0.7)"}}>Legal</h4>
            <ul className="space-y-3">
              {[["Terms of Service", "/terms"], ["Privacy Policy", "/privacy"]].map(([name, path]) => (
                <li key={path}>
                  <Link to={path} className="text-sm transition-colors duration-200"
                    style={{color:"rgba(240,235,224,0.35)",fontFamily:"'DM Sans',sans-serif"}}
                    onMouseEnter={e => (e.target as HTMLElement).style.color="#C9A84C"}
                    onMouseLeave={e => (e.target as HTMLElement).style.color="rgba(240,235,224,0.35)"}>
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{borderTop:"1px solid rgba(201,168,76,0.08)"}}>
          <p className="text-xs" style={{color:"rgba(240,235,224,0.2)",fontFamily:"'DM Sans',sans-serif"}}>
            © {new Date().getFullYear()} VikChat. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{background:"#C9A84C",boxShadow:"0 0 6px #C9A84C"}} />
            <span className="text-xs" style={{color:"rgba(201,168,76,0.5)",fontFamily:"'DM Sans',sans-serif"}}>Private & Anonymous</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
