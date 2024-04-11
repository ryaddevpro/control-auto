import { createStore } from "zustand/vanilla";

export const initCounterStore = () => {
  return { count: new Date().getFullYear() };
};

export const defaultInitState = {
  count: 0,
};

export const createCounterStore = (initState = defaultInitState) => {
  return createStore((set) => ({
    ...initState,
    decrementCount: () => set((state) => ({ count: state.count - 1 })),
    incrementCount: () => set((state) => ({ count: state.count + 1 })),
  }));
};
