export const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    const jsonData = JSON.stringify(data);
    localStorage.setItem(key, jsonData);
  } catch (error) {
    console.error(`Error saving ${key} to localStorage`, error);
  }
};

export const loadFromLocalStorage = <T>(key: string): T | null => {
  try {
    const jsonData = localStorage.getItem(key);
    return jsonData ? JSON.parse(jsonData) as T : null;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage`, error);
    return null;
  }
};