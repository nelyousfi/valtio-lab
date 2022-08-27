export const proxy = <T extends object>(initialObject: T): T => {
  const baseObject = Object.create(Object.getPrototypeOf(initialObject));
  const handler = {
    get(target: T, prop: string, receiver: any) {
      return Reflect.get(target, prop, receiver);
    },
    set(target: T, prop: string, value: any, receiver: any) {
      Reflect.set(target, prop, value, receiver);
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
