import { ImageCard } from "../components/common/image-card";
import { galleryStore } from "../core/gallery";
import { setLoading, addImages, setError } from "../core/gallery/actions";
import { fetchImageById, fetchImages } from "../service/api";
import { GalleryImage } from "../types/image.type";

export class HomePage {
  private element: HTMLElement;
  private imageGrid: HTMLElement;
  private loading: boolean = false;
  private currentPage: number = 1;
  private hasMoreImages: boolean = true;
  private unsubscribe: (() => void) | null = null;

  constructor() {
    this.element = document.createElement("div");
    this.element.className = "container";

    // 타이틀과 이미지 그리드 컨테이너 생성 (포켓몬 테마로 변경)
    this.element.innerHTML = `
      <h1>포켓몬 갤러리</h1>
      <p class="subtitle">무한 스크롤로 포켓몬을 탐색해보세요!</p>
      <div class="image-grid"></div>
      <div class="infinite-scroll-loader" style="display: none;">
        <div class="loading-spinner"></div>
      </div>
    `;

    this.imageGrid = this.element.querySelector(".image-grid") as HTMLElement;

    // 상태 변화 구독
    this.unsubscribe = galleryStore.subscribe(this.updateFromState.bind(this));

    // 즐겨찾기 포켓몬 먼저 확인
    this.checkFavoriteImages();

    // 초기 포켓몬 데이터 로드
    this.loadImages();

    // 스크롤 이벤트 리스너 추가
    window.addEventListener("scroll", this.handleScroll.bind(this));
  }

  private updateFromState(state: any): void {
    // 상태 변화에 따른 UI 업데이트
    const loader = this.element.querySelector(".infinite-scroll-loader");

    if (state.loading) {
      if (loader) loader.setAttribute("style", "display: flex;");
    } else {
      if (loader) loader.setAttribute("style", "display: none;");
    }

    if (state.error) {
      this.showError(state.error);
    }
  }

  private async loadImages(): Promise<void> {
    if (this.loading || !this.hasMoreImages) return;

    this.loading = true;
    setLoading(true);

    try {
      const newImages = await fetchImages(this.currentPage);

      // 더 이상 불러올 포켓몬이 없는 경우
      if (newImages.length === 0) {
        this.hasMoreImages = false;
        return;
      }

      // 상태 업데이트 (포켓몬 추가)
      addImages(newImages as GalleryImage[]);

      // 새 포켓몬 카드 렌더링
      this.renderImages(newImages as GalleryImage[]);

      // 다음 페이지 준비
      this.currentPage++;
    } catch (error) {
      console.error("포켓몬 데이터를 불러오는 중 오류 발생:", error);
      setError(
        "포켓몬 데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.",
      );
    } finally {
      this.loading = false;
      setLoading(false);
    }
  }

  private renderImages(images: GalleryImage[]): void {
    images.forEach((image) => {
      const card = new ImageCard(image).getElement();
      this.imageGrid.appendChild(card);
    });
  }

  private handleScroll(): void {
    // 페이지 하단에 도달했는지 확인
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    if (
      scrollTop + clientHeight >= scrollHeight - 200 &&
      !this.loading &&
      this.hasMoreImages
    ) {
      this.loadImages();
    }
  }

  private showError(message: string): void {
    const errorElement = document.createElement("div");
    errorElement.className = "error";
    errorElement.textContent = message;

    this.element.appendChild(errorElement);

    // 3초 후 에러 메시지 삭제
    setTimeout(() => {
      if (this.element.contains(errorElement)) {
        this.element.removeChild(errorElement);
      }
    }, 3000);
  }

  private checkFavoriteImages = async () => {
    const state = galleryStore.getState();
    const favoriteIds = state.favorites;

    if (favoriteIds.length === 0) return;

    const loadedImageIds = state.images.map((img) => img.id);
    const missingFavoriteIds = favoriteIds.filter(
      (id) => !loadedImageIds.includes(id),
    );

    if (missingFavoriteIds.length > 0) {
      setLoading(true);

      try {
        // 즐겨찾기된 포켓몬 데이터 가져오기
        const missingImages = await Promise.all(
          missingFavoriteIds.map(async (id) => {
            try {
              const image = await fetchImageById(id);
              return { ...image, isFavorite: true };
            } catch (error) {
              console.error(
                `ID ${id}인 포켓몬을 불러오는 중 오류 발생:`,
                error,
              );
              return null;
            }
          }),
        );

        const validImages = missingImages
          .filter((img) => img !== null)
          .map((img) => ({ ...img, isFavorite: true }));

        if (validImages.length > 0) {
          addImages(validImages as GalleryImage[]);
          // 즐겨찾기 포켓몬도 렌더링 (이 부분이 기존 코드에 없었음)
          this.renderImages(validImages as GalleryImage[]);
        }
      } catch (error) {
        console.error("즐겨찾기 포켓몬을 불러오는 중 오류 발생:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  public getElement(): HTMLElement {
    return this.element;
  }

  public destroy(): void {
    // 컴포넌트 제거 시 이벤트 리스너 및 구독 해제
    window.removeEventListener("scroll", this.handleScroll.bind(this));

    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}

// 홈페이지 컴포넌트 팩토리 함수
export const createHomePage = (): HTMLElement => {
  return new HomePage().getElement();
};
