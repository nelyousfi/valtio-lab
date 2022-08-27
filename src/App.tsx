import React, { useReducer } from "react";
// import { proxy, useSnapshot } from "valtio";
import { proxy, useSnapshot } from "./valtio";

const state = {
  count: 0,
  owner: {
    info: {
      name: "Naoufal",
    },
  },
  users: new Map(),
  get bar() {
    return "Hello, I am bar";
  },
};
Object.setPrototypeOf(state, {
  print(from: string) {
    console.log(`the value is ${state.count} from ${from}`);
  },
});

const store = proxy(state);

function App() {
  const snap = useSnapshot(store);

  const [, render] = useReducer((x) => x + 1, 0);

  return (
    <>
      <button
        onClick={() => {
          // @ts-ignore
          store.bar = "I am another value";
          store.count++;
          render();
        }}
      >
        {snap.count}
      </button>
      <p>{snap.owner.info.name}</p>
      <p>{snap.bar}</p>
    </>
  );
}

export default App;
