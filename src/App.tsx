import "./App.css";
import { useState } from "react";

import Grid from "./components/Grid";
import Connection from "./components/Connection";

const N_ROWS = 6;
const N_COLS = 7;

function App() {
  const [code, setCode] = useState<number[]>([]);

  return (
    <>
      <div className="w-full flex flex-col justify-center items-center gap-4">
        <h1>Shared secret grid</h1>
        <Grid rows={N_ROWS} columns={N_COLS} onSelectedChange={setCode} />
        <Connection code={code} />
      </div>
    </>
  );
}

export default App;
