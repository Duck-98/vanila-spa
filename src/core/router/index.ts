import type { Route } from "../../types/route.type";

export class Router {
  private routes: Route[] = []; // 전체 라우트 목록
  private root: HTMLElement; // 렌더링 될 돔 요소
  private notFoundComponent: () => HTMLElement; // 404 페이지 컴포넌트
  private currentComponent: HTMLElement | null = null; // 현재 렌더링 된 컴포넌트

  /**
   * 라우터 초기화
   * @param root 라우터가 컴포넌트를 렌더링할 루트 요소
   * @param notFoundComponent 404 페이지 컴포넌트
   */
  constructor(root: HTMLElement, notFoundComponent: () => HTMLElement) {
    this.root = root;
    this.notFoundComponent = notFoundComponent;

    // 페이지 로드 시 현재 URL에 맞는 컴포넌트 렌더링
    window.addEventListener(
      "DOMContentLoaded",
      this.handleRouteChange.bind(this),
    );

    // 브라우저 앞으로/뒤로 가기 지원
    window.addEventListener("popstate", this.handleRouteChange.bind(this));

    // 모든 a 태그 클릭 이벤트를 가로채서 SPA 내비게이션 처리
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (
        anchor &&
        anchor.href &&
        !anchor.getAttribute("target") &&
        anchor.origin === window.location.origin
      ) {
        e.preventDefault();
        this.navigate(anchor.pathname);
      }
    });
  }

  /**
   * 라우트 추가
   * @param path URL 경로
   * @param component 해당 경로에서 렌더링할 컴포넌트
   * @param exact 정확한 경로 일치 여부
   */
  addRoute(
    path: string,
    component: () => HTMLElement | Promise<HTMLElement>,
    exact: boolean = false,
  ): void {
    this.routes.push({ path, component, exact });
  }

  /**
   * 새 URL로 이동
   * @param path 이동할 경로
   */
  navigate(path: string): void {
    window.history.pushState(null, "", path);
    this.handleRouteChange();
  }

  /**
   * 라우트 변경 처리
   */
  private async handleRouteChange(): Promise<void> {
    const path = window.location.pathname;

    // 현재 경로에 맞는 라우트 찾기
    const route = this.findMatchingRoute(path);

    // 이전 컴포넌트 제거
    if (this.currentComponent && this.root.contains(this.currentComponent)) {
      // 삭제 메서드가 있으면 호출 (이벤트 리스너 정리 등)
      const componentAny = this.currentComponent as any;
      if (componentAny.destroy && typeof componentAny.destroy === "function") {
        componentAny.destroy();
      }
      this.root.removeChild(this.currentComponent);
    }

    // 새 컴포넌트 렌더링
    try {
      // 비동기 컴포넌트 지원
      const component = await route.component();
      this.currentComponent = component;
      this.root.appendChild(component);

      // 페이지 상단으로 스크롤
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("라우트 렌더링 중 오류 발생:", error);
      this.currentComponent = this.notFoundComponent();
      this.root.appendChild(this.currentComponent);
    }
  }

  /**
   * 현재 경로에 맞는 라우트 찾기
   * @param path 현재 URL 경로
   * @returns 일치하는 라우트 또는 404 라우트
   */
  private findMatchingRoute(path: string): Route {
    // 정확히 일치하는 라우트 먼저 찾기
    const exactRoute = this.routes.find(
      (route) => route.exact && route.path === path,
    );

    if (exactRoute) {
      return exactRoute;
    }

    // 경로 패턴 일치하는 라우트 찾기
    const matchingRoute = this.routes.find((route) => {
      if (route.exact) {
        return false;
      }

      // 간단한 경로 매칭 (파라미터 지원)
      // 예: /images/:id 형태의 패턴 지원
      const routeParts = route.path.split("/").filter(Boolean);
      const pathParts = path.split("/").filter(Boolean);

      if (routeParts.length !== pathParts.length) {
        return false;
      }

      return routeParts.every((part, i) => {
        return part.startsWith(":") || part === pathParts[i];
      });
    });

    // 일치하는 라우트가 없으면 NotFound 라우트 반환
    return (
      matchingRoute || {
        path: "*",
        component: this.notFoundComponent,
      }
    );
  }

  /**
   * 현재 URL에서 파라미터 추출
   * @param paramName 파라미터 이름
   * @returns 파라미터 값
   */
  getParam(paramName: string): string | null {
    const path = window.location.pathname;
    const currentRoute = this.findMatchingRoute(path);

    if (!currentRoute || currentRoute.path === "*") {
      return null;
    }

    const routeParts = currentRoute.path.split("/").filter(Boolean);
    const pathParts = path.split("/").filter(Boolean);

    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i];
      if (routePart.startsWith(":") && routePart.substring(1) === paramName) {
        return pathParts[i];
      }
    }

    return null;
  }

  /**
   * URL 쿼리 파라미터 가져오기
   * @param name 쿼리 파라미터 이름
   * @returns 쿼리 파라미터 값
   */
  getQueryParam(name: string): string | null {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }
}

// 라우터 인스턴스 생성 및 내보내기
let routerInstance: Router | null = null;

/**
 * 라우터 초기화
 * @param root 라우터가 컴포넌트를 렌더링할 루트 요소
 * @param notFoundComponent 404 페이지 컴포넌트
 * @returns 라우터 인스턴스
 */
export const initRouter = (
  root: HTMLElement,
  notFoundComponent: () => HTMLElement,
): Router => {
  if (!routerInstance) {
    routerInstance = new Router(root, notFoundComponent);
  }
  return routerInstance;
};

/**
 * 라우터 인스턴스 가져오기
 * @returns 라우터 인스턴스
 */
export const getRouter = (): Router | null => {
  return routerInstance;
};
