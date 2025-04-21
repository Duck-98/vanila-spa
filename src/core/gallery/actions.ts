import { galleryStore } from ".";
import { GalleryImage } from "../../types/image.type";

// 이미지 로드 시작 액션
export const setLoading = (loading: boolean): void => {
  galleryStore.setState((state) => ({
    ...state,
    loading,
  }));
};

// 이미지 추가 액션
export const addImages = (newImages: GalleryImage[]): void => {
  galleryStore.setState((state) => {
    // 중복 제거 및 즐겨찾기 상태 적용
    const uniqueNewImages = newImages
      .filter((newImg) => !state.images.some((img) => img.id === newImg.id))
      .map((img) => ({
        ...img,
        isFavorite: state.favorites.includes(img.id),
      }));

    return {
      ...state,
      images: [...state.images, ...uniqueNewImages],
      currentPage: state.currentPage + 1,
    };
  });
};

// 즐겨찾기 추가/제거 액션
export const toggleFavorite = (imageId: string): void => {
  galleryStore.setState((state) => {
    const isFavorite = state.favorites.includes(imageId);
    const newFavorites = isFavorite
      ? state.favorites.filter((id) => id !== imageId)
      : [...state.favorites, imageId];

    // 로컬 스토리지에 저장
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));

    // 이미지 목록에도 즐겨찾기 상태 업데이트
    const updatedImages = state.images.map((img) =>
      img.id === imageId ? { ...img, isFavorite: !isFavorite } : img,
    );

    return {
      ...state,
      favorites: newFavorites,
      images: updatedImages,
    };
  });
};

// 오류 설정 액션
export const setError = (error: string | null): void => {
  galleryStore.setState((state) => ({
    ...state,
    error,
  }));
};

// 선택된 이미지 설정 액션
export const setSelectedImage = (imageId: string | null): void => {
  galleryStore.setState((state) => ({
    ...state,
    selectedImageId: imageId,
  }));
};
