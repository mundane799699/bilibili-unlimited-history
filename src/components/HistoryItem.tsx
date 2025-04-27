import { HistoryItem as HistoryItemType } from "../types";
import { getContentUrl } from "../utils/api";
import { Trash2 } from "lucide-react";
import { deleteHistoryItem } from "../utils/db";
import { getStorageValue } from "../utils/storage";
import { toast } from "react-hot-toast";
import { IS_SYNC_DELETE } from "../utils/constants";

interface HistoryItemProps {
  item: HistoryItemType;
  onDelete?: () => void;
}

const getTypeTag = (business: string): string => {
  switch (business) {
    case "live":
      return "直播";
    case "article":
    case "article-list":
      return "专栏";
    default:
      return "";
  }
};

const deleteBilibiliHistory = async (
  business: string,
  id: string
): Promise<void> => {
  await new Promise((resolve, reject) => {
    chrome.tabs.query({ url: "*://*.bilibili.com/*" }, (tabs) => {
      if (tabs.length === 0) {
        reject(new Error("请先打开一个B站标签页或者关闭同步删除"));
        return;
      }
      // 向第一个找到的B站标签页发送消息
      chrome.tabs.sendMessage(
        tabs[0].id!,
        {
          action: "deleteHistory",
          kid: `${business}_${id}`,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          if (response.success) {
            resolve(response);
          } else {
            reject(new Error(response.error));
          }
        }
      );
    });
  });
};

export const HistoryItem: React.FC<HistoryItemProps> = ({ item, onDelete }) => {
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const isSyncDelete = await getStorageValue(IS_SYNC_DELETE, true);
      if (isSyncDelete) {
        // 先删除B站服务器上的历史记录
        await deleteBilibiliHistory(item.business, item.id);
        console.log("删除B站服务器上的历史记录成功");
      }
      // 删除本地数据库中的历史记录
      await deleteHistoryItem(item.id);
      onDelete?.();
    } catch (error) {
      console.error("删除历史记录失败:", error);
      toast.error(error instanceof Error ? error.message : "删除历史记录失败");
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden transition-transform duration-200 hover:shadow-lg">
      <a
        href={getContentUrl(item)}
        target="_blank"
        rel="noopener noreferrer"
        className="no-underline text-inherit"
      >
        <div>
          <div className="relative">
            <img
              src={item.cover}
              alt={item.title}
              className="w-full h-40 object-cover"
            />
            {getTypeTag(item.business) && (
              <span className="absolute bottom-2 right-2 px-2 py-1 rounded text-xs text-white bg-[#fb7299]">
                {getTypeTag(item.business)}
              </span>
            )}
          </div>
          <div className="p-2.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="m-0 text-sm leading-[1.4] h-10 overflow-hidden line-clamp-2 flex-1">
                {item.title}
              </h3>
              <button
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="text-gray-500 text-xs mt-1">
              观看时间：{new Date(item.viewTime * 1000).toLocaleString()}
            </div>
          </div>
        </div>
      </a>
    </div>
  );
};
