import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { History } from "./History";
import { About } from "./About";
import { Sidebar } from "../components/Sidebar";
import ScrollToTopButton from "../components/ScrollToTopButton";

const App = () => {
  return (
    <HashRouter>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        {/* 主内容区域 */}
        <div className="flex-1 overflow-auto">
          <div>
            <Routes>
              <Route path="/" element={<History />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <ScrollToTopButton />
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
