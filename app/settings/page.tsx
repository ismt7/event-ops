"use client";

import { useState, useEffect } from "react";
import defaultConfig from "@/event-ops.config";
import { storage } from "@/lib/storage";

export default function Settings() {
  const [config, setConfig] = useState(defaultConfig);
  const [message, setMessage] = useState("");

  // 初期表示時にストレージから設定を読み込む
  useEffect(() => {
    const storedConfig =
      storage.getItem<Partial<typeof defaultConfig>>("config");
    if (storedConfig) {
      setConfig((prevConfig) => ({
        ...prevConfig,
        ...storedConfig,
        shortUrl: {
          ...prevConfig.shortUrl,
          ...storedConfig.shortUrl,
        },
        connpass: {
          ...prevConfig.connpass,
          ...storedConfig.connpass,
        },
      }));
    }
  }, []);

  const handleSave = () => {
    storage.setItem("config", config);
    setMessage("設定が保存されました！");
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">設定</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="prefix"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                プレフィックス
              </label>
              <input
                type="text"
                id="prefix"
                value={config.prefix}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, prefix: e.target.value }))
                }
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <label
                htmlFor="shortUrlBase"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                短縮URLベース
              </label>
              <input
                type="text"
                id="shortUrlBase"
                value={config.shortUrl.baseUrl}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    shortUrl: { ...prev.shortUrl, baseUrl: e.target.value },
                  }))
                }
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <label
                htmlFor="connpassBase"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                connpassベースURL
              </label>
              <input
                type="text"
                id="connpassBase"
                value={config.connpass.baseUrl}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    connpass: { ...prev.connpass, baseUrl: e.target.value },
                  }))
                }
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <label
                htmlFor="exportFileName"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                エクスポートファイル名
              </label>
              <input
                type="text"
                id="exportFileName"
                value={config.exportFileName || ""}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    exportFileName: e.target.value,
                  }))
                }
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>
          <button
            onClick={handleSave}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow-md transition"
          >
            保存
          </button>
          {message && (
            <p className="mt-4 text-green-600 font-semibold">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
