export const saveToLocalStorage = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const loadFromLocalStorage = <T>(key: string): T | null => {
  const value = localStorage.getItem(key);
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`Failed to parse JSON for key "${key}":`, error);
    return null;
  }
};

export const clearLocalStorage = (keys: string[]): void => {
  keys.forEach((key) => localStorage.removeItem(key));
};

export const storage = {
  getItem<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  },
  setItem<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  },
  clear(): void {
    localStorage.clear();
  },
};
