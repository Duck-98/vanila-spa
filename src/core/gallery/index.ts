import { GalleryState } from "../../types/state.type";
import { createStore } from "../store";
import { galleryState } from "./initialState";

// 갤러리 스토어 생성
export const galleryStore = createStore<GalleryState>(galleryState);
