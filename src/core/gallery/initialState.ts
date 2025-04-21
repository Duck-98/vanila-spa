import { GALLERY_FAVORITES_STORAGE_KEY } from "../../constants/storage";
import { GalleryState } from "../../types/state.type";
import { loadFromStorage } from "../../utils/storage";

// 초기 상태
export const galleryState: GalleryState = {
  images: [],
  loading: false,
  error: null,
  currentPage: 1,
  favorites: loadFromStorage(GALLERY_FAVORITES_STORAGE_KEY),
  selectedImageId: null,
};
