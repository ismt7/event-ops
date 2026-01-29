"use client";

import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";

const resolveDefault = <T,>(value: T | (() => T)) =>
  typeof value === "function" ? (value as () => T)() : value;

export const useLocalStorageState = <T,>(
  key: string,
  defaultValue: T | (() => T)
) => {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return resolveDefault(defaultValue);
    }
    const stored = storage.getItem<T>(key);
    return stored !== null ? stored : resolveDefault(defaultValue);
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    storage.setItem(key, value);
  }, [key, value]);

  return [value, setValue] as const;
};
