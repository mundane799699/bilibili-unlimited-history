import React, { useState, useEffect, useRef, useCallback } from "react";
import { HistoryItem } from "../components/HistoryItem";
import { getHistory, clearHistory } from "../utils/db";
import { HistoryItem as HistoryItemType } from "../types";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { useDebounce } from "use-debounce";

export const History: React.FC = () => {
  const [history, setHistory] = useState<HistoryItemType[]>([]);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword] = useDebounce(keyword, 500);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [resetStatus, setResetStatus] = useState("");
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isLoadingRef = useRef<boolean>(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showResetResultDialog, setShowResetResultDialog] = useState(false);
  const [resetResult, setResetResult] = useState("");

  const loadHistory = async (isAppend: boolean = false) => {
    if (isLoadingRef.current) {
      return;
    }

    try {
      setIsLoading(true);
      isLoadingRef.current = true;

      // 使用函数式更新来获取最新的history值
      const lastViewTime = isAppend
        ? await new Promise<number | "">((resolve) => {
            setHistory((currentHistory) => {
              const lastTime =
                currentHistory.length > 0
                  ? currentHistory[currentHistory.length - 1].viewTime
                  : "";
              resolve(lastTime);
              return currentHistory;
            });
          })
        : "";

      const { items, hasMore } = await getHistory(
        lastViewTime,
        20,
        debouncedKeyword
      );

      if (isAppend) {
        setHistory((prev) => [...prev, ...items]);
      } else {
        setHistory(items);
      }

      setHasMore(hasMore);
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  };

  // 当debouncedKeyword变化时重新加载数据
  useEffect(() => {
    loadHistory(false);
  }, [debouncedKeyword]);

  useEffect(() => {
    const options = {
      threshold: 0.1,
      rootMargin: "20px",
    };
    // 设置Intersection Observer
    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoadingRef.current) {
        // 闭包陷阱，这个函数会捕获第一次渲染时的history值
        loadHistory(true);
      }
    }, options);

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore]);

  const handleReset = async () => {
    try {
      setIsResetLoading(true);
      setResetStatus("正在清空历史记录...");
      await clearHistory();
      setResetStatus("正在清理存储...");
      await chrome.storage.local.clear();
      setResetStatus("正在重新加载...");
      await loadHistory(false);
      setResetResult("恢复出厂设置成功！");
    } catch (error) {
      console.error("恢复出厂设置失败:", error);
      setResetResult("恢复出厂设置失败，请重试！");
    } finally {
      setIsResetLoading(false);
      setResetStatus("");
      setShowResetResultDialog(true);
      setShowConfirmDialog(false);
    }
  };

  const getLoadMoreText = () => {
    if (history.length === 0) {
      return keyword.trim() ? "没有找到匹配的历史记录" : "暂无历史记录";
    }
    return isLoading
      ? "加载中..."
      : hasMore
      ? "向下滚动加载更多"
      : "没有更多了";
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="flex justify-between items-center mb-5 sticky top-0 bg-white py-4 z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Bilibili 无限历史记录</h1>
          <button
            onClick={() => chrome.tabs.create({ url: "about/index.html" })}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded hover:border-gray-300 transition-colors"
          >
            关于
          </button>
          <button
            onClick={() => setShowConfirmDialog(true)}
            className="px-3 py-1 text-sm text-red-600 hover:text-red-900 border border-red-200 rounded hover:border-red-300 transition-colors"
            disabled={isResetLoading}
          >
            恢复出厂设置
          </button>
        </div>
        <input
          type="text"
          className="w-[300px] px-2 py-2 mr-2 border border-gray-200 rounded"
          placeholder="搜索历史记录..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
        {history.map((item) => (
          <HistoryItem key={item.id} item={item} />
        ))}
      </div>
      <div ref={loadMoreRef} className="text-center my-8">
        {getLoadMoreText()}
      </div>
      <ScrollToTopButton />

      {/* 确认弹窗 */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">确认恢复出厂设置？</h3>
            <p className="text-gray-600 mb-6">
              此操作将删除所有本地存储的历史记录数据，且无法恢复。确定要继续吗？
            </p>
            {isResetLoading && (
              <p className="text-blue-600 mb-4">{resetStatus}</p>
            )}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isResetLoading}
              >
                取消
              </button>
              <button
                onClick={() => {
                  handleReset();
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isResetLoading}
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetResultDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <p className="text-xl text-gray-600 mb-6 text-center font-medium">
              {resetResult}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowResetResultDialog(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
