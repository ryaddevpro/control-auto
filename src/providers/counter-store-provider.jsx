"use client";

import React, { createContext, useRef, useContext } from "react";
import { useStore } from "zustand";

import { createCounterStore, initCounterStore } from "@/stores/counter-store";

export const CounterStoreContext = createContext(null);

export const CounterStoreProvider = ({ children }) => {
  const storeRef = useRef(null);
  if (!storeRef.current) {
    storeRef.current = createCounterStore(initCounterStore());
  }

  return (
    <CounterStoreContext.Provider value={storeRef.current}>
      {children}
    </CounterStoreContext.Provider>
  );
};

export const useCounterStore = (selector) => {
  const counterStoreContext = useContext(CounterStoreContext);

  if (!counterStoreContext) {
    throw new Error("useCounterStore must be used within CounterStoreProvider");
  }

  return useStore(counterStoreContext, selector);
};
