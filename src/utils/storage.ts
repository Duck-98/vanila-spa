export const loadFromStorage = (key: string): string[] => {
  try {
    const favorites = localStorage.getItem(key);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error("즐겨찾기를 로드하는 중 오류 발생:", error);
    return [];
  }
};
