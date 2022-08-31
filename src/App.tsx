import React from "react";
import { proxy, useSnapshot } from "./valtio";
// import { proxy, useSnapshot } from "valtio";

const state = {
  count: 0,
  owner: {
    info: {
      name: "Naoufal",
    },
  },
  get bar() {
    return "Hello, I am bar";
  },
};
Object.setPrototypeOf(state, {
  print(from: string) {
    // @ts-ignore
    console.log(`the value is ${this.count} from ${from}`);
  },
});

const store = proxy(state);

const Component1 = () => {
  const snap = useSnapshot(store);

  console.log("Component1 is rendering ...");

  return (
    <>
      <button
        onClick={() => {
          store.count++;
        }}
      >
        {snap.count}
      </button>
      <p>{snap.owner.info.name}</p>
      <p>{snap.bar}</p>
    </>
  );
};

const Component2 = () => {
  const info = useSnapshot(store.owner.info);

  console.log("Component2 is rendering ...");

  return <p style={{ fontWeight: "bold" }}>{info.name}</p>;
};

const App = () => {
  return (
    <>
      <Component1 />
      <Component2 />
    </>
  );
};

export default App;
