import { useState } from "react";
import { clearHistory } from "../utils/db";

const Settings = () => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const [showResetResultDialog, setShowResetResultDialog] = useState(false);
  const [resetResult, setResetResult] = useState("");
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [resetStatus, setResetStatus] = useState("");

  const handleReset = async () => {
    try {
      setIsResetLoading(true);
      setResetStatus("正在清空历史记录...");
      await clearHistory();
      setResetStatus("正在清理存储...");
      await chrome.storage.local.clear();
      setResetStatus("正在重新加载...");
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
  return (
    <div className="p-4 flex flex-col container mx-auto items-center">
      <button
        onClick={() => setShowConfirmDialog(true)}
        className="w-40 px-3 py-1 text-sm text-red-600 hover:text-red-900 border border-red-200 rounded hover:border-red-300 transition-colors"
        disabled={isResetLoading}
      >
        恢复出厂设置
      </button>

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

export default Settings;
