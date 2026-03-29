"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { getMemoSuggestions } from "@/lib/actions/transactions";

interface MemoInputProps {
  value: string;
  onChange: (value: string) => void;
  onFocusChange?: (focused: boolean) => void;
}

export function MemoInput({ value, onChange, onFocusChange }: MemoInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchSuggestions = async (keyword: string) => {
    if (!keyword.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    const results = await getMemoSuggestions(keyword);
    setSuggestions(results);
    setShowDropdown(results.length > 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchSuggestions(val), 150);
  };

  const handleFocus = () => {
    if (value.trim()) fetchSuggestions(value);
    onFocusChange?.(true);
    // 키보드가 올라온 후 메모 필드가 가려지지 않도록 스크롤
    setTimeout(() => {
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 400);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowDropdown(false);
      onFocusChange?.(false);
    }, 150);
  };

  const handleSelect = (item: string) => {
    onChange(item);
    setShowDropdown(false);
    setSuggestions([]);
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        placeholder="메모 (선택사항)"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="rounded-xl"
        autoComplete="off"
      />
      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute bottom-full left-0 right-0 mb-1 z-10 bg-background border border-input rounded-xl shadow-md overflow-hidden">
          {suggestions.map((item) => (
            <li
              key={item}
              onMouseDown={() => handleSelect(item)}
              className="px-3.5 py-2.5 text-[13.5px] cursor-pointer hover:bg-muted/50 border-b border-input last:border-b-0"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
