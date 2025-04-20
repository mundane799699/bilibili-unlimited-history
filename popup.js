document.addEventListener("DOMContentLoaded", function () {
  const openHistoryBtn = document.getElementById("openHistory");
  const syncNowBtn = document.getElementById("syncNow");
  const statusDiv = document.getElementById("status");

  // 打开历史记录页面
  openHistoryBtn.addEventListener("click", function () {
    chrome.tabs.create({
      url: "history.html",
    });
  });

  // 立即同步按钮
  syncNowBtn.addEventListener("click", function () {
    statusDiv.textContent = "正在同步...";
    chrome.runtime.sendMessage({ action: "syncHistory" }, function (response) {
      if (response && response.success) {
        statusDiv.textContent = response.message;
      } else {
        statusDiv.textContent =
          "同步失败：" + (response ? response.error : "未知错误");
      }
    });
  });

  // 检查同步状态
  chrome.storage.local.get(["lastSync"], function (result) {
    if (result.lastSync) {
      const lastSync = new Date(result.lastSync);
      statusDiv.textContent = `上次同步时间：${lastSync.toLocaleString()}`;
    } else {
      statusDiv.textContent = "尚未同步过历史记录";
    }
  });
});
