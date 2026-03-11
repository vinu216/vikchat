import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/react-app/pages/Home";
import ChatRoom from "@/react-app/pages/ChatRoom";
import VideoChat from "@/react-app/pages/VideoChat";
import About from "@/react-app/pages/About";
import Support from "@/react-app/pages/Support";
import Terms from "@/react-app/pages/Terms";
import Privacy from "@/react-app/pages/Privacy";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<ChatRoom />} />
        <Route path="/video" element={<VideoChat />} />
        <Route path="/about" element={<About />} />
        <Route path="/support" element={<Support />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
