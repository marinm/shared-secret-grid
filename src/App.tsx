import "./App.css";
import { useState, useEffect } from "react";
import { useEasyWebSocket } from "./hooks/useEasyWebSocket";
import type { EasyWebSocketEvent, Message } from "./hooks/useEasyWebSocket";
import Grid from "./components/Grid";

const SERVER_URL = "https://marinm.net/broadcast";
const N_ROWS = 6;
const N_COLS = 7;

function valid(message: Message): boolean {
  return true;
}

function onMessage(event: EasyWebSocketEvent): void {
  console.log(event);
}

function App() {
  const socket = useEasyWebSocket({ valid });
  const [code, setCode] = useState<number[]>([]);

  function onSelectedChange(numbers: number[]) {
    setCode([...numbers]);
  }

  useEffect(() => {
    if (code.length === 4) {
      const channel = `shared-secret-grid-${code.join("-")}`;
      const url = `${SERVER_URL}?channel=${channel}`;
      socket.close();
      socket.listen(onMessage);
      socket.open(url);
    } else {
      socket.close();
    }

    return () => {
      socket.close();
    };
  }, [code]);

  return (
    <>
      <div className="w-full flex flex-col justify-center items-center gap-4">
        <h1>Shared secret grid</h1>
        <Grid
          rows={N_ROWS}
          columns={N_COLS}
          onSelectedChange={onSelectedChange}
        />
        <p>
          {socket.readyState === WebSocket.OPEN ? "Connected" : "Not connected"}
        </p>
      </div>
    </>
  );
}

export default App;
