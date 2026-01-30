"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid"; // UUID生成ライブラリをインポート
import LeadTextModal from "./components/LeadTextModal";
import QuestionList from "./components/QuestionList";
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  clearLocalStorage,
} from "./utils/storage";

interface Question {
  id: string;
  title: string;
  content: string;
  answer: string;
}

export default function EventReportPage() {
  const [reportTitle, setReportTitle] = useState("");
  const [homeEventTitle, setHomeEventTitle] = useState("");
  const [leadText, setLeadText] = useState("");
  const [seminarVideoUrl, setSeminarVideoUrl] = useState("");
  const [presentationUrl, setPresentationUrl] = useState("");
  const [openAiApiKey, setOpenAiApiKey] = useState("");
  const [openAiTitlePromptInstruction, setOpenAiTitlePromptInstruction] =
    useState("");
  const [openAiAnswerPromptInstruction, setOpenAiAnswerPromptInstruction] =
    useState("");
  const [openAiModel, setOpenAiModel] = useState("gpt-4.1-mini");
  const [questions, setQuestions] = useState<Question[]>([
    { id: uuidv4(), title: "", content: "", answer: "" },
  ]);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [isLeadTextModalOpen, setIsLeadTextModalOpen] = useState(false);
  const [generatingTitleIds, setGeneratingTitleIds] = useState<
    Record<string, boolean>
  >({});
  const [generatingAnswerIds, setGeneratingAnswerIds] = useState<
    Record<string, boolean>
  >({});
  const [chatGptError, setChatGptError] = useState<string | null>(null);

  useEffect(() => {
    const savedReportTitle = loadFromLocalStorage<string>("reportTitle");
    const savedLeadText = loadFromLocalStorage<string>("leadText");
    const savedSeminarVideoUrl =
      loadFromLocalStorage<string>("seminarVideoUrl");
    const savedPresentationUrl =
      loadFromLocalStorage<string>("presentationUrl");
    const savedQuestions = loadFromLocalStorage<Question[]>("questions");
    const savedOpenAiApiKey =
      loadFromLocalStorage<string>("openAiApiKey");
    const savedTitlePromptInstruction = loadFromLocalStorage<string>(
      "openAiTitlePromptInstruction"
    );
    const savedAnswerPromptInstruction = loadFromLocalStorage<string>(
      "openAiAnswerPromptInstruction"
    );
    const savedLegacyPromptInstruction = loadFromLocalStorage<string>(
      "openAiPromptInstruction"
    );
    const savedOpenAiModel = loadFromLocalStorage<string>("openAiModel");
    const savedAppState = loadFromLocalStorage<{ eventTitle?: string }>(
      "appState"
    );
    const savedLegacyEventTitle = loadFromLocalStorage<string>("eventTitle");

    if (savedReportTitle) setReportTitle(savedReportTitle);
    if (savedLeadText) setLeadText(savedLeadText);
    if (savedSeminarVideoUrl) setSeminarVideoUrl(savedSeminarVideoUrl);
    if (savedPresentationUrl) setPresentationUrl(savedPresentationUrl);
    if (savedQuestions) setQuestions(savedQuestions);
    if (savedOpenAiApiKey) setOpenAiApiKey(savedOpenAiApiKey);
    if (savedTitlePromptInstruction) {
      setOpenAiTitlePromptInstruction(savedTitlePromptInstruction);
    } else if (savedLegacyPromptInstruction) {
      setOpenAiTitlePromptInstruction(savedLegacyPromptInstruction);
    }
    if (savedAnswerPromptInstruction) {
      setOpenAiAnswerPromptInstruction(savedAnswerPromptInstruction);
    } else if (savedLegacyPromptInstruction) {
      setOpenAiAnswerPromptInstruction(savedLegacyPromptInstruction);
    }
    if (savedOpenAiModel) {
      setOpenAiModel(savedOpenAiModel);
    }
    if (savedAppState?.eventTitle) {
      setHomeEventTitle(savedAppState.eventTitle);
    } else if (savedLegacyEventTitle) {
      setHomeEventTitle(savedLegacyEventTitle);
    }
  }, []);

  const resolveReportTitle = (value: string) => {
    if (!value) return "";
    if (!homeEventTitle) return value;
    return value.replaceAll("{title}", homeEventTitle);
  };

  const handleSave = () => {
    saveToLocalStorage("reportTitle", reportTitle);
    saveToLocalStorage("leadText", leadText);
    saveToLocalStorage("seminarVideoUrl", seminarVideoUrl);
    saveToLocalStorage("presentationUrl", presentationUrl);
    saveToLocalStorage("questions", questions);
    alert("データを保存しました！");
  };

  const handleClear = () => {
    clearLocalStorage([
      "reportTitle",
      "leadText",
      "seminarVideoUrl",
      "presentationUrl",
      "questions",
    ]);
    setReportTitle("");
    setLeadText("");
    setSeminarVideoUrl("");
    setPresentationUrl("");
    setQuestions([{ id: uuidv4(), title: "", content: "", answer: "" }]);
    setActiveQuestionId(null);
    alert("データをクリアしました！");
  };

  const handleAddQuestion = () => {
    const newId = uuidv4();
    setQuestions([
      ...questions,
      { id: newId, title: "", content: "", answer: "" },
    ]);
    setActiveQuestionId(newId);
  };

  const requestChatGpt = async (prompt: string, instruction?: string) => {
    const fullPrompt = instruction
      ? `${prompt}\n\n追加指示:\n${instruction}`
      : prompt;
    const response = await fetch("/api/chatgpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: openAiApiKey,
        prompt: fullPrompt,
        model: openAiModel,
      }),
    });

    const data = (await response.json().catch(() => ({}))) as {
      text?: string;
      error?: string;
    };

    if (!response.ok) {
      throw new Error(
        typeof data.error === "string"
          ? data.error
          : "ChatGPTの呼び出しに失敗しました。"
      );
    }

    return typeof data.text === "string" ? data.text : "";
  };

  const handleGenerateTitle = async (id: string) => {
    if (!openAiApiKey) {
      setChatGptError(
        "ChatGPTを使うには設定画面でAPIキーを入力してください。"
      );
      return;
    }

    const question = questions.find((q) => q.id === id);
    if (!question?.content) {
      setChatGptError("見出しを生成するには質問内容を入力してください。");
      return;
    }

    setChatGptError(null);
    setGeneratingTitleIds((prev) => ({ ...prev, [id]: true }));

    try {
      const prompt = `次の質問内容から、イベントレポートのQ&A見出しを日本語で簡潔に1行で作成してください。\n\n質問内容:\n${question.content}\n\n既存の見出し:\n${question.title || "未設定"}`;
      const text = (
        await requestChatGpt(prompt, openAiTitlePromptInstruction)
      ).trim();
      if (text) {
        setQuestions((prev) =>
          prev.map((q) => (q.id === id ? { ...q, title: text } : q))
        );
      }
    } catch {
      setChatGptError("ChatGPTの呼び出しに失敗しました。");
    } finally {
      setGeneratingTitleIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleGenerateAnswer = async (id: string) => {
    if (!openAiApiKey) {
      setChatGptError(
        "ChatGPTを使うには設定画面でAPIキーを入力してください。"
      );
      return;
    }

    const question = questions.find((q) => q.id === id);
    if (!question?.content) {
      setChatGptError("回答を生成するには質問内容を入力してください。");
      return;
    }

    setChatGptError(null);
    setGeneratingAnswerIds((prev) => ({ ...prev, [id]: true }));

    try {
      const resolvedReportTitle = resolveReportTitle(reportTitle);
      const prompt = `次の質問に対するイベントレポート向けの回答を、日本語で簡潔にまとめてください。\n\nレポートタイトル:\n${resolvedReportTitle || "未設定"}\n\n質問:\n${question.content}\n\n既存の回答:\n${question.answer || "未設定"}`;
      const text = (
        await requestChatGpt(prompt, openAiAnswerPromptInstruction)
      ).trim();
      if (text) {
        setQuestions((prev) =>
          prev.map((q) => (q.id === id ? { ...q, answer: text } : q))
        );
      }
    } catch {
      setChatGptError("ChatGPTの呼び出しに失敗しました。");
    } finally {
      setGeneratingAnswerIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="p-6 min-h-screen bg-white">
      <LeadTextModal
        isOpen={isLeadTextModalOpen}
        leadText={leadText}
        onClose={() => setIsLeadTextModalOpen(false)}
        onSave={(text) => setLeadText(text)}
      />
      <div className="max-w-8xl mx-auto border border-gray-300 rounded-lg p-8">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6">
          レポート作成
        </h1>
        <div className="flex space-x-4">
          <div className="w-1/2">
            <form className="space-y-6">
              <div>
                <label
                  htmlFor="report-title"
                  className="block text-lg font-medium text-gray-700"
                >
                  レポートタイトル
                </label>
                <input
                  type="text"
                  id="report-title"
                  name="report-title"
                  className="mt-2 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-base p-2"
                  placeholder="レポートのタイトルを入力してください"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="lead-text"
                  className="block text-lg font-medium text-gray-700"
                >
                  リード文
                </label>
                <textarea
                  id="lead-text"
                  name="lead-text"
                  rows={3}
                  className="mt-2 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-base p-2"
                  placeholder="レポートの冒頭に表示するリード文を入力してください"
                  value={leadText}
                  onFocus={() => setIsLeadTextModalOpen(true)}
                  readOnly
                />
              </div>
              <div>
                <label
                  htmlFor="seminar-video-url"
                  className="block text-lg font-medium text-gray-700"
                >
                  セミナー動画URL
                </label>
                <input
                  type="text"
                  id="seminar-video-url"
                  name="seminar-video-url"
                  className="mt-2 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-base p-2"
                  placeholder="セミナー動画のURLを入力してください"
                  value={seminarVideoUrl}
                  onChange={(e) => setSeminarVideoUrl(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="presentation-url"
                  className="block text-lg font-medium text-gray-700"
                >
                  発表資料URL
                </label>
                <input
                  type="text"
                  id="presentation-url"
                  name="presentation-url"
                  className="mt-2 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-base p-2"
                  placeholder="発表資料のURLを入力してください"
                  value={presentationUrl}
                  onChange={(e) => setPresentationUrl(e.target.value)}
                />
              </div>
              {!openAiApiKey && (
                <p className="text-xs text-gray-500">
                  ChatGPTを使うには設定画面でAPIキーを入力してください。
                </p>
              )}
              {chatGptError && (
                <p className="text-xs text-red-600">{chatGptError}</p>
              )}
              <QuestionList
                questions={questions}
                activeQuestionId={activeQuestionId}
                onToggle={(id) =>
                  setActiveQuestionId((prev) => (prev === id ? null : id))
                }
                onAdd={handleAddQuestion}
                onRemove={(id) => {
                  setQuestions(questions.filter((q) => q.id !== id));
                  if (activeQuestionId === id) setActiveQuestionId(null);
                }}
                onUpdate={(id, field, value) =>
                  setQuestions(
                    questions.map((q) =>
                      q.id === id ? { ...q, [field]: value } : q
                    )
                  )
                }
                onGenerateTitle={handleGenerateTitle}
                onGenerateAnswer={handleGenerateAnswer}
                canUseChatGpt={!!openAiApiKey}
                generatingTitleIds={generatingTitleIds}
                generatingAnswerIds={generatingAnswerIds}
              />
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center px-5 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center px-5 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  クリア
                </button>
              </div>
            </form>
          </div>
          <div className="w-1/2">
            <button
              onClick={() => {
                const resolvedReportTitle = resolveReportTitle(reportTitle);
                const markdownContent = `# ${
                  resolvedReportTitle || "タイトル未設定"
                }

${leadText || "リード文未設定"}

[:contents]

${seminarVideoUrl ? `\n# セミナー動画\n\n[${seminarVideoUrl}:embed:cite]\n` : ""}
${presentationUrl ? `\n# 発表資料\n\n[${presentationUrl}:embed:cite]\n` : ""}

# Q&Aまとめ

${questions
  .map(
    (q) =>
      `### ${q.title || "見出し未設定"}\n\n**質問**\n\n${q.content || "質問内容未設定"}\n\n**回答**\n\n${q.answer || "回答未設定"}`
  )
  .join("\n\n")}`;

                const blob = new Blob([markdownContent], {
                  type: "text/markdown",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${resolvedReportTitle || "レポート"}.md`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="mb-4 inline-flex items-center px-5 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Markdownとしてダウンロード
            </button>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-300">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {resolveReportTitle(reportTitle) || <></>}
              </h2>
              {!resolveReportTitle(reportTitle) && (
                <div className="h-6 bg-gray-300 rounded animate-pulse"></div>
              )}
              {leadText ? (
                <p className="text-gray-700 mb-6">
                  {leadText.split("\n").map((line, index) => (
                    <span key={index}>
                      {line}
                      <br />
                    </span>
                  ))}
                </p>
              ) : (
                <div className="h-4 bg-gray-300 rounded animate-pulse mb-6"></div>
              )}
              {seminarVideoUrl && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    セミナー動画
                  </h3>
                  <p className="text-gray-700">
                    <a
                      href={seminarVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {seminarVideoUrl}
                    </a>
                  </p>
                </div>
              )}
              {presentationUrl && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    発表資料
                  </h3>
                  <p className="text-gray-700">
                    <a
                      href={presentationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {presentationUrl}
                    </a>
                  </p>
                </div>
              )}
              {questions.map((question) => (
                <div key={question.id} className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {question.title || <></>}
                  </h3>
                  {!question.title && (
                    <div className="h-5 bg-gray-300 rounded animate-pulse"></div>
                  )}
                  <div className="mb-2">
                    <span className="font-bold text-gray-800">質問</span>
                    <p className="text-gray-700">{question.content || <></>}</p>
                    {!question.content && (
                      <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-gray-800">回答</span>
                    <p className="text-gray-700">{question.answer || <></>}</p>
                    {!question.answer && (
                      <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
