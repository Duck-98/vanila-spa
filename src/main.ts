import "./styles/main.css";
import "./styles/components.css";
import { initRouter, getRouter } from "./core/router";
import { initHeader } from "./components/common/header";
import { createHomePage } from "./pages/home-page";
import { createDetailPage } from "./pages/detail-page";

// 404 페이지 컴포넌트
const NotFoundPage = (): HTMLElement => {
  const element = document.createElement("div");
  element.className = "not-found container";
  element.innerHTML = `
    <h1>404</h1>
    <p>페이지를 찾을 수 없습니다.</p>
    <a href="/" data-link>홈으로 돌아가기</a>
  `;

  // 링크 클릭 이벤트 처리
  const link = element.querySelector("[data-link]");
  if (link) {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const href = (link as HTMLAnchorElement).getAttribute("href");
      if (href) {
        const router = getRouter();
        router?.navigate(href);
      }
    });
  }

  return element;
};

// 앱 초기화 함수
const initApp = (): void => {
  // 헤더 초기화
  const headerContainer = document.getElementById("app-header");
  if (headerContainer) {
    headerContainer.appendChild(initHeader());
  }

  // 라우터 초기화
  const appContainer = document.getElementById("app-root");
  if (!appContainer) return;

  const router = initRouter(appContainer, NotFoundPage);

  // 라우트 등록
  router.addRoute("/", createHomePage, true);
  // 나중에 다음과 같은 추가 라우트를 등록할 수 있습니다:
  router.addRoute("/image/:id", createDetailPage);
  // router.addRoute('/favorites', createFavoritesPage);
};

// 앱 시작
document.addEventListener("DOMContentLoaded", initApp);
