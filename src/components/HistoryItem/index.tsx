import { HistoryItem as HistoryItemType } from "../../types";
import { getContentUrl } from "../../utils/api";

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
    <div className="history-item">
      <a
        href={getContentUrl(item)}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div className="history-item-wrapper">
          <div className="history-item-image">
            <img src={item.cover} alt={item.title} />
            {getTypeTag(item.business) && (
              <span className="type-tag">{getTypeTag(item.business)}</span>
            )}
          </div>
          <div className="history-item-content">
            <h3 className="history-item-title">{item.title}</h3>
            <div className="history-item-time">
              观看时间：{new Date(item.viewTime * 1000).toLocaleString()}
            </div>
          </div>
        </div>
      </a>
    </div>
  );
};
