import { galleryStore } from "../core/gallery";
import {
  setSelectedImage,
  setLoading,
  toggleFavorite,
} from "../core/gallery/actions";
import { getRouter } from "../core/router";
import { fetchImageById } from "../service/api";
import { getOptimizedImageUrl } from "../utils/imageLoader";

export class DetailPage {
  private element: HTMLElement;
  private imageId: string | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor() {
    this.element = document.createElement("div");
    this.element.className = "container";

    // 라우터에서 이미지 ID 가져오기
    const router = getRouter();
    if (router) {
      this.imageId = router.getParam("id");
    }

    // 상태 구독
    this.unsubscribe = galleryStore.subscribe(this.updateFromState.bind(this));

    // 선택된 이미지 ID 설정
    if (this.imageId) {
      setSelectedImage(this.imageId);
    }

    // 초기 로딩 상태
    this.element.innerHTML = `
      <div class="loading">
        <div class="loading-spinner"></div>
      </div>
    `;

    // 이미지 로드
    this.loadImage();
  }

  private updateFromState(state: any): void {
    if (state.error) {
      this.showError(state.error);
    }
  }

  private async loadImage(): Promise<void> {
    if (!this.imageId) {
      this.showError("이미지 ID를 찾을 수 없습니다.");
      return;
    }

    setLoading(true);

    try {
      // 상태에서 이미지를 먼저 찾기
      const state = galleryStore.getState();
      let image = state.images.find((img) => img.id === this.imageId);

      // 없으면 API에서 가져오기
      if (!image) {
        const fetchedImage = await fetchImageById(this.imageId);
        image = {
          ...fetchedImage,
          isFavorite: state.favorites.includes(this.imageId),
        };
      }

      this.renderImage(image);
    } catch (error) {
      console.error("이미지를 불러오는 중 오류 발생:", error);
      this.showError("이미지를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  private renderImage(image: any): void {
    // 최적화된 큰 이미지 URL 생성
    const optimizedUrl = getOptimizedImageUrl(image.id, 800, 600);

    this.element.innerHTML = `
      <div class="image-detail fade-in">
        <div class="image-detail__back">
          <a href="/" class="back-link" data-link>← 목록으로 돌아가기</a>
        </div>
        <div class="image-detail__img-container">
          <img 
            src="${optimizedUrl}" 
            alt="${image.author}의 이미지" 
            class="image-detail__img"
          />
        </div>
        <div class="image-detail__info">
          <h2 class="image-detail__title">Photo by ${image.author}</h2>
          <p class="image-detail__author">ID: ${image.id}</p>
          <p class="image-detail__dimensions">Dimensions: ${image.width} x ${
      image.height
    }</p>
          <div class="image-detail__actions">
            <button class="favorite-btn ${image.isFavorite ? "active" : ""}">
              ${image.isFavorite ? "★ 즐겨찾기 해제" : "☆ 즐겨찾기 추가"}
            </button>
            <a href="${
              image.download_url
            }" target="_blank" class="download-btn">원본 이미지 보기</a>
          </div>
        </div>
      </div>
    `;

    // 뒤로가기 링크 이벤트 처리
    const backLink = this.element.querySelector(".back-link");
    if (backLink) {
      backLink.addEventListener("click", (e) => {
        e.preventDefault();
        const href = (backLink as HTMLAnchorElement).getAttribute("href");
        if (href) {
          const router = getRouter();
          router?.navigate(href);
        }
      });
    }

    // 즐겨찾기 버튼 이벤트 처리
    const favoriteBtn = this.element.querySelector(".favorite-btn");
    if (favoriteBtn && this.imageId) {
      favoriteBtn.addEventListener("click", () => {
        const imageId = this.imageId as string;
        toggleFavorite(imageId);

        // UI 업데이트
        const isFavorite = galleryStore.getState().favorites.includes(imageId);
        favoriteBtn.textContent = isFavorite
          ? "★ 즐겨찾기 해제"
          : "☆ 즐겨찾기 추가";
        favoriteBtn.classList.toggle("active", isFavorite);
      });
    }
  }

  private showError(message: string): void {
    this.element.innerHTML = `
      <div class="error">
        <p>${message}</p>
        <a href="/" class="back-link" data-link>홈으로 돌아가기</a>
      </div>
    `;

    // 뒤로가기 링크 이벤트 처리
    const backLink = this.element.querySelector(".back-link");
    if (backLink) {
      backLink.addEventListener("click", (e) => {
        e.preventDefault();
        const href = (backLink as HTMLAnchorElement).getAttribute("href");
        if (href) {
          const router = getRouter();
          router?.navigate(href);
        }
      });
    }
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public destroy(): void {
    // 컴포넌트 제거 시 구독 해제
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    // 선택된 이미지 ID 초기화
    setSelectedImage(null);
  }
}

// 상세 페이지 컴포넌트 팩토리 함수
export const createDetailPage = (): HTMLElement => {
  return new DetailPage().getElement();
};
