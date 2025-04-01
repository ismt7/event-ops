export const saveToLocalStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const loadFromLocalStorage = (key: string) => {
  const value = localStorage.getItem(key);
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch (error) {
    console.error(`Failed to parse JSON for key "${key}":`, error);
    return null;
  }
};

export const clearLocalStorage = (keys: string[]) => {
  keys.forEach((key) => localStorage.removeItem(key));
};
