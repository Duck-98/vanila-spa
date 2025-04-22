/**
 * Intersection Observer API를 사용하여 이미지를 지연 로딩하는 함수
 * @param imgElement 이미지 요소
 * @param src 이미지 소스 URL
 */
export const lazyLoadImage = (
  imgElement: HTMLImageElement,
  src: string,
): void => {
  // 기본 로딩 이미지 설정 (포켓볼 SVG로 변경하면 더 좋을 것 같습니다)
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
 * 포켓몬 이미지 URL을 가져오는 함수
 * @param id 포켓몬 ID
 * @returns 포켓몬 이미지 URL
 */
export const getPokemonImageUrl = (id: string): string => {
  // 포켓몬 API의 공식 아트워크 이미지 URL 형식 사용
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
};
