// 라우터에서 사용할 라우트 정의
export interface Route {
  path: string;
  component: () => HTMLElement | Promise<HTMLElement>;
  exact?: boolean;
}
