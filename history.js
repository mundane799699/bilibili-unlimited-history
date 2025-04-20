document.addEventListener("DOMContentLoaded", function () {
  const historyList = document.getElementById("historyList");
  const searchBox = document.querySelector(".search-box");
  const backToTopButton = document.getElementById("backToTop");
  let allHistory = [];

  // 返回顶部按钮逻辑
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      backToTopButton.classList.add("visible");
    } else {
      backToTopButton.classList.remove("visible");
    }
  });

  backToTopButton.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  // 加载历史记录
  async function loadHistory() {
    try {
      const db = await openDB();
      const tx = db.transaction("history", "readonly");
      const store = tx.objectStore("history");
      const request = store.getAll();

      request.onsuccess = () => {
        allHistory = request.result.sort((a, b) => b.viewTime - a.viewTime);
        renderHistory(allHistory);
      };

      request.onerror = () => {
        historyList.innerHTML =
          '<div class="loading">加载失败，请刷新页面重试</div>';
      };
    } catch (error) {
      console.error("加载历史记录失败:", error);
      historyList.innerHTML =
        '<div class="loading">加载失败，请刷新页面重试</div>';
    }
  }

  // 获取内容类型标签
  function getTypeTag(business) {
    let typeText = "";
    switch (business) {
      case "live":
        typeText = "直播";
        break;
      case "article":
        typeText = "专栏";
        break;
      case "article-list":
        typeText = "专栏";
        break;
      // archive 和 pgc 不显示标签
      case "archive":
      case "pgc":
        return "";
      default:
        typeText = "其他";
    }
    return typeText ? `<span class="type-tag">${typeText}</span>` : "";
  }

  // 获取内容链接
  function getContentUrl(item) {
    switch (item.business) {
      case "archive":
      case "pgc":
        return `https://www.bilibili.com/video/${item.bvid}`;
      case "article":
      case "article-list":
        return `https://www.bilibili.com/read/cv${item.id}`;
      case "live":
        return `https://live.bilibili.com/${item.id}`;
      default:
        return `https://www.bilibili.com/video/${item.bvid}`;
    }
  }

  // 渲染历史记录
  function renderHistory(history) {
    if (history.length === 0) {
      historyList.innerHTML = '<div class="loading">暂无历史记录</div>';
      return;
    }

    historyList.innerHTML = history
      .map(
        (item) => `
      <div class="history-item">
        <a href="${getContentUrl(
          item
        )}" target="_blank" style="text-decoration: none; color: inherit;">
          <div class="history-item-wrapper">
            <div class="history-item-image">
              <img src="${item.cover}" alt="${item.title}">
              ${getTypeTag(item.business)}
            </div>
            <div class="history-item-content">
              <h3 class="history-item-title">${item.title}</h3>
              <div class="history-item-time">观看时间：${new Date(
                item.viewTime * 1000
              ).toLocaleString()}</div>
            </div>
          </div>
        </a>
      </div>
    `
      )
      .join("");
  }

  // 搜索功能
  searchBox.addEventListener("input", function (e) {
    const searchText = e.target.value.toLowerCase();
    const filteredHistory = allHistory.filter((item) =>
      item.title.toLowerCase().includes(searchText)
    );
    renderHistory(filteredHistory);
  });

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

  // 初始加载
  loadHistory();
});
