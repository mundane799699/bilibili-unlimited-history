import React, { useState, useEffect } from "react";

export const Popup: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    // 检查同步状态
    chrome.storage.local.get(["lastSync"], (result) => {
      if (result.lastSync) {
        const lastSync = new Date(result.lastSync);
        setStatus(`上次同步时间：${lastSync.toLocaleString()}`);
      } else {
        setStatus("尚未同步过历史记录");
      }
    });
  }, []);

  const handleOpenHistory = () => {
    chrome.tabs.create({
      url: "history/index.html",
    });
  };

  const handleSync = () => {
    setIsSyncing(true);
    setStatus("正在同步...");

    chrome.runtime.sendMessage({ action: "syncHistory" }, (response) => {
      if (response && response.success) {
        setStatus(response.message);
      } else {
        setStatus("同步失败：" + (response ? response.error : "未知错误"));
      }
      setIsSyncing(false);
    });
  };

  return (
    <div className="container">
      <h2>Bilibili 历史记录</h2>
      <button
        className="sync-button"
        onClick={handleOpenHistory}
        disabled={isSyncing}
      >
        打开历史记录页面
      </button>
      <button className="sync-button" onClick={handleSync} disabled={isSyncing}>
        {isSyncing ? "同步中..." : "立即同步"}
      </button>
      {status && <div className="status">{status}</div>}
    </div>
  );
};
