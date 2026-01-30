"use client";

import { useState, useEffect } from "react";
import defaultConfig from "@/event-ops.config";
import { storage } from "@/lib/storage";

export default function Settings() {
  const [config, setConfig] = useState(defaultConfig);
  const [openAiApiKey, setOpenAiApiKey] = useState("");
  const [openAiTitlePromptInstruction, setOpenAiTitlePromptInstruction] =
    useState("");
  const [openAiAnswerPromptInstruction, setOpenAiAnswerPromptInstruction] =
    useState("");
  const [openAiModel, setOpenAiModel] = useState("gpt-4.1-mini");
  const [openAiModels, setOpenAiModels] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState("");
  const [isModelListOpen, setIsModelListOpen] = useState(false);
  const [highlightedModelIndex, setHighlightedModelIndex] = useState(-1);
  const [message, setMessage] = useState("");

  const modelOptions =
    openAiModels.length === 0
      ? [openAiModel]
      : openAiModels.includes(openAiModel)
        ? openAiModels
        : [openAiModel, ...openAiModels];
  const filteredModels = modelOptions.filter((model) =>
    model.toLowerCase().includes(openAiModel.trim().toLowerCase())
  );

  // 初期表示時にストレージから設定を読み込む
  useEffect(() => {
    const storedConfig =
      storage.getItem<Partial<typeof defaultConfig>>("config");
    if (storedConfig) {
      setConfig((prevConfig) => ({
        ...prevConfig,
        ...storedConfig,
        prefix: storedConfig.prefix || prevConfig.prefix,
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
    const storedOpenAiApiKey = storage.getItem<string>("openAiApiKey");
    if (storedOpenAiApiKey) {
      setOpenAiApiKey(storedOpenAiApiKey);
    }
    const storedTitlePromptInstruction = storage.getItem<string>(
      "openAiTitlePromptInstruction"
    );
    const storedAnswerPromptInstruction = storage.getItem<string>(
      "openAiAnswerPromptInstruction"
    );
    const storedLegacyPromptInstruction = storage.getItem<string>(
      "openAiPromptInstruction"
    );
    if (storedTitlePromptInstruction) {
      setOpenAiTitlePromptInstruction(storedTitlePromptInstruction);
    } else if (storedLegacyPromptInstruction) {
      setOpenAiTitlePromptInstruction(storedLegacyPromptInstruction);
    }
    if (storedAnswerPromptInstruction) {
      setOpenAiAnswerPromptInstruction(storedAnswerPromptInstruction);
    } else if (storedLegacyPromptInstruction) {
      setOpenAiAnswerPromptInstruction(storedLegacyPromptInstruction);
    }

    const storedOpenAiModel = storage.getItem<string>("openAiModel");
    if (storedOpenAiModel) {
      setOpenAiModel(storedOpenAiModel);
    }
    const storedOpenAiModels = storage.getItem<string[]>("openAiModels");
    if (storedOpenAiModels) {
      setOpenAiModels(storedOpenAiModels);
    }
  }, []);

  const fetchModels = async () => {
    if (!openAiApiKey) {
      setModelsError("モデル一覧の取得にはAPIキーが必要です。");
      return;
    }

    setModelsLoading(true);
    setModelsError("");

    try {
      const response = await fetch("/api/openai-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: openAiApiKey }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        models?: string[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "モデル一覧の取得に失敗しました。"
        );
      }

      const list = Array.isArray(data.models) ? data.models : [];
      setOpenAiModels(list);
      storage.setItem("openAiModels", list);
    } catch (error) {
      setModelsError("モデル一覧の取得に失敗しました。");
    } finally {
      setModelsLoading(false);
    }
  };

  useEffect(() => {
    if (openAiApiKey && openAiModels.length === 0) {
      void fetchModels();
    }
    // openAiModels is intentionally excluded to avoid re-fetching after load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openAiApiKey]);

  const handleSave = () => {
    storage.setItem("config", config);
    storage.setItem("openAiApiKey", openAiApiKey);
    storage.setItem("openAiTitlePromptInstruction", openAiTitlePromptInstruction);
    storage.setItem(
      "openAiAnswerPromptInstruction",
      openAiAnswerPromptInstruction
    );
    storage.setItem("openAiModel", openAiModel);
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
            <div>
              <label
                htmlFor="openAiApiKey"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                ChatGPT APIキー
              </label>
              <input
                type="password"
                id="openAiApiKey"
                value={openAiApiKey}
                onChange={(e) => setOpenAiApiKey(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="sk-..."
                autoComplete="off"
              />
              <p className="mt-1 text-xs text-gray-500">
                APIキーはローカルストレージに保存されます。
              </p>
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="openAiModel"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                ChatGPT モデル
              </label>
              <div className="flex items-start gap-2">
                <div className="relative w-full">
                  <input
                    id="openAiModel"
                    value={openAiModel}
                    onChange={(e) => {
                      setOpenAiModel(e.target.value);
                      setHighlightedModelIndex(-1);
                      setIsModelListOpen(true);
                    }}
                    onFocus={() => setIsModelListOpen(true)}
                    onBlur={() => {
                      setTimeout(() => setIsModelListOpen(false), 120);
                    }}
                    onKeyDown={(event) => {
                      if (!isModelListOpen) {
                        if (
                          event.key === "ArrowDown" ||
                          event.key === "ArrowUp"
                        ) {
                          setIsModelListOpen(true);
                          setHighlightedModelIndex(0);
                          event.preventDefault();
                        }
                        return;
                      }

                      if (event.key === "ArrowDown") {
                        event.preventDefault();
                        setHighlightedModelIndex((prev) => {
                          const next = prev + 1;
                          return next >= filteredModels.length ? 0 : next;
                        });
                        return;
                      }

                      if (event.key === "ArrowUp") {
                        event.preventDefault();
                        setHighlightedModelIndex((prev) => {
                          const next = prev - 1;
                          return next < 0
                            ? Math.max(filteredModels.length - 1, 0)
                            : next;
                        });
                        return;
                      }

                      if (event.key === "Enter") {
                        if (
                          highlightedModelIndex >= 0 &&
                          highlightedModelIndex < filteredModels.length
                        ) {
                          event.preventDefault();
                          setOpenAiModel(
                            filteredModels[highlightedModelIndex]
                          );
                          setIsModelListOpen(false);
                        }
                        return;
                      }

                      if (event.key === "Escape") {
                        setIsModelListOpen(false);
                        setHighlightedModelIndex(-1);
                      }
                    }}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="モデル名で絞り込み"
                  />
                  {isModelListOpen && (
                    <div className="absolute z-10 mt-1 w-full rounded border border-gray-200 bg-white shadow-lg">
                      {filteredModels.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          該当するモデルがありません
                        </div>
                      ) : (
                        <ul className="max-h-48 overflow-auto py-1 text-sm text-gray-700">
                          {filteredModels.map((model, index) => (
                            <li key={model}>
                              <button
                                type="button"
                                onMouseDown={(event) => {
                                  event.preventDefault();
                                  setOpenAiModel(model);
                                  setIsModelListOpen(false);
                                }}
                                className={`w-full px-3 py-2 text-left hover:bg-gray-100 ${
                                  index === highlightedModelIndex
                                    ? "bg-gray-100"
                                    : ""
                                }`}
                              >
                                {model}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={fetchModels}
                  disabled={modelsLoading}
                  className="inline-flex items-center justify-center rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="モデル一覧を更新"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`h-4 w-4 ${modelsLoading ? "animate-spin" : ""}`}
                  >
                    <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                    <polyline points="22 4 21 12 13 11" />
                  </svg>
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                モデル一覧は初回のみ取得し、必要に応じて更新できます。
              </p>
              {modelsError && (
                <p className="mt-1 text-xs text-red-600">{modelsError}</p>
              )}
            </div>
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="openAiTitlePromptInstruction"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  ChatGPT プロンプト指示（見出し用）
                </label>
                <textarea
                  id="openAiTitlePromptInstruction"
                  value={openAiTitlePromptInstruction}
                  onChange={(e) =>
                    setOpenAiTitlePromptInstruction(e.target.value)
                  }
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="例: 20文字以内で作成してください。"
                  rows={3}
                />
                <p className="mt-1 text-xs text-gray-500">
                  見出し生成時の追加指示としてプロンプトに付与されます。
                </p>
              </div>
              <div>
                <label
                  htmlFor="openAiAnswerPromptInstruction"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  ChatGPT プロンプト指示（回答用）
                </label>
                <textarea
                  id="openAiAnswerPromptInstruction"
                  value={openAiAnswerPromptInstruction}
                  onChange={(e) =>
                    setOpenAiAnswerPromptInstruction(e.target.value)
                  }
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="例: 丁寧な文体で、箇条書きを避けてください。"
                  rows={3}
                />
                <p className="mt-1 text-xs text-gray-500">
                  回答生成時の追加指示としてプロンプトに付与されます。
                </p>
              </div>
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
