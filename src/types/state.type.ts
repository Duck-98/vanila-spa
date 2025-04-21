import { GalleryImage } from "./image.type";

// 컴포넌트 인터페이스
export interface Component {
  render: () => HTMLElement | Promise<HTMLElement>;
  destroy?: () => void;
}

// 애플리케이션의 상태 타입
export interface GalleryState {
  images: GalleryImage[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  favorites: string[]; // 이미지 ID 배열
  selectedImageId: string | null;
}
