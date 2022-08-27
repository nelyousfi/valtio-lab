import { useCallback, useSyncExternalStore } from "react";
import { SNAPSHOT, subscribe } from "./valtio";

type Snapshot<T> = T;

export const useSnapshot = <T extends object>(proxyObject: T): T => {
  return useSyncExternalStore(
    useCallback((callback) => subscribe(proxyObject, callback), [proxyObject]),
    () => snapshot(proxyObject)
  );
};

const snapshot = <T extends object>(proxyObject: T): Snapshot<T> => {
  return (proxyObject as any)[SNAPSHOT];
};
