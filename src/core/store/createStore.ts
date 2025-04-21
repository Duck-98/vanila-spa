export interface Store<T> {
  getState: () => T;
  setState: (action: (state: T) => T) => void;
  subscribe: (listener: (state: T) => void) => () => void;
}

/**
 * 간단한 상태 관리 스토어 생성 함수
 * @param initialState 초기 상태
 * @returns Store 객체
 */
export const createStore = <T>(initialState: T): Store<T> => {
  let state = initialState;
  const listeners: ((state: T) => void)[] = [];

  const getState = (): T => state;

  const setState = (action: (state: T) => T): void => {
    state = action(state);
    // 상태 변경 후 모든 리스너에게 통지
    listeners.forEach((listener) => listener(state));
  };

  const subscribe = (listener: (state: T) => void): (() => void) => {
    listeners.push(listener);
    // 구독 취소 함수 반환
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  };

  return { getState, setState, subscribe };
};
