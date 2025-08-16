import "./App.css";
import Grid from "./components/Grid";

const N_ROWS = 6;
const N_COLS = 7;

function App() {
  return (
    <>
      <div className="w-full flex flex-col justify-center items-center gap-4">
        <h1>Shared secret grid</h1>
        <Grid rows={N_ROWS} columns={N_COLS} />
      </div>
    </>
  );
}

export default App;
