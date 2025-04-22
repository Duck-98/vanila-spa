import type { ImageData } from "../types/image.type";
import { capitalizeFirstLetter } from "../utils/string";

const BASE_URL = "https://pokeapi.co/api/v2";
const LIMIT = 20; // 한 페이지당 포켓몬 수

/**
 * PokéAPI에서 포켓몬 목록을 가져오는 함수
 * @param page 페이지 번호 (offset 계산에 사용됨)
 * @param limit 한 페이지당 포켓몬 수
 * @returns Promise<ImageData[]> 이미지 데이터 배열 형식으로 변환된 포켓몬 데이터
 */
export const fetchImages = async (
  page: number = 1,
  limit: number = LIMIT,
): Promise<ImageData[]> => {
  try {
    // 페이지를 offset으로 변환 (PokéAPI는 offset 기반 페이징 사용)
    const offset = (page - 1) * limit;

    // 포켓몬 목록 가져오기
    const listResponse = await fetch(
      `${BASE_URL}/pokemon?offset=${offset}&limit=${limit}`,
    );

    if (!listResponse.ok) {
      throw new Error(`API 오류: ${listResponse.status}`);
    }

    const listData = await listResponse.json();

    // 각 포켓몬의 상세 정보 가져오기
    const pokemonDetailsPromises = listData.results.map(
      async (pokemon: any) => {
        const detailResponse = await fetch(pokemon.url);
        if (!detailResponse.ok) {
          return null;
        }
        return await detailResponse.json();
      },
    );

    const pokemonDetails = await Promise.all(pokemonDetailsPromises);

    // 포켓몬 데이터를 ImageData 형식으로 변환
    return pokemonDetails
      .filter((pokemon) => pokemon !== null)
      .map((pokemon) => ({
        id: pokemon.id.toString(),
        author: capitalizeFirstLetter(pokemon.name),
        width: 600,
        height: 600,
        url: pokemon.species.url,
        download_url:
          pokemon.sprites.other["official-artwork"].front_default ||
          pokemon.sprites.front_default,
      }));
  } catch (error) {
    console.error("포켓몬 데이터를 가져오는 중 오류 발생:", error);
    throw error;
  }
};

/**
 * 특정 ID의 포켓몬 정보를 가져오는 함수
 * @param id 포켓몬 ID
 * @returns Promise<ImageData> 이미지 데이터 형식으로 변환된 포켓몬 데이터
 */
export const fetchImageById = async (id: string): Promise<ImageData> => {
  try {
    // 포켓몬 ID로 직접 조회 (PokéAPI는 직접 ID 조회 지원)
    const response = await fetch(`${BASE_URL}/pokemon/${id}`);

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    const pokemon = await response.json();

    // 포켓몬 데이터를 ImageData 형식으로 변환
    return {
      id: pokemon.id.toString(),
      author: capitalizeFirstLetter(pokemon.name),
      width: 600,
      height: 600,
      url: pokemon.species.url,
      download_url:
        pokemon.sprites.other["official-artwork"].front_default ||
        pokemon.sprites.front_default,
    };
  } catch (error) {
    console.error(`ID ${id}인 포켓몬을 가져오는 중 오류 발생:`, error);
    throw error;
  }
};

/**
 * 포켓몬의 추가 정보를 가져오는 함수
 * @param id 포켓몬 ID
 * @returns Promise<any> 포켓몬 종 정보
 */
export const fetchPokemonSpecies = async (id: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/pokemon-species/${id}`);

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`ID ${id}인 포켓몬 종 정보를 가져오는 중 오류 발생:`, error);
    throw error;
  }
};
