import type { ImageData } from "../types/image.type";

const BASE_URL = "https://picsum.photos/v2";
const LIMIT = 10; // 한 페이지당 이미지 수

/**
 * Lorem Picsum API에서 이미지 목록을 가져오는 함수
 * @param page 페이지 번호
 * @param limit 한 페이지당 이미지 수
 * @returns Promise<ImageData[]> 이미지 데이터 배열
 */
export const fetchImages = async (
  page: number = 1,
  limit: number = LIMIT,
): Promise<ImageData[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/list?page=${page}&limit=${limit}`,
    );

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("이미지를 가져오는 중 오류 발생:", error);
    throw error;
  }
};

/**
 * 특정 ID의 이미지 정보를 가져오는 함수
 * @param id 이미지 ID
 * @returns Promise<ImageData> 이미지 데이터
 */
export const fetchImageById = async (id: string): Promise<ImageData> => {
  try {
    // Lorem Picsum API는 단일 이미지 조회 엔드포인트가 없으므로
    // 모든 이미지를 가져와서 ID로 필터링
    const response = await fetch(`${BASE_URL}/list?page=1&limit=100`);

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    const images: ImageData[] = await response.json();
    const image = images.find((img) => img.id === id);

    if (!image) {
      throw new Error(`ID ${id}인 이미지를 찾을 수 없습니다`);
    }

    return image;
  } catch (error) {
    console.error("이미지를 가져오는 중 오류 발생:", error);
    throw error;
  }
};
