/**
 * Intersection Observer API를 사용하여 이미지를 지연 로딩하는 함수
 * @param imgElement 이미지 요소
 * @param src 이미지 소스 URL
 */
export const lazyLoadImage = (
  imgElement: HTMLImageElement,
  src: string,
): void => {
  // 기본 로딩 이미지 설정
  imgElement.src =
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg' viewBox%3D'0 0 300 200'%2F%3E";

  // Intersection Observer 생성
  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = src;
          img.onload = () => {
            img.classList.add("loaded");
          };
          observer.unobserve(img);
        }
      });
    },
    {
      rootMargin: "100px 0px", // 이미지가 뷰포트에 들어오기 100px 전에 로딩 시작
      threshold: 0.01,
    },
  );

  observer.observe(imgElement);
};

/**
 * 이미지 최적화된 URL을 생성하는 함수
 * @param id 이미지 ID
 * @param width 원하는 너비
 * @param height 원하는 높이
 * @returns 최적화된 이미지 URL
 */
export const getOptimizedImageUrl = (
  id: string,
  width: number = 300,
  height: number = 200,
): string => {
  return `https://picsum.photos/id/${id}/${width}/${height}`;
};
