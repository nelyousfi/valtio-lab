const LISTENERS = Symbol();
export const SNAPSHOT = Symbol();

type Listener = () => void;

let globalVersion = 1;
const snapshotCache = new WeakMap<
  object,
  [version: number, snapshot: unknown]
>();

export const proxy = <T extends object>(initialObject: T): T => {
  const baseObject = Object.create(Object.getPrototypeOf(initialObject));
  const listeners = new Set<Listener>();
  let version = globalVersion;

  const notifyUpdate = (nextVersion = ++globalVersion) => {
    if (version !== nextVersion) {
      version = nextVersion;
      listeners.forEach((listener) => listener());
    }
  };

  const createSnapshot = <T extends object>(
    target: T,
    receiver: () => void
  ) => {
    const cache = snapshotCache.get(receiver);
    if (cache?.[0] === version) {
      return cache[1];
    }
    const snapshot = Object.create(Object.getPrototypeOf(target));
    snapshotCache.set(receiver, [version, snapshot]);
    Reflect.ownKeys(target).forEach((key) => {
      snapshot[key] = Reflect.get(target, key, receiver);
    });
    return snapshot;
  };
  const handler = {
    get(target: T, prop: string | symbol, receiver: any) {
      if (prop === LISTENERS) {
        return listeners;
      } else if (prop === SNAPSHOT) {
        return createSnapshot(target, receiver);
      }
      return Reflect.get(target, prop, receiver);
    },
    set(target: T, prop: string, value: any, receiver: any) {
      Reflect.set(target, prop, value, receiver);
      notifyUpdate();
      return true;
    },
  };
  const proxyObject = new Proxy(baseObject, handler);
  Reflect.ownKeys(initialObject).forEach((key) => {
    const desc = Object.getOwnPropertyDescriptor(
      initialObject,
      key
    ) as PropertyDescriptor;
    if (desc.get || desc.set || !desc.writable) {
      Object.defineProperty(baseObject, key, desc);
    } else {
    }
    proxyObject[key] = initialObject[key as keyof T];
  });
  return proxyObject;
};

export const subscribe = <T extends object>(
  proxyObject: T,
  callback: () => void
) => {
  const listener = () => {
    callback();
  };
  (proxyObject as any)[LISTENERS].add(listener);

  return () => (proxyObject as any)[LISTENERS].delete(listener);
};
