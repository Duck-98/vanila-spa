import { ImageCard } from "../components/common/image-card";
import { galleryStore } from "../core/gallery";
import { addImages, setLoading } from "../core/gallery/actions";
import { fetchImageById } from "../service/api";
import { GalleryImage } from "../types/image.type";

export class FavoritePage {
  private element: HTMLElement;
  private loading: boolean = false;
  private imageGrid: HTMLElement;
  private unsubscribe: (() => void) | null = null;

  constructor() {
    this.element = document.createElement("main");
    this.element.className = "container";
    this.element.innerHTML = `
        <h1>즐겨찾기</h1>
        <div class="image-grid">
        <div class="loader" style="display:none">
            <div class="loading-spinner" />
        </div>
    `;

    this.imageGrid = this.element.querySelector(".image-grid") as HTMLElement;
    this.unsubscribe = galleryStore.subscribe(this.updateFromState);
    this.loadFavoritesImages();
    // this.unsubscribe= galleryStore.subscribe(this.)
  }

  //   private loadFavoritesImages = async (): Promise<void> => {
  //     if (this.loading) return;
  //     setLoading(true);
  //     this.loading = true;
  //     try {
  //       const favoriteIds = galleryStore.getState().favorites;
  //       console.log(favoriteIds, "FAVORITE IDS!!");
  //       if (favoriteIds.length === 0) {
  //         this.imageGrid.innerHTML = "<p>즐겨찾기 이미지가 없습니다.</p>";
  //         return;
  //       }

  //       const state = galleryStore.getState();
  //       const loadedFavorites = state.images.filter((image) =>
  //         favoriteIds.includes(image.id),
  //       );

  //       // 아직 로드되지 않은 아이디
  //       const loadedImageIds = state.images.map((image) => image.id);
  //       const missingImageIds = favoriteIds.filter(
  //         (id) => !loadedImageIds.includes(id),
  //       );

  //       this.renderFavoritesImages(loadedFavorites);

  //       if (state.images.length === 0) {
  //         // 이미지 불러오기
  //       } else {
  //         this.renderFavoritesImages(loadedFavorites);
  //       }
  //     } catch (error) {
  //       this.showError(
  //         "즐겨찾기 이미지를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.",
  //       );
  //     } finally {
  //       this.loading = false;
  //       setLoading(false);
  //     }
  //   };

  private loadFavoritesImages = async (): Promise<void> => {
    if (this.loading) return;

    this.loading = true;
    setLoading(true);

    try {
      const state = galleryStore.getState();
      const favoriteIds = state.favorites;

      // 즐겨찾기가 없는 경우
      if (favoriteIds.length === 0) {
        this.imageGrid.innerHTML =
          "<p class='no-favorites'>즐겨찾기 이미지가 없습니다.</p>";
        return;
      }

      // 이미 로드된 즐겨찾기 이미지
      const loadedFavorites = state.images.filter((image) =>
        favoriteIds.includes(image.id),
      );

      // 이미 로드된 즐겨찾기 이미지가 있으면 렌더링
      if (loadedFavorites.length > 0) {
        // 기존 이미지 그리드 비우기 (중복 방지)
        this.imageGrid.innerHTML = "";
        this.renderFavoritesImages(loadedFavorites);
      }

      // 로드되지 않은 즐겨찾기 이미지 ID
      const loadedImageIds = state.images.map((image) => image.id);
      const missingFavoriteIds = favoriteIds.filter(
        (id) => !loadedImageIds.includes(id),
      );

      // 누락된 이미지가 있는 경우
      if (missingFavoriteIds.length > 0) {
        // 여기서 누락된 이미지를 API에서 가져와야 합니다
        // 이 부분은 API 구조에 따라 다를 수 있습니다

        // API가 개별 ID로 조회가 가능한 경우:
        const missingImages = await Promise.all(
          missingFavoriteIds.map(async (id) => {
            try {
              const image = await fetchImageById(id);
              return { ...image, isFavorite: true };
            } catch (error) {
              console.error(
                `ID ${id}인 이미지를 불러오는 중 오류 발생:`,
                error,
              );
              return null;
            }
          }),
        );

        // null이 아닌 이미지만 필터링
        const validMissingImages = missingImages.filter(
          (img) => img !== null,
        ) as GalleryImage[];

        if (validMissingImages.length > 0) {
          // 새 이미지를 상태에 추가
          addImages(validMissingImages);

          // 새 이미지 렌더링
          this.renderFavoritesImages(validMissingImages);
        }

        // 누락된 이미지를 가져오지 못한 경우
        if (
          validMissingImages.length < missingFavoriteIds.length &&
          loadedFavorites.length === 0
        ) {
          this.showError("일부 즐겨찾기 이미지를 불러오지 못했습니다.");
        }
      }

      // 즐겨찾기 이미지가 하나도 렌더링되지 않은 경우
      if (
        loadedFavorites.length === 0 &&
        this.imageGrid.children.length === 0
      ) {
        this.imageGrid.innerHTML =
          "<p class='no-favorites'>즐겨찾기 이미지를 불러올 수 없습니다.</p>";
      }
    } catch (error) {
      console.error("즐겨찾기 이미지를 불러오는 중 오류 발생:", error);
      this.showError(
        "즐겨찾기 이미지를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.",
      );
    } finally {
      this.loading = false;
      setLoading(false);
    }
  };

  private updateFromState = (state: any): void => {
    console.log(state, "STATE!!");
    const loader = this.element.querySelector(".loader");
    if (state.loading) {
      if (loader)
        loader.setAttribute(
          "style",
          "display: flex; justify-content: center; align-items: center;",
        );
    } else {
      if (loader) loader.setAttribute("style", "display: none;");
    }

    if (state.error) {
      this.showError(state.error);
    }
  };

  private renderFavoritesImages = (images: GalleryImage[]): void => {
    images.forEach((image) => {
      const card = new ImageCard(image).getElement();
      this.imageGrid.appendChild(card);
    });
  };

  private showError = (message: string): void => {
    const errorElement = document.createElement("div");

    errorElement.className = "error";
    errorElement.textContent = message;
    this.element.append(errorElement);

    setTimeout(() => {
      if (errorElement) {
        errorElement.remove();
      }
    }, 3000);
  };

  public destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  public getElement(): HTMLElement {
    return this.element;
  }
}

export const createFavoritesPage = (): HTMLElement => {
  return new FavoritePage().getElement();
};
