"use client";

import { useEffect } from "react";

interface LeadTextModalProps {
  isOpen: boolean;
  leadText: string;
  onClose: () => void;
  onSave: (text: string) => void;
}

export default function LeadTextModal({
  isOpen,
  leadText,
  onClose,
  onSave,
}: LeadTextModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose(); // エスケープキーでモーダルを閉じる
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-1/2 h-3/4 flex flex-col">
        <h2 className="text-xl font-bold mb-4">リード文を編集</h2>
        <textarea
          rows={10}
          className="flex-grow border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          defaultValue={leadText}
          onChange={(e) => onSave(e.target.value)}
        />
        <div className="flex justify-end space-x-4 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
          >
            キャンセル
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
