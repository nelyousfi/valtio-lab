import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { createProxy, isChanged } from "proxy-compare";
import { SNAPSHOT, subscribe } from "./valtio";

type Snapshot<T> = T;

export const useSnapshot = <T extends object>(proxyObject: T): T => {
  const lastSnapshot = useRef<Snapshot<T>>();
  const lastAffected = useRef(new WeakMap<WeakMap<object, unknown>>());
  const currentSnapshot = useSyncExternalStore(
    useCallback((callback) => subscribe(proxyObject, callback), [proxyObject]),
    () => {
      const nextSnapshot = snapshot(proxyObject);
      if (
        lastSnapshot.current &&
        lastAffected.current &&
        !isChanged(lastSnapshot, nextSnapshot, lastAffected.current)
      ) {
        return lastSnapshot.current;
      }
      return nextSnapshot;
    }
  );

  const currentAffected = new WeakMap();

  useEffect(() => {
    lastSnapshot.current = currentSnapshot;
    lastAffected.current = currentAffected;
  });

  return createProxy(currentSnapshot, currentAffected);
};

const snapshot = <T extends object>(proxyObject: T): Snapshot<T> => {
  return (proxyObject as any)[SNAPSHOT];
};
