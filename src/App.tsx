import React from "react";
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

  return (
    <>
      <button onClick={() => store.count++}>{snap.count}</button>
      <p>{snap.owner.info.name}</p>
      <p>{snap.bar}</p>
    </>
  );
}

export default App;
