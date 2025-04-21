export interface ImageData {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

// 애플리케이션에서 사용할 확장된 이미지 데이터 타입
export interface GalleryImage extends ImageData {
  isFavorite?: boolean;
  tags?: string[];
}
