// 监听页面加载完成事件
document.addEventListener("DOMContentLoaded", function () {
  // 检查是否在视频页面
  if (window.location.pathname.includes("/video/")) {
    // // 获取视频信息
    // const videoInfo = {
    //   bvid: window.location.pathname.split("/")[2],
    //   title: document.title.replace(" _哔哩哔哩_bilibili", ""),
    //   cover: document.querySelector(".video-cover img")?.src || "",
    //   viewTime: Math.floor(Date.now() / 1000),
    // };
    // // 存储到 IndexedDB
    // storeVideoInfo(videoInfo);
  }
});

// 存储视频信息到 IndexedDB
async function storeVideoInfo(videoInfo) {
  try {
    const db = await openDB();
    const tx = db.transaction("history", "readwrite");
    const store = tx.objectStore("history");

    await store.put({
      id: videoInfo.bvid,
      title: videoInfo.title,
      cover: videoInfo.cover,
      viewTime: videoInfo.viewTime,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("存储视频信息失败:", error);
  }
}

// 打开 IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("bilibiliHistory", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("history")) {
        db.createObjectStore("history", { keyPath: "id" });
      }
    };
  });
}
