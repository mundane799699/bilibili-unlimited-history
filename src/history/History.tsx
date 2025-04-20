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
    <div className="container">
      <div className="header">
        <h1>Bilibili 历史记录</h1>
        <input
          type="text"
          className="search-box"
          placeholder="搜索历史记录..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      <div className="history-list">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((item) => (
            <HistoryItem key={item.id} item={item} />
          ))
        ) : (
          <div className="loading">暂无历史记录</div>
        )}
      </div>
      <button
        className={`back-to-top ${showBackToTop ? "visible" : ""}`}
        onClick={handleBackToTop}
        title="返回顶部"
      >
        ↑
      </button>
    </div>
  );
};
