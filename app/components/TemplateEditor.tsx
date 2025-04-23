import React, {
  useState,
  ChangeEvent,
  KeyboardEvent,
  MouseEvent,
  useRef,
  useEffect,
} from "react";

interface TemplateEditorProps {
  value: string;
  onChange: (value: string) => void;
}

interface Suggestion {
  key: string;
  description: string;
}

const suggestions: Suggestion[] = [
  { key: "{zoomUrl}", description: "ZoomのURL" },
  { key: "{youtubeUrl}", description: "YouTubeのURL" },
  { key: "{surveyUrl}", description: "アンケートのURL" },
  { key: "{slidoUrl}", description: "SlidoのURL" },
  { key: "{connpassUrl}", description: "connpassのURL" },
  { key: "{zoomPasscode}", description: "Zoomのパスコード" },
  { key: "{slidoEventCode}", description: "Slidoのイベントコード" },
  { key: "{eventTitle}", description: "イベントタイトル" },
  { key: "{eventDescription}", description: "イベント概要" },
  { key: "{eventDate}", description: "イベント開始日" },
];

const TemplateEditor: React.FC<TemplateEditorProps> = ({ value, onChange }) => {
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>(
    []
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionListRef = useRef<HTMLUListElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    // 改行を考慮して最後の単語を取得
    const lastWord =
      inputValue.slice(0, e.target.selectionStart).split(/\s+/).pop() || "";
    if (lastWord.startsWith("{")) {
      const matches = suggestions.filter((s) => s.key.startsWith(lastWord));
      setFilteredSuggestions(matches);
      setShowSuggestions(matches.length > 0);

      // カーソル位置を取得してリストの位置を設定
      const textarea = textareaRef.current;
      if (textarea) {
        const { top, left } = getCaretCoordinates(
          textarea,
          textarea.selectionStart
        );
        setPosition({ top, left });
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((prev) =>
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (cursor >= 0) {
        insertSuggestion(filteredSuggestions[cursor].key);
      }
    }
  };

  useEffect(() => {
    if (suggestionListRef.current && cursor >= 0) {
      const activeItem = suggestionListRef.current.children[
        cursor
      ] as HTMLElement;
      if (activeItem) {
        activeItem.scrollIntoView({
          block: "nearest",
          inline: "nearest",
        });
      }
    }
  }, [cursor]);

  const insertSuggestion = (suggestion: string) => {
    const words = value.split(" ");
    words.pop();
    const newValue = [...words, suggestion].join(" ");
    onChange(newValue);
    setShowSuggestions(false);
    setCursor(-1);
  };

  const handleSuggestionClick = (suggestion: string) => {
    insertSuggestion(suggestion);
  };

  const getCaretCoordinates = (
    textarea: HTMLTextAreaElement,
    position: number
  ) => {
    const div = document.createElement("div");
    const style = window.getComputedStyle(textarea);

    // テキストエリアのスタイルをコピー
    Array.from(style).forEach((key) => {
      div.style.setProperty(key, style.getPropertyValue(key));
    });

    div.style.position = "absolute";
    div.style.visibility = "hidden";
    div.style.whiteSpace = "pre-wrap";
    div.style.wordWrap = "break-word";
    div.style.width = `${textarea.offsetWidth}px`;

    // 改行を正確に反映させるためにテキストを加工
    const text = textarea.value
      .substring(0, position)
      .replace(/\n/g, "\u200b\n");
    div.textContent = text;

    const span = document.createElement("span");
    span.textContent = "|";
    div.appendChild(span);

    document.body.appendChild(div);

    // テキストエリアのスクロール位置を考慮
    const { offsetTop: top, offsetLeft: left } = span;
    const scrollTop = textarea.scrollTop;
    const scrollLeft = textarea.scrollLeft;

    document.body.removeChild(div);

    return { top: top - scrollTop, left: left - scrollLeft };
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        rows={4}
      />
      {showSuggestions && (
        <ul
          ref={suggestionListRef}
          className="absolute z-10 bg-white border rounded shadow-md max-h-40 overflow-y-auto text-sm"
          style={{ top: position.top + 20, left: position.left }}
        >
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={suggestion.key}
              className={`px-2 py-1 cursor-pointer ${
                index === cursor
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-100"
              }`}
              onMouseDown={(e: MouseEvent) => {
                e.preventDefault();
                handleSuggestionClick(suggestion.key);
              }}
            >
              <span className="font-bold">{suggestion.key}</span> -{" "}
              <span className="text-gray-500">{suggestion.description}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TemplateEditor;
