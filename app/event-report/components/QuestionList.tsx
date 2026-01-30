"use client";

import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

interface Question {
  id: string;
  title: string;
  content: string;
  answer: string;
}

interface QuestionListProps {
  questions: Question[];
  activeQuestionId: string | null;
  onToggle: (id: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: string, value: string) => void;
  onGenerateTitle?: (id: string) => void;
  onGenerateAnswer?: (id: string) => void;
  canUseChatGpt?: boolean;
  generatingTitleIds?: Record<string, boolean>;
  generatingAnswerIds?: Record<string, boolean>;
}

export default function QuestionList({
  questions,
  activeQuestionId,
  onToggle,
  onAdd,
  onRemove,
  onUpdate,
  onGenerateTitle,
  onGenerateAnswer,
  canUseChatGpt = false,
  generatingTitleIds = {},
  generatingAnswerIds = {},
}: QuestionListProps) {
  return (
    <div>
      {questions.map((question) => (
        <div
          key={question.id}
          className="border border-gray-300 rounded-lg mb-4"
        >
          <button
            type="button"
            onClick={() => onToggle(question.id)}
            className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 font-medium text-gray-800 rounded-t-lg"
          >
            {question.title || "新しい質問"}
          </button>
          {activeQuestionId === question.id && (
            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor={`title-${question.id}`}
                    className="block text-lg font-medium text-gray-700"
                  >
                    見出し
                  </label>
                  {onGenerateTitle && (
                    <button
                      type="button"
                      onClick={() => onGenerateTitle(question.id)}
                      className="text-xs px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      disabled={
                        !canUseChatGpt || generatingTitleIds[question.id]
                      }
                    >
                      {generatingTitleIds[question.id]
                        ? "生成中..."
                        : "ChatGPTで生成"}
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  id={`title-${question.id}`}
                  className="mt-2 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-base p-2"
                  placeholder="見出しを入力してください"
                  value={question.title}
                  onChange={(e) =>
                    onUpdate(question.id, "title", e.target.value)
                  }
                />
              </div>
              <div>
                <label
                  htmlFor={`content-${question.id}`}
                  className="block text-lg font-medium text-gray-700"
                >
                  質問
                </label>
                <textarea
                  id={`content-${question.id}`}
                  rows={2}
                  className="mt-2 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-base p-2"
                  placeholder="質問内容を入力してください"
                  value={question.content}
                  onChange={(e) =>
                    onUpdate(question.id, "content", e.target.value)
                  }
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor={`answer-${question.id}`}
                    className="block text-lg font-medium text-gray-700"
                  >
                    回答
                  </label>
                  {onGenerateAnswer && (
                    <button
                      type="button"
                      onClick={() => onGenerateAnswer(question.id)}
                      className="text-xs px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      disabled={
                        !canUseChatGpt || generatingAnswerIds[question.id]
                      }
                    >
                      {generatingAnswerIds[question.id]
                        ? "生成中..."
                        : "ChatGPTで生成"}
                    </button>
                  )}
                </div>
                <textarea
                  id={`answer-${question.id}`}
                  rows={2}
                  className="mt-2 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-base p-2"
                  placeholder="回答を入力してください"
                  value={question.answer}
                  onChange={(e) =>
                    onUpdate(question.id, "answer", e.target.value)
                  }
                />
              </div>
              <button
                type="button"
                onClick={() => onRemove(question.id)}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <TrashIcon className="h-5 w-5 mr-2" />
                削除
              </button>
            </div>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center px-5 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        <PlusIcon className="h-5 w-5 mr-2" />
        質問を追加
      </button>
    </div>
  );
}
