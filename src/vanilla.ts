export const LISTENERS = Symbol();
export const SNAPSHOT = Symbol();

type Listener = () => void;

let globalVersion = 1;
const snapshotCache = new WeakMap<
  object,
  [version: number, snapshot: unknown]
>();

const isObject = (x: unknown): x is object =>
  typeof x === "object" && x !== null;

const canProxy = (x: unknown) =>
  isObject(x) &&
  (Array.isArray(x) || !(Symbol.iterator in x)) &&
  !(x instanceof WeakMap) &&
  !(x instanceof WeakSet) &&
  !(x instanceof Error) &&
  !(x instanceof Number) &&
  !(x instanceof Date) &&
  !(x instanceof String) &&
  !(x instanceof RegExp) &&
  !(x instanceof ArrayBuffer);

export const proxy = <T extends object>(initialObject: T): T => {
  if (!isObject(initialObject)) {
    throw new Error("object required!");
  }

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

  const propListeners = new Map<string | symbol, Listener>();
  const getPropListener = (prop: string | symbol) => {
    let propListener = propListeners.get(prop);
    if (!propListener) {
      propListener = () => {
        notifyUpdate();
      };
      propListeners.set(prop, propListener);
    }
    return propListener;
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
    canProxy,
    is: Object.is,
    set(target: T, prop: string, value: any, receiver: any) {
      const hasPrevValue = Reflect.has(target, prop);
      const prevValue = Reflect.get(target, prop, receiver);
      if (hasPrevValue && this.is(prevValue, value)) {
        return true;
      }
      let nextValue: any;
      if (value?.[LISTENERS]) {
        nextValue = value;
        nextValue[LISTENERS].add(getPropListener(prop));
      } else if (this.canProxy(value)) {
        nextValue = proxy(value);
        const listener = getPropListener(prop);
        nextValue[LISTENERS].add(listener);
      } else {
        nextValue = value;
      }
      Reflect.set(target, prop, nextValue, receiver);
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
