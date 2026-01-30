import React, { useState, ChangeEvent, MouseEvent } from "react";
import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";

interface TextAreaFormProps {
  label: string;
  id: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
}

const TextAreaForm: React.FC<TextAreaFormProps> = ({
  label,
  id,
  value,
  onChange,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleCopy = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-4 relative group">
      <label
        className="block text-gray-700 text-sm font-bold mb-2"
        htmlFor={id}
      >
        {label}
      </label>
      <div className="flex items-center relative group-hover:flex">
        <textarea
          id={id}
          value={value}
          onFocus={handleOpenModal}
          readOnly
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline cursor-pointer h-10 pr-16"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-700 font-bold p-2 rounded focus:outline-none focus:shadow-outline opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          {copied ? (
            <CheckIcon className="h-5 w-5 text-green-500" />
          ) : (
            <ClipboardIcon className="h-5 w-5" />
          )}
        </button>
        {copied && (
          <div className="absolute right-0 top-full mt-1 bg-gray-800 text-white text-xs rounded py-1 px-2">
            コピーしました
          </div>
        )}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
            <h2 className="text-lg font-bold text-gray-800 mb-4">{label}</h2>
            <textarea
              id={`${id}-modal`}
              value={value}
              onChange={onChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows={10}
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={handleCloseModal}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow-md transition"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextAreaForm;
