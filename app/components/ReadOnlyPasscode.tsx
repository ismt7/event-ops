import React, { useState, MouseEvent } from "react";
import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";

interface ReadOnlyPasscodeProps {
  label: string;
  value: string;
}

const ReadOnlyPasscode: React.FC<ReadOnlyPasscodeProps> = ({
  label,
  value,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-4 relative group">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        {label}
      </label>
      <div className="flex items-center relative group-hover:flex">
        <input
          type="text"
          value={value}
          readOnly
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-16 bg-gray-200"
        />
        <button
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
    </div>
  );
};

export default ReadOnlyPasscode;
