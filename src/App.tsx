import React from "react";
// import { proxy, useSnapshot } from "./valtio";
import { proxy, useSnapshot } from "valtio";

const state2 = {
  hello: "world!",
};
const store2 = proxy(state2);

const state = {
  count: 0,
  owner: {
    info: {
      name: "Naoufal",
    },
  },
  value2: store2,
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

  return (
    <>
      <button
        onClick={() => {
          store.value2.hello = "world!, but changed";
          store.count = 1;
        }}
      >
        {snap.count}
      </button>
      <p>{snap.owner.info.name}</p>
      <p>{snap.bar}</p>
      <p>{snap.value2.hello}</p>
    </>
  );
};

const Component2 = () => {
  const snap2 = useSnapshot(store2);

  return <p style={{ fontWeight: "bold" }}>{snap2.hello}</p>;
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
