import React, { useState, useEffect } from "react";
import { HistoryItem } from "../components/HistoryItem";
import { getHistory } from "../utils/db";
import { HistoryItem as HistoryItemType } from "../types";

export const History: React.FC = () => {
  const [history, setHistory] = useState<HistoryItemType[]>([]);
  const [searchText, setSearchText] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    loadHistory();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getHistory();
      setHistory(data.sort((a, b) => b.viewTime - a.viewTime));
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  };

  const handleScroll = () => {
    setShowBackToTop(window.scrollY > 300);
  };

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredHistory = history.filter((item) =>
    item.title.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Bilibili 历史记录</h1>
        <input
          type="text"
          className="w-[300px] px-2 py-2 border border-gray-200 rounded"
          placeholder="搜索历史记录..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((item) => (
            <HistoryItem key={item.id} item={item} />
          ))
        ) : (
          <div className="text-center py-5 text-gray-600">暂无历史记录</div>
        )}
      </div>
      <button
        className={`fixed bottom-[30px] right-[30px] w-[50px] h-[50px] bg-[#fb7299] text-white rounded-xl cursor-pointer flex items-center justify-center text-2xl transition-all duration-300 shadow-[0_2px_10px_rgba(251,114,153,0.3)] hover:bg-[#fc8bab] hover:translate-y-[-5px] ${
          showBackToTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-5"
        }`}
        onClick={handleBackToTop}
        title="返回顶部"
      >
        ↑
      </button>
    </div>
  );
};
