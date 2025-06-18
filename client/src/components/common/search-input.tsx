"use client";

import { useState } from "react";

export interface SearchInputProps {
  placeholder?: string;
  onChange?: (value: string) => void;
}

export function SearchInput({
  placeholder = "Search courses, products...",
  onChange,
}: SearchInputProps) {
  const [query, setQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onChange?.(value);
  };

  return (
    <input
      type="text"
      placeholder={placeholder}
      value={query}
      onChange={handleChange}
      className="w-full px-4 py-2 border-2 border-amber-600 bg-white text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-kc-text"
    />
  );
}
