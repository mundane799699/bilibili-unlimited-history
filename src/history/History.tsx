import React, { useState, useEffect, useRef, useCallback } from "react";
import { HistoryItem } from "../components/HistoryItem";
import { getHistory } from "../utils/db";
import { HistoryItem as HistoryItemType } from "../types";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { useDebounce } from "use-debounce";

export const History: React.FC = () => {
  const [history, setHistory] = useState<HistoryItemType[]>([]);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword] = useDebounce(keyword, 300);
  const currentPageRef = useRef(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isLoadingRef = useRef<boolean>(false);

  // 使用useCallback记忆化loadHistory函数
  const loadHistory = useCallback(
    async (page: number = 0) => {
      if (isLoadingRef.current) {
        return;
      }

      try {
        setIsLoading(true);
        isLoadingRef.current = true;
        const { items, hasMore } = await getHistory(page, 20, debouncedKeyword);

        if (page === 0) {
          setHistory(items);
        } else {
          setHistory((prev) => [...prev, ...items]);
        }

        currentPageRef.current = currentPageRef.current + 1;
        setHasMore(hasMore);
      } catch (error) {
        console.error("Failed to load history:", error);
      } finally {
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    },
    [debouncedKeyword]
  ); // 使用debouncedKeyword作为依赖项

  // 当debouncedKeyword变化时重新加载数据
  useEffect(() => {
    currentPageRef.current = 0;
    loadHistory(0);
  }, [debouncedKeyword, loadHistory]);

  useEffect(() => {
    const options = {
      threshold: 0.1,
      rootMargin: "20px",
    };
    // 设置Intersection Observer
    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoadingRef.current) {
        loadHistory(currentPageRef.current);
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
  }, [hasMore, loadHistory]);

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="flex justify-between items-center mb-5 sticky top-0 bg-white py-4 z-10">
        <h1 className="text-2xl font-bold">Bilibili 无限历史记录</h1>
        <input
          type="text"
          className="w-[300px] px-2 py-2 mr-2 border border-gray-200 rounded"
          placeholder="搜索历史记录..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
        {history.length > 0 ? (
          history.map((item) => <HistoryItem key={item.id} item={item} />)
        ) : (
          <div className="text-center py-5 text-gray-600">
            {keyword.trim() ? "没有找到匹配的历史记录" : "暂无历史记录"}
          </div>
        )}
      </div>
      <div ref={loadMoreRef} className="text-center my-8">
        {isLoading ? "加载中..." : hasMore ? "向下滚动加载更多" : "没有更多了"}
      </div>
      <ScrollToTopButton />
    </div>
  );
};
