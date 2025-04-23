import React from "react";

export const About: React.FC = () => {
  return (
    <div className="max-w-[800px] mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">关于 Bilibili 无限历史记录</h1>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">简介</h2>
          <div className="text-gray-600 text-base space-y-4">
            <p>Bilibili 无限历史记录是一个浏览器扩展。</p>
            <p>
              由于b站本身的历史记录有存储上限，而我个人希望可以查看更久远的历史记录，所以开发了这个扩展。
            </p>
            <p>
              初次使用时，请点击该扩展图标，然后点击"立即同步"按钮，即可同步你的B站历史记录到本地。
            </p>
            <p>
              同步完成后，点击"打开历史记录页面"按钮，即可打开历史记录页面查看。所有数据都存储在本地indexedDB中。
            </p>
            <p>每隔1分钟，会自动增量的同步一次你的B站历史记录。</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">功能特点</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2 text-base">
            <li>突破 Bilibili 历史记录的数量限制</li>
            <li>支持按时间排序浏览历史记录</li>
            <li>支持按视频标题搜索历史记录</li>
            <li>自动同步最新的观看记录</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">使用说明</h2>
          <ol className="list-decimal list-inside text-gray-600 space-y-2 text-base">
            <li>安装扩展后，点击扩展图标</li>
            <li>点击立即同步按钮会全量同步你的 Bilibili 观看历史</li>
            <li>同步完成后，点击打开历史记录页面按钮，即可查看历史记录</li>
            <li>可以使用搜索框搜索特定的历史记录</li>
            <li>向下滚动可以加载更多历史记录</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">隐私说明</h2>
          <p className="text-gray-600 text-base">
            本扩展仅用于同步和展示你的 Bilibili
            观看历史，所有数据都存储在本地，不会上传到任何服务器。
            我们不会收集任何个人信息或浏览数据。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">建议反馈</h2>
          <a
            className="text-blue-500 hover:underline text-base"
            href="https://c1p0xw7om7n.feishu.cn/share/base/form/shrcneS0t8RdC3byY9xC5ftQgub"
            target="_blank"
          >
            点击这里反馈建议
          </a>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">版本信息</h2>
          <p className="text-gray-600 text-base">当前版本：1.0.0</p>
        </section>
      </div>
    </div>
  );
};
