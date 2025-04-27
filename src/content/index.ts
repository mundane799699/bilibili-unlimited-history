// 监听页面加载完成事件
document.addEventListener("DOMContentLoaded", () => {
  // 这里可以添加需要在页面加载完成后执行的逻辑
  console.log("Bilibili History Extension: Content script loaded");
});

// 监听来自popup或history页面的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "deleteHistory") {
    deleteHistory(request.kid)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error("删除历史记录失败:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // 保持消息通道开放
  }
});

// 删除历史记录的函数
async function deleteHistory(kid: string): Promise<void> {
  // 从background script获取cookie
  const cookies = await new Promise<chrome.cookies.Cookie[]>(
    (resolve, reject) => {
      chrome.runtime.sendMessage({ action: "getCookies" }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        if (response.success) {
          resolve(response.cookies);
        } else {
          reject(new Error(response.error));
        }
      });
    }
  );

  const bili_jct = cookies.find((cookie) => cookie.name === "bili_jct")?.value;
  const SESSDATA = cookies.find((cookie) => cookie.name === "SESSDATA")?.value;

  if (!bili_jct || !SESSDATA) {
    throw new Error("未找到必要的Cookie，请先登录B站");
  }

  const response = await fetch("https://api.bilibili.com/x/v2/history/delete", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Referer: "https://www.bilibili.com/",
      Origin: "https://www.bilibili.com",
    },
    body: `kid=${kid}&csrf=${bili_jct}`,
  });

  if (!response.ok) {
    throw new Error("删除历史记录失败");
  }

  const data = await response.json();

  if (data.code !== 0) {
    throw new Error(data.message || "删除历史记录失败");
  }
}
