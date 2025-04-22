import { toggleFavorite } from "../../core/gallery/actions";
import { getRouter } from "../../core/router";
import { GalleryImage } from "../../types/image.type";
import { getPokemonImageUrl, lazyLoadImage } from "../../utils/imageLoader";

export class ImageCard {
  private image: GalleryImage;
  private element: HTMLElement;

  constructor(image: GalleryImage) {
    this.image = image;
    this.element = document.createElement("div");
    this.element.className = "image-card fade-in";
    this.render();
  }

  private render(): void {
    this.element.innerHTML = `
    <div class="image-card__img-container">
      <img class="image-card__img" alt="${this.image.author} 포켓몬" />
    </div>
    <div class="image-card__info">
      <h3 class="image-card__title">${this.image.author}</h3>
      <p class="image-card__author">ID: ${this.image.id}</p>
      <div class="image-card__actions">
        <button class="favorite-btn ${this.image.isFavorite ? "active" : ""}">
          ${this.image.isFavorite ? "★" : "☆"}
        </button>
        <a href="/pokemon/${
          this.image.id
        }" class="view-details-btn" data-link>상세보기</a>
      </div>
    </div>
  `;

    // 이미지 지연 로딩 적용
    const imgElement = this.element.querySelector(
      ".image-card__img",
    ) as HTMLImageElement;
    if (imgElement) {
      const optimizedUrl = getPokemonImageUrl(this.image.id);
      lazyLoadImage(imgElement, optimizedUrl);
    }

    // 즐겨찾기 버튼 클릭 이벤트
    const favoriteBtn = this.element.querySelector(".favorite-btn");
    if (favoriteBtn) {
      favoriteBtn.addEventListener(
        "click",
        this.handleFavoriteClick.bind(this),
      );
    }

    // 상세보기 링크 클릭 이벤트
    const detailsLink = this.element.querySelector("[data-link]");
    if (detailsLink) {
      detailsLink.addEventListener("click", (e) => {
        e.preventDefault();
        const href = (detailsLink as HTMLAnchorElement).getAttribute("href");
        if (href) {
          const router = getRouter();
          router?.navigate(href);
        }
      });
    }
  }

  private handleFavoriteClick(): void {
    toggleFavorite(this.image.id);

    // UI 업데이트
    const favoriteBtn = this.element.querySelector(".favorite-btn");
    if (favoriteBtn) {
      this.image.isFavorite = !this.image.isFavorite;
      favoriteBtn.textContent = this.image.isFavorite ? "★" : "☆";
      favoriteBtn.classList.toggle("active", this.image.isFavorite);
    }
  }

  public getElement(): HTMLElement {
    return this.element;
  }
}
