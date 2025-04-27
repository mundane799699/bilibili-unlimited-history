import { openDB, getItem } from "../utils/db";

// 初始化定时任务
chrome.runtime.onInstalled.addListener((details) => {
  // 设置每分钟同步一次
  chrome.alarms.create("syncHistory", {
    periodInMinutes: 1,
  });

  // 只在首次安装时打开 about 页面
  if (details.reason === "install") {
    chrome.tabs.create({ url: "about/index.html" });
  }
});

// 监听定时任务
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "syncHistory") {
    // 使用立即执行的异步函数处理定时任务
    (async () => {
      try {
        // 检查是否正在同步
        const isSyncing = await getStorageValue("isSyncing");
        if (isSyncing) {
          console.log("同步正在进行中，跳过本次定时同步");
          return;
        }

        // 设置同步状态为进行中
        await setStorageValue("isSyncing", true);

        // 执行增量同步
        await syncHistory(false);
      } catch (error) {
        console.error("定时同步失败:", error);
      } finally {
        // 无论成功还是失败，都重置同步状态
        await setStorageValue("isSyncing", false);
      }
    })();
  }
});

// 从 chrome.storage.local 获取值的异步函数
async function getStorageValue(key: string): Promise<any> {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key]);
    });
  });
}

// 设置 chrome.storage.local 值的异步函数
async function setStorageValue(key: string, value: any): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, resolve);
  });
}

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "syncHistory") {
    // 使用立即执行的异步函数处理消息
    (async () => {
      try {
        // 检查是否正在同步
        const isSyncing = await getStorageValue("isSyncing");
        if (isSyncing) {
          console.log("同步正在进行中，请稍后再试");
          sendResponse({ success: false, error: "同步正在进行中，请稍后再试" });
          return;
        }

        // 设置同步状态为进行中
        await setStorageValue("isSyncing", true);

        // 之前有没有全量同步过
        const hasFullSync = await getStorageValue("hasFullSync");
        if (hasFullSync) {
          await syncHistory(false);
          // 如果已经有同步记录，直接返回成功
          sendResponse({ success: true, message: "增量同步成功" });
        } else {
          // 如果没有同步记录，执行全量同步
          await syncHistory(true);
          await setStorageValue("hasFullSync", true);
          sendResponse({ success: true, message: "首次全量同步成功" });
        }
      } catch (error) {
        console.error("同步失败:", error);
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : "未知错误",
        });
      } finally {
        // 无论成功还是失败，都重置同步状态
        await setStorageValue("isSyncing", false);
      }
    })();

    return true; // 保持消息通道开放
  } else if (request.action === "getCookies") {
    chrome.cookies.getAll({ domain: "bilibili.com" }, (cookies) => {
      sendResponse({ success: true, cookies });
    });
    return true;
  }
});

// 全量同步历史记录
async function syncHistory(isFullSync = false): Promise<boolean> {
  try {
    // 获取 B 站 cookie
    const cookies = await chrome.cookies.getAll({
      domain: "bilibili.com",
    });
    const SESSDATA = cookies.find(
      (cookie) => cookie.name === "SESSDATA"
    )?.value;

    if (!SESSDATA) {
      throw new Error("未找到 B 站登录信息，请先登录 B 站");
    }

    let hasMore = true;
    let max = 0;
    let view_at = 0;
    let type = "all";
    let ps = 30;

    // 循环获取所有历史记录
    while (hasMore) {
      // 获取历史记录
      const response = await fetch(
        `https://api.bilibili.com/x/web-interface/history/cursor?max=${max}&view_at=${view_at}&type=${type}&ps=${ps}`,
        {
          headers: {
            Cookie: `SESSDATA=${SESSDATA}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("获取历史记录失败");
      }

      const data = await response.json();

      if (data.code !== 0) {
        throw new Error(data.message || "获取历史记录失败");
      }

      // 更新分页参数
      hasMore = data.data.list.length > 0;
      max = data.data.cursor.max;
      view_at = data.data.cursor.view_at;

      if (data.data.list.length > 0) {
        // 为每批数据创建新的事务
        const db = await openDB();
        const tx = db.transaction("history", "readwrite");
        const store = tx.objectStore("history");
        // 取出list中的第一条和最后一条
        if (!isFullSync) {
          const firstItem = data.data.list[0];
          const lastItem = data.data.list[data.data.list.length - 1];
          // 如果firstItem的bvid和lastItem的bvid在indexedDB中存在，则不进行同步
          const firstItemExists = await getItem(store, firstItem.history.oid);
          const lastItemExists = await getItem(store, lastItem.history.oid);
          if (firstItemExists && lastItemExists) {
            console.log("增量同步至此结束");
            hasMore = false;
          }
        }

        // 批量存储历史记录
        for (const item of data.data.list) {
          // put是异步的
          store.put({
            id: item.history.oid,
            business: item.history.business,
            bvid: item.history.bvid,
            title: item.title,
            cover: item.cover || (item.covers && item.covers[0]),
            viewTime: item.view_at,
            author_name: item.author_name || "",
            author_mid: item.author_mid || "",
            timestamp: Date.now(),
          });
        }
        console.log(`同步了${data.data.list.length}条历史记录`);

        // 等待事务完成
        await new Promise((resolve, reject) => {
          tx.oncomplete = resolve;
          tx.onerror = () => reject(tx.error);
        });

        // 添加延时，避免请求过于频繁
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // 更新最后同步时间
    await chrome.storage.local.set({ lastSync: Date.now() });

    return true;
  } catch (error) {
    console.error("同步历史记录失败:", error);
    throw error;
  }
}
