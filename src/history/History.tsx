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

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isLoadingRef = useRef<boolean>(false);

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
        40,
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
      rootMargin: "200px",
    };
    // 设置Intersection Observer
    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoadingRef.current) {
        // 闭包陷阱，这个函数会捕获第一次渲染时的history值
        // debouncedKeyword也是一样的问题
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
  }, [hasMore, debouncedKeyword]);

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
      <div className="flex justify-between items-center mb-5 sticky top-0 bg-white py-4 z-10 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Bilibili 无限历史记录</h1>
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
          <HistoryItem
            key={item.id}
            item={item}
            onDelete={() => {
              // 从列表中移除被删除的项
              setHistory((prev) => prev.filter((h) => h.id !== item.id));
            }}
          />
        ))}
      </div>
      <div ref={loadMoreRef} className="text-center my-8">
        {getLoadMoreText()}
      </div>
    </div>
  );
};
