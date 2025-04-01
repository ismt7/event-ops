"use client";

import { useState, useEffect, ChangeEvent, FormEvent, MouseEvent } from "react";
import dayjs from "dayjs";
import "dayjs/locale/ja";
import defaultConfig from "@/event-ops.config";
import UrlForm from "@/app/components/UrlForm";
import TextAreaForm from "@/app/components/TextAreaForm";
import TextInputForm from "@/app/components/TextInputForm";
import DateForm from "@/app/components/DateForm";
import ReadOnlyUrl from "@/app/components/ReadOnlyUrl";
import ReadOnlyPasscode from "@/app/components/ReadOnlyPasscode";
import TemplateEditor from "@/app/components/TemplateEditor";
import { saveAs } from "file-saver";
import { storage } from "@/lib/storage";
dayjs.locale("ja");

const validateUrl = (url: string, domain: string) => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname === domain;
  } catch {
    return false;
  }
};

const handleUrlChange =
  (
    setUrl: React.Dispatch<React.SetStateAction<string>>,
    setUrlValid: React.Dispatch<React.SetStateAction<boolean>>,
    domain: string
  ) =>
  (e: ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setUrl(url);
    setUrlValid(validateUrl(url, domain));
  };

interface TabProps {
  tabs: string[];
  activeTab: string;
  onTabClick: (tab: string) => void;
}

const Tabs: React.FC<TabProps> = ({ tabs, activeTab, onTabClick }) => (
  <div className="mb-4">
    <div className="flex border-b">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`py-2 px-4 ${
            activeTab === tab
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500"
          }`}
          onClick={() => onTabClick(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  </div>
);

interface Template {
  id: string;
  name: string;
  text: string;
}

const insertAtCursor = (input: HTMLTextAreaElement, text: string) => {
  const start = input.selectionStart;
  const end = input.selectionEnd;
  const before = input.value.substring(0, start);
  const after = input.value.substring(end);
  input.value = before + text + after;
  input.selectionStart = input.selectionEnd = start + text.length;
  input.focus();
};

export default function Home() {
  const [config, setConfig] = useState(defaultConfig);
  const [zoomUrl, setZoomUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [surveyUrl, setSurveyUrl] = useState("");
  const [slidoUrl, setSlidoUrl] = useState("");
  const [connpassUrl, setConnpassUrl] = useState("");
  const [eventDate, setEventDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [message, setMessage] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );
  const [templateText, setTemplateText] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [activeTab, setActiveTab] = useState("編集");

  const [zoomUrlValid, setZoomUrlValid] = useState(true);
  const [youtubeUrlValid, setYoutubeUrlValid] = useState(true);
  const [surveyUrlValid, setSurveyUrlValid] = useState(true);
  const [slidoUrlValid, setSlidoUrlValid] = useState(true);
  const [connpassUrlValid, setConnpassUrlValid] = useState(true);

  useEffect(() => {
    // 初回起動時にdefaultConfigをstorageに保存
    const storedConfig = storage.getItem<typeof config>("config");
    if (!storedConfig) {
      storage.setItem("config", defaultConfig);
    }
  }, []);

  useEffect(() => {
    const storedZoomUrl = storage.getItem<string>("zoomUrl");
    const storedYoutubeUrl = storage.getItem<string>("youtubeUrl");
    const storedSurveyUrl = storage.getItem<string>("surveyUrl");
    const storedSlidoUrl = storage.getItem<string>("slidoUrl");
    const storedConnpassUrl = storage.getItem<string>("connpassUrl");
    const storedEventDate = storage.getItem<string>("eventDate");
    const storedEventTitle = storage.getItem<string>("eventTitle");
    const storedEventDescription = storage.getItem<string>("eventDescription");
    const storedTemplates = storage.getItem<Template[]>("templates");

    if (storedZoomUrl) setZoomUrl(storedZoomUrl);
    if (storedYoutubeUrl) setYoutubeUrl(storedYoutubeUrl);
    if (storedSurveyUrl) setSurveyUrl(storedSurveyUrl);
    if (storedSlidoUrl) setSlidoUrl(storedSlidoUrl);
    if (storedConnpassUrl) setConnpassUrl(storedConnpassUrl);
    if (storedEventDate) setEventDate(storedEventDate);
    if (storedEventTitle) setEventTitle(storedEventTitle);
    if (storedEventDescription) setEventDescription(storedEventDescription);
    if (storedTemplates) setTemplates(storedTemplates);
  }, []);

  useEffect(() => {
    storage.setItem("zoomUrl", zoomUrl);
  }, [zoomUrl]);

  useEffect(() => {
    storage.setItem("youtubeUrl", youtubeUrl);
  }, [youtubeUrl]);

  useEffect(() => {
    storage.setItem("surveyUrl", surveyUrl);
  }, [surveyUrl]);

  useEffect(() => {
    storage.setItem("slidoUrl", slidoUrl);
  }, [slidoUrl]);

  useEffect(() => {
    storage.setItem("connpassUrl", connpassUrl);
  }, [connpassUrl]);

  useEffect(() => {
    storage.setItem("eventDate", eventDate);
  }, [eventDate]);

  useEffect(() => {
    storage.setItem("eventTitle", eventTitle);
  }, [eventTitle]);

  useEffect(() => {
    storage.setItem("eventDescription", eventDescription);
  }, [eventDescription]);

  useEffect(() => {
    storage.setItem("templates", templates);
  }, [templates]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    setMessage("保存が完了しました！");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleClear = () => {
    storage.clear();
    setZoomUrl("");
    setYoutubeUrl("");
    setSurveyUrl("");
    setSlidoUrl("");
    setConnpassUrl("");
    setEventDate(dayjs().format("YYYY-MM-DD"));
    setEventTitle("");
    setEventDescription("");
    setTemplateText("");
    setMessage("ローカルストレージをクリアしました！");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleTemplateChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    setSelectedTemplateId(templateId);
    const selectedTemplate = templates.find(
      (template) => template.id === templateId
    );
    setTemplateText(selectedTemplate ? selectedTemplate.text : "");
    setTemplateName(selectedTemplate ? selectedTemplate.name : "");
  };

  const handleTemplateSave = () => {
    if (selectedTemplateId) {
      setTemplates((prevTemplates) =>
        prevTemplates.map((template) =>
          template.id === selectedTemplateId
            ? { ...template, name: templateName, text: templateText }
            : template
        )
      );
    } else {
      const newTemplate = {
        id: dayjs().format("YYYYMMDDHHmmss"),
        name: templateName,
        text: templateText,
      };
      setTemplates((prevTemplates) => [...prevTemplates, newTemplate]);
      setSelectedTemplateId(newTemplate.id);
    }
    setMessage("テンプレートが保存されました！");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleTemplateDelete = () => {
    if (selectedTemplateId) {
      setTemplates((prevTemplates) =>
        prevTemplates.filter((template) => template.id !== selectedTemplateId)
      );
      setSelectedTemplateId(null);
      setTemplateText("");
      setTemplateName("");
      setMessage("テンプレートが削除されました！");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleExport = () => {
    const storedConfig = storage.getItem<typeof config>("config");
    const currentConfig = storedConfig || defaultConfig;

    const data = {
      config: currentConfig,
      zoomUrl,
      youtubeUrl,
      surveyUrl,
      slidoUrl,
      connpassUrl,
      eventDate,
      eventTitle,
      eventDescription,
      templates,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const fileName =
      currentConfig.exportFileName || defaultConfig.exportFileName;
    saveAs(blob, fileName);
  };

  const handleImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);

        // 設定を反映し、ローカルストレージを更新
        const newConfig = {
          ...defaultConfig,
          ...importedData.config,
          shortUrl: {
            ...defaultConfig.shortUrl,
            ...importedData.config?.shortUrl,
          },
          connpass: {
            ...defaultConfig.connpass,
            ...importedData.config?.connpass,
          },
        };

        setConfig(newConfig);
        storage.setItem("config", newConfig);

        setZoomUrl(importedData.zoomUrl || "");
        setYoutubeUrl(importedData.youtubeUrl || "");
        setSurveyUrl(importedData.surveyUrl || "");
        setSlidoUrl(importedData.slidoUrl || "");
        setConnpassUrl(importedData.connpassUrl || "");
        setEventDate(importedData.eventDate || dayjs().format("YYYY-MM-DD"));
        setEventTitle(importedData.eventTitle || "");
        setEventDescription(importedData.eventDescription || "");
        setTemplates(importedData.templates || []);

        // 他の値もローカルストレージを更新
        storage.setItem("zoomUrl", importedData.zoomUrl || "");
        storage.setItem("youtubeUrl", importedData.youtubeUrl || "");
        storage.setItem("surveyUrl", importedData.surveyUrl || "");
        storage.setItem("slidoUrl", importedData.slidoUrl || "");
        storage.setItem("connpassUrl", importedData.connpassUrl || "");
        storage.setItem(
          "eventDate",
          importedData.eventDate || dayjs().format("YYYY-MM-DD")
        );
        storage.setItem("eventTitle", importedData.eventTitle || "");
        storage.setItem(
          "eventDescription",
          importedData.eventDescription || ""
        );
        storage.setItem("templates", importedData.templates || []);

        setMessage("JSONファイルをインポートしました！");
        setTimeout(() => setMessage(""), 3000);
      } catch (error) {
        alert("JSONファイルの読み込みに失敗しました。");
      }
    };
    reader.readAsText(file);
  };

  const formattedDate = dayjs(eventDate).format("YYYYMM");
  const formattedZoomUrl = `${config.shortUrl.baseUrl}/${config.prefix}${formattedDate}-zoom`;
  const formattedYoutubeUrl = `${config.shortUrl.baseUrl}/${config.prefix}${formattedDate}-youtube`;
  const formattedSurveyUrl = `${config.shortUrl.baseUrl}/${config.prefix}${formattedDate}-survey`;
  const formattedSlidoUrl = `${config.shortUrl.baseUrl}/${config.prefix}${formattedDate}-slido`;
  const formattedZoomPasscode = `${config.prefix}${formattedDate.slice(2)}`;
  const formattedSlidoEventCode = `${config.prefix}${formattedDate.slice(2)}`;

  const formatEventDate = (date: string) => {
    return dayjs(date).format("YYYY年MM月DD日(ddd)");
  };

  const previewText = templateText
    .replace("{zoomUrl}", formattedZoomUrl)
    .replace("{youtubeUrl}", formattedYoutubeUrl)
    .replace("{surveyUrl}", formattedSurveyUrl)
    .replace("{slidoUrl}", formattedSlidoUrl)
    .replace("{connpassUrl}", connpassUrl)
    .replace("{zoomPasscode}", formattedZoomPasscode)
    .replace("{slidoEventCode}", formattedSlidoEventCode)
    .replace("{eventTitle}", eventTitle)
    .replace("{eventDescription}", eventDescription)
    .replace("{eventDate}", formatEventDate(eventDate));

  const handleCopyPreview = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigator.clipboard.writeText(previewText);
    alert("プレビュー文をクリップボードにコピーしました！");
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            イベント設定
          </h1>
          {/* 設定編集フォーム */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">設定</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 以下のフォームを削除 */}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <TextInputForm
              label="イベントタイトル"
              id="eventTitle"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
            />
            <TextAreaForm
              label="イベント概要"
              id="eventDescription"
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
            />
            <DateForm
              label="イベント開始日"
              id="eventDate"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <UrlForm
              label="Zoom URL"
              id="zoomUrl"
              value={zoomUrl}
              onChange={handleUrlChange(
                setZoomUrl,
                setZoomUrlValid,
                "us06web.zoom.us"
              )}
            />
            <UrlForm
              label="YouTube URL"
              id="youtubeUrl"
              value={youtubeUrl}
              onChange={handleUrlChange(
                setYoutubeUrl,
                setYoutubeUrlValid,
                "www.youtube.com"
              )}
            />
            <UrlForm
              label="Survey URL"
              id="surveyUrl"
              value={surveyUrl}
              onChange={handleUrlChange(
                setSurveyUrl,
                setSurveyUrlValid,
                "docs.google.com"
              )}
            />
            <UrlForm
              label="Slido URL"
              id="slidoUrl"
              value={slidoUrl}
              onChange={handleUrlChange(
                setSlidoUrl,
                setSlidoUrlValid,
                "app.sli.do"
              )}
            />
            <UrlForm
              label="connpass URL"
              id="connpassUrl"
              value={connpassUrl}
              onChange={handleUrlChange(
                setConnpassUrl,
                setConnpassUrlValid,
                config.connpass.baseUrl
              )}
            />
          </div>
          <div className="flex flex-wrap gap-4 mt-6 justify-center">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow-md transition"
            >
              保存
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded shadow-md transition"
            >
              クリア
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded shadow-md transition"
            >
              エクスポート
            </button>
            <label className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded shadow-md transition cursor-pointer">
              インポート
              <input
                type="file"
                accept="application/json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>
        {message && (
          <p className="mt-4 text-green-600 font-semibold text-center">
            {message}
          </p>
        )}
        <div className="bg-white shadow-md rounded-lg p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            生成されたリンク
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ReadOnlyUrl label="Zoom URL(短縮)" value={formattedZoomUrl} />
            <ReadOnlyPasscode
              label="Zoom パスコード"
              value={formattedZoomPasscode}
            />
            <ReadOnlyUrl
              label="YouTube URL(短縮)"
              value={formattedYoutubeUrl}
            />
            <ReadOnlyUrl label="Slido URL(短縮)" value={formattedSlidoUrl} />
            <ReadOnlyPasscode
              label="Slido イベントコード"
              value={formattedSlidoEventCode}
            />
            <ReadOnlyUrl
              label="アンケート URL(短縮)"
              value={formattedSurveyUrl}
            />
          </div>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            テンプレート管理
          </h2>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="templateSelect"
            >
              テンプレート選択
            </label>
            <select
              id="templateSelect"
              value={selectedTemplateId || ""}
              onChange={handleTemplateChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">新しいテンプレート</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
          <TextInputForm
            label="テンプレート名"
            id="templateName"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
          />
          <Tabs
            tabs={["編集", "プレビュー"]}
            activeTab={activeTab}
            onTabClick={setActiveTab}
          />
          {activeTab === "編集" ? (
            <TemplateEditor
              value={templateText}
              onChange={(value) => setTemplateText(value)}
            />
          ) : (
            <div className="mb-4 p-4 border rounded bg-gray-100 relative group">
              <p className="text-gray-700 whitespace-pre-wrap">{previewText}</p>
              <button
                onClick={handleCopyPreview}
                className="absolute right-0 top-0 mt-2 mr-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                コピー
              </button>
            </div>
          )}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleTemplateSave}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow-md transition"
            >
              テンプレート保存
            </button>
            <button
              type="button"
              onClick={handleTemplateDelete}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded shadow-md transition"
            >
              テンプレート削除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
