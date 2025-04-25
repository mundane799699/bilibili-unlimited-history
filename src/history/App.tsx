import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { History } from "./History";
import { About } from "./About";
import { Sidebar } from "../components/Sidebar";
import Settings from "./Settings";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { useRef } from "react";

const App = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <HashRouter>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        {/* 主内容区域 */}
        <div ref={containerRef} className="flex-1 overflow-auto">
          <div>
            <Routes>
              <Route path="/" element={<History />} />
              <Route path="/about" element={<About />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <ScrollToTopButton containerRef={containerRef} />
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
