import { useState } from "react";

type UseStorage = (
  key: string,
  value: string
) => [string, (item: string) => void];

export const useStorage: UseStorage = (key: string, defaultValue: string) => {
  const item = window.localStorage.getItem(key);
  if (!item) window.localStorage.setItem(key, defaultValue);
  const [value, setValue] = useState<string>(item || defaultValue);
  return [
    value,
    (item) => {
      setValue(item);
      window.localStorage.setItem(key, item);
    },
  ];
};
