import { getRouter } from "../../core/router";

export class Header {
  private element: HTMLElement;

  constructor() {
    this.element = document.createElement("header");
    this.element.className = "header";
    this.render();
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="header-container">
        <a href="/" class="logo">Infinite Gallery</a>
        <nav class="nav">
          <a href="/" class="nav-link" data-link>홈</a>
          <a href="/favorites" class="nav-link" data-link>즐겨찾기</a>
        </nav>
      </div>
    `;

    // 내비게이션 링크 클릭 이벤트 처리
    this.element.querySelectorAll("[data-link]").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const href = (link as HTMLAnchorElement).getAttribute("href");
        if (href) {
          const router = getRouter();
          router?.navigate(href);
        }
      });
    });

    // 현재 활성 링크 표시
    this.updateActiveLink();
  }

  private updateActiveLink(): void {
    const path = window.location.pathname;

    this.element.querySelectorAll(".nav-link").forEach((link) => {
      const href = (link as HTMLAnchorElement).getAttribute("href");
      if (href === path || (href === "/" && path === "")) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  public getElement(): HTMLElement {
    return this.element;
  }
}

// 헤더 인스턴스 생성 및 내보내기 함수
let headerInstance: Header | null = null;

export const initHeader = (): HTMLElement => {
  if (!headerInstance) {
    headerInstance = new Header();
  }
  return headerInstance.getElement();
};
