import { HistoryItem as HistoryItemType } from "../types";
import { getContentUrl } from "../utils/api";

interface HistoryItemProps {
  item: HistoryItemType;
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

export const HistoryItem: React.FC<HistoryItemProps> = ({ item }) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
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
            <h3 className="m-0 text-sm leading-[1.4] h-10 overflow-hidden line-clamp-2">
              {item.title}
            </h3>
            <div className="text-gray-500 text-xs mt-1">
              观看时间：{new Date(item.viewTime * 1000).toLocaleString()}
            </div>
          </div>
        </div>
      </a>
    </div>
  );
};
